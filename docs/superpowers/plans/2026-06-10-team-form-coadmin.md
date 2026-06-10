# Team-Form Co-Admin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permettre au propriétaire d'une équipe team-form d'inviter un co-administrateur (par email ou lien copié) qui peut gérer l'équipe (ajouter membres, envoyer invitations) mais ne peut pas la supprimer.

**Architecture:** Deux nouvelles colonnes dans `surveys` (`co_admin_token TEXT`, `co_admin_user_ids JSONB`). L'invitation génère un lien `?coadmin=<token>`. Le co-admin clique le lien → s'il est authentifié, `tf_claim_coadmin` stocke son `user_id` dans `co_admin_user_ids` et retourne les données du survey. Son équipe est sauvée en localStorage avec `is_coadmin: true`. Il accède au dashboard via des RPCs co-admin dédiées. Côté JS, `TF.isCoadmin = true` masque le bouton "Supprimer l'équipe" dans la liste d'équipes.

**Tech Stack:** Vanilla JS ES6+, Supabase RPC + auth, localStorage, Netlify Functions (Brevo), HTML/CSS inline, `js/team-form-i18n.js` (fr + en)

---

## Fichiers touchés

| Fichier | Action |
|---|---|
| `supabase/migrations/20260610130000_tf_coadmin.sql` | Créer — colonnes, table, 7 nouvelles RPCs |
| `netlify/functions/send-email.js` | Modifier — ajouter type `coadmin_invite` |
| `js/team-form-i18n.js` | Modifier — 12 nouvelles clés (fr + en) |
| `team-form.html` | Modifier — 2 nouvelles modales + CSS |
| `js/team-form.js` | Modifier — TF objet, init flow, dashboard section, teams list |

---

## Task 1 : Migration Supabase — Schéma + RPCs co-admin

**Files:**
- Create: `supabase/migrations/20260610130000_tf_coadmin.sql`

- [ ] **Step 1 : Créer le fichier de migration**

```sql
-- ── CO-ADMIN : SCHÉMA ──

-- Colonnes co-admin dans surveys
ALTER TABLE surveys
  ADD COLUMN IF NOT EXISTS co_admin_token TEXT UNIQUE DEFAULT gen_random_uuid()::text,
  ADD COLUMN IF NOT EXISTS co_admin_user_ids JSONB DEFAULT '[]'::jsonb;

-- Suivi des emails invités (pour affichage dans le dashboard)
CREATE TABLE IF NOT EXISTS co_admin_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID REFERENCES surveys(id) ON DELETE CASCADE,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── CO-ADMIN : RPCs ──

-- Claim : le co-admin appelle cette RPC après login pour lier son user_id au survey
CREATE OR REPLACE FUNCTION tf_claim_coadmin(p_token text)
RETURNS json
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE v_survey surveys%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN json_build_object('error', 'unauthenticated');
  END IF;
  SELECT * INTO v_survey FROM surveys WHERE co_admin_token = p_token LIMIT 1;
  IF NOT FOUND THEN
    RETURN json_build_object('error', 'invalid_token');
  END IF;
  IF v_survey.user_id = auth.uid() THEN
    RETURN json_build_object('error', 'already_owner');
  END IF;
  IF NOT (v_survey.co_admin_user_ids @> to_jsonb(auth.uid()::text)) THEN
    UPDATE surveys
    SET co_admin_user_ids = co_admin_user_ids || to_jsonb(auth.uid()::text)
    WHERE id = v_survey.id;
  END IF;
  RETURN json_build_object(
    'co_admin_token', v_survey.co_admin_token,
    'team_name',      v_survey.team_name,
    'manager_name',   v_survey.manager_name
  );
END;
$$;
GRANT EXECUTE ON FUNCTION tf_claim_coadmin(text) TO authenticated;

-- Dashboard co-admin : même structure que tf_get_dashboard mais sans exposer le token admin
CREATE OR REPLACE FUNCTION tf_get_dashboard_coadmin(p_coadmin_token text)
RETURNS json
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE v_result json;
BEGIN
  IF auth.uid() IS NULL THEN RETURN NULL; END IF;
  SELECT json_build_object(
    'survey', json_build_object(
      'id',              s.id,
      'team_name',       s.team_name,
      'manager_name',    s.manager_name,
      'invite_message',  s.invite_message,
      'relation_labels', s.relation_labels,
      'created_at',      s.created_at
    ),
    'members', COALESCE(
      (SELECT json_agg(m ORDER BY m.created_at) FROM survey_members m WHERE m.survey_id = s.id),
      '[]'::json
    )
  ) INTO v_result
  FROM surveys s
  WHERE s.co_admin_token = p_coadmin_token
    AND (s.co_admin_user_ids @> to_jsonb(auth.uid()::text));
  RETURN v_result;
END;
$$;
GRANT EXECUTE ON FUNCTION tf_get_dashboard_coadmin(text) TO authenticated;

-- Refresh membres (polling) pour co-admin
CREATE OR REPLACE FUNCTION tf_refresh_dashboard_coadmin(p_coadmin_token text)
RETURNS json
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE v_survey_id uuid; v_members json;
BEGIN
  IF auth.uid() IS NULL THEN RETURN NULL; END IF;
  SELECT id INTO v_survey_id FROM surveys
  WHERE co_admin_token = p_coadmin_token
    AND (co_admin_user_ids @> to_jsonb(auth.uid()::text));
  IF v_survey_id IS NULL THEN RETURN NULL; END IF;
  SELECT json_agg(m ORDER BY m.created_at) INTO v_members
  FROM survey_members m WHERE m.survey_id = v_survey_id;
  RETURN COALESCE(v_members, '[]'::json);
END;
$$;
GRANT EXECUTE ON FUNCTION tf_refresh_dashboard_coadmin(text) TO authenticated;

-- Ajout membre pour co-admin
CREATE OR REPLACE FUNCTION tf_add_member_coadmin(p_coadmin_token text, p_member jsonb)
RETURNS json
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE v_survey_id uuid; v_new_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN RETURN NULL; END IF;
  SELECT id INTO v_survey_id FROM surveys
  WHERE co_admin_token = p_coadmin_token
    AND (co_admin_user_ids @> to_jsonb(auth.uid()::text));
  IF v_survey_id IS NULL THEN RETURN NULL; END IF;
  IF p_member->>'first_name' IS NULL OR trim(p_member->>'first_name') = '' THEN
    RETURN NULL;
  END IF;
  INSERT INTO survey_members (survey_id, token, first_name, last_name, email, relation)
  VALUES (
    v_survey_id,
    gen_random_uuid()::text,
    p_member->>'first_name',
    p_member->>'last_name',
    NULLIF(p_member->>'email', ''),
    NULLIF(p_member->>'relation', '')
  )
  RETURNING id INTO v_new_id;
  RETURN (SELECT row_to_json(m) FROM survey_members m WHERE m.id = v_new_id);
END;
$$;
GRANT EXECUTE ON FUNCTION tf_add_member_coadmin(text, jsonb) TO authenticated;

-- Révoquer l'accès co-admin (propriétaire uniquement, via admin token)
CREATE OR REPLACE FUNCTION tf_revoke_coadmin(p_admin_token text)
RETURNS boolean
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE v_survey_id uuid;
BEGIN
  SELECT id INTO v_survey_id FROM surveys WHERE token = p_admin_token LIMIT 1;
  IF v_survey_id IS NULL THEN RETURN false; END IF;
  UPDATE surveys
  SET co_admin_user_ids = '[]'::jsonb,
      co_admin_token = gen_random_uuid()::text
  WHERE id = v_survey_id;
  DELETE FROM co_admin_invitations WHERE survey_id = v_survey_id;
  RETURN true;
END;
$$;
GRANT EXECUTE ON FUNCTION tf_revoke_coadmin(text) TO anon;

-- Enregistrer l'email de l'invitation (pour affichage)
CREATE OR REPLACE FUNCTION tf_save_coadmin_invitation(p_admin_token text, p_email text)
RETURNS boolean
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE v_survey_id uuid;
BEGIN
  SELECT id INTO v_survey_id FROM surveys WHERE token = p_admin_token LIMIT 1;
  IF v_survey_id IS NULL THEN RETURN false; END IF;
  DELETE FROM co_admin_invitations WHERE survey_id = v_survey_id;
  INSERT INTO co_admin_invitations (survey_id, email) VALUES (v_survey_id, p_email);
  RETURN true;
END;
$$;
GRANT EXECUTE ON FUNCTION tf_save_coadmin_invitation(text, text) TO anon;

-- Infos co-admin pour un survey (utilisé pour afficher la section dans le dashboard)
CREATE OR REPLACE FUNCTION tf_get_coadmin_info(p_admin_token text)
RETURNS json
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE v_result json;
BEGIN
  SELECT json_build_object(
    'co_admin_token', s.co_admin_token,
    'invited_email',  ci.email,
    'has_active_coadmin', (jsonb_array_length(s.co_admin_user_ids) > 0)
  ) INTO v_result
  FROM surveys s
  LEFT JOIN co_admin_invitations ci ON ci.survey_id = s.id
  WHERE s.token = p_admin_token
  LIMIT 1;
  RETURN v_result;
END;
$$;
GRANT EXECUTE ON FUNCTION tf_get_coadmin_info(text) TO anon;

-- Mise à jour de tf_get_my_surveys : inclure les surveys co-admin
CREATE OR REPLACE FUNCTION tf_get_my_surveys()
RETURNS json
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE result json;
BEGIN
  SELECT json_agg(
    json_build_object(
      'token',        CASE WHEN s.user_id = auth.uid() THEN s.token ELSE s.co_admin_token END,
      'team_name',    s.team_name,
      'manager_name', s.manager_name,
      'created_at',   s.created_at,
      'is_coadmin',   (s.user_id IS DISTINCT FROM auth.uid())
    ) ORDER BY s.created_at DESC
  ) INTO result
  FROM surveys s
  WHERE s.user_id = auth.uid()
     OR (s.co_admin_user_ids @> to_jsonb(auth.uid()::text));
  RETURN COALESCE(result, '[]'::json);
END;
$$;
GRANT EXECUTE ON FUNCTION tf_get_my_surveys() TO authenticated;
```

- [ ] **Step 2 : Vérifier le fichier**

```bash
cat supabase/migrations/20260610130000_tf_coadmin.sql | head -5
```

Expected: affiche le début du fichier sans erreur.

- [ ] **Step 3 : Appliquer la migration**

```bash
supabase db push
```

Si CLI non disponible : appliquer manuellement via Supabase Dashboard → SQL Editor.

- [ ] **Step 4 : Commit**

```bash
git add supabase/migrations/20260610130000_tf_coadmin.sql
git commit -m "feat(team-form): add co-admin schema and RPCs"
```

---

## Task 2 : Email — Template `coadmin_invite` dans `send-email.js`

**Files:**
- Modify: `netlify/functions/send-email.js`

- [ ] **Step 1 : Ajouter `coadmin_invite` à `VALID_TYPES`**

Trouver :
```js
const VALID_TYPES = ['welcome', 'subscription', 'renewal_reminder', 'anniversary', 'survey_invite'];
```

Remplacer par :
```js
const VALID_TYPES = ['welcome', 'subscription', 'renewal_reminder', 'anniversary', 'survey_invite', 'coadmin_invite'];
```

- [ ] **Step 2 : Ajouter le template dans `buildTemplate`**

Dans la fonction `buildTemplate`, dans l'objet `templates`, après la clé `survey_invite` (ou la dernière clé existante), ajouter :

```js
    coadmin_invite: {
      subject: `Vous avez été nommé co-administrateur d'une équipe Bloomday`,
      text: `Bonjour,\n\n${esc(d.managerName || 'Un manager')} vous invite à co-gérer l'équipe "${esc(d.teamName || '')}" sur Bloomday.\n\nPour accéder à cette équipe, vous avez besoin d'un compte Bloomday. Si vous n'en avez pas encore, créez-en un gratuitement.\n\nAccéder à l'équipe :\n${d.claimUrl || ''}\n\n— L'équipe Bloomday`,
      html: wrap(`
        <h2 style="margin:0 0 8px;color:#5b2d8e;font-size:22px">Vous êtes co-administrateur ! 🤝</h2>
        <p style="color:#444;font-size:15px;line-height:1.6;margin:0 0 16px"><strong>${esc(d.managerName || 'Un manager')}</strong> vous invite à co-gérer l'équipe <strong>"${esc(d.teamName || '')}"</strong> sur <strong>Bloomday</strong>.</p>
        <div style="background:#f9f4ff;border-radius:10px;padding:20px;margin-bottom:24px">
          <p style="margin:0 0 8px;font-weight:bold;color:#5b2d8e">Pour accéder à cette équipe :</p>
          <p style="margin:4px 0;color:#555;font-size:14px">✅ Vous avez besoin d'un compte Bloomday</p>
          <p style="margin:4px 0;color:#555;font-size:14px">✅ Créez-en un gratuitement si vous n'en avez pas</p>
          <p style="margin:4px 0;color:#555;font-size:14px">✅ Puis cliquez le bouton ci-dessous</p>
        </div>
        ${btn('Accéder à l\'équipe →', d.claimUrl || APP_URL)}
        <p style="text-align:center;color:#888;font-size:12px;margin-top:8px">Ce lien est personnel. Ne le partagez pas.</p>
      `)
    },
```

- [ ] **Step 3 : Vérifier la syntaxe**

```bash
node --check netlify/functions/send-email.js
```

Expected: aucune sortie.

- [ ] **Step 4 : Commit**

```bash
git add netlify/functions/send-email.js
git commit -m "feat(email): add coadmin_invite email template"
```

---

## Task 3 : i18n — 12 nouvelles clés dans `team-form-i18n.js`

**Files:**
- Modify: `js/team-form-i18n.js`

- [ ] **Step 1 : Ajouter les clés FR**

Dans `TF_I18N.fr`, trouver :
```js
    tfRemoveSuccess: 'Membre retiré',
```

Ajouter APRÈS :
```js
    tfCoAdmin: 'Co-administrateur',
    tfNoCoAdmin: 'Aucun co-admin pour cette équipe.',
    tfInviteByEmail: 'Inviter par email',
    tfCopyCoAdminLink: 'Copier le lien',
    tfLinkCopied: 'Lien copié !',
    tfRevokeCoAdmin: 'Révoquer',
    tfCoAdminEmailLabel: 'Email du co-admin',
    tfCoAdminInviteSent: 'Invitation envoyée !',
    tfCoAdminClaimTitle: 'Accès co-administrateur',
    tfCoAdminClaimMsg: 'Ce lien vous donne accès à l\'équipe %name en tant que co-administrateur. Connectez-vous ou créez un compte Bloomday pour continuer.',
    tfCoAdminSignIn: 'Se connecter à Bloomday',
    tfCoAdminClaiming: 'Connexion en cours…',
```

- [ ] **Step 2 : Ajouter les clés EN**

Dans `TF_I18N.en`, trouver :
```js
    tfRemoveSuccess: 'Member removed',
```

Ajouter APRÈS :
```js
    tfCoAdmin: 'Co-administrator',
    tfNoCoAdmin: 'No co-admin for this team.',
    tfInviteByEmail: 'Invite by email',
    tfCopyCoAdminLink: 'Copy link',
    tfLinkCopied: 'Link copied!',
    tfRevokeCoAdmin: 'Revoke',
    tfCoAdminEmailLabel: 'Co-admin email',
    tfCoAdminInviteSent: 'Invitation sent!',
    tfCoAdminClaimTitle: 'Co-admin access',
    tfCoAdminClaimMsg: 'This link gives you co-admin access to the team %name. Sign in or create a Bloomday account to continue.',
    tfCoAdminSignIn: 'Sign in to Bloomday',
    tfCoAdminClaiming: 'Connecting…',
```

- [ ] **Step 3 : Vérifier la syntaxe**

```bash
node --check js/team-form-i18n.js
```

Expected: aucune sortie.

- [ ] **Step 4 : Commit**

```bash
git add js/team-form-i18n.js
git commit -m "feat(team-form): add co-admin i18n keys (fr + en)"
```

---

## Task 4 : HTML — 2 nouvelles modales + CSS

**Files:**
- Modify: `team-form.html`

- [ ] **Step 1 : Ajouter `#tf-modal-coadmin` et `#tf-modal-coadmin-invite` au sélecteur CSS**

Trouver :
```css
#tf-modal-qr,#tf-modal-delete,#tf-modal-remove{position:fixed;inset:0;background:rgba(45,27,20,.6);z-index:100;align-items:center;justify-content:center;padding:20px}
```

Remplacer par :
```css
#tf-modal-qr,#tf-modal-delete,#tf-modal-remove,#tf-modal-coadmin,#tf-modal-coadmin-invite{position:fixed;inset:0;background:rgba(45,27,20,.6);z-index:100;align-items:center;justify-content:center;padding:20px}
```

- [ ] **Step 2 : Ajouter les deux modales HTML**

Après la div fermante de `tf-modal-remove`, ajouter :
```html
  <div id="tf-modal-coadmin" style="display:none">
    <div class="tf-modal-inner" id="tf-modal-coadmin-inner"></div>
  </div>
  <div id="tf-modal-coadmin-invite" style="display:none">
    <div class="tf-modal-inner" id="tf-modal-coadmin-invite-inner"></div>
  </div>
```

- [ ] **Step 3 : Commit**

```bash
git add team-form.html
git commit -m "feat(team-form): add co-admin modals HTML structure"
```

---

## Task 5 : JS — Objet TF étendu + flow `?coadmin=` à l'initialisation

**Files:**
- Modify: `js/team-form.js`

- [ ] **Step 1 : Ajouter `coadminToken` et `isCoadmin` à l'objet `TF`**

Trouver :
```js
var TF = {
  mode: 'create',
  survey: {},
  members: [],
  pendingMembers: [],
  pendingTeamName: '',
  pendingManagerName: '',
  pendingRelations: [],
  adminToken: null,
  memberToken: null,
  prefillManager: ''
};
```

Remplacer par :
```js
var TF = {
  mode: 'create',
  survey: {},
  members: [],
  pendingMembers: [],
  pendingTeamName: '',
  pendingManagerName: '',
  pendingRelations: [],
  adminToken: null,
  memberToken: null,
  coadminToken: null,
  isCoadmin: false,
  prefillManager: ''
};
```

- [ ] **Step 2 : Détecter `?coadmin=` dans le `DOMContentLoaded`**

Trouver dans le `DOMContentLoaded` :
```js
  TF.adminToken = params.get('admin');
  TF.memberToken = params.get('member');
  TF.prefillManager = params.get('manager') || '';
  if (TF.memberToken) { TF.mode = 'member'; tfInitMember(); }
  else if (TF.adminToken) { TF.mode = 'dashboard'; tfInitDashboard(); }
  else {
```

Remplacer par :
```js
  TF.adminToken = params.get('admin');
  TF.memberToken = params.get('member');
  TF.coadminToken = params.get('coadmin');
  TF.prefillManager = params.get('manager') || '';
  if (TF.memberToken) { TF.mode = 'member'; tfInitMember(); }
  else if (TF.adminToken) { TF.mode = 'dashboard'; tfInitDashboard(); }
  else if (TF.coadminToken) { TF.mode = 'coadmin'; tfInitCoadminClaim(); }
  else {
```

- [ ] **Step 3 : Ajouter les fonctions `tfInitCoadminClaim` et `tfInitCoadminDashboard`**

Ajouter après la fonction `tfInitDashboard` (vers la ligne 420) :

```js
async function tfInitCoadminClaim() {
  var sessRes = await supabase.auth.getSession();
  var userId = sessRes.data && sessRes.data.session && sessRes.data.session.user
    ? sessRes.data.session.user.id : null;

  if (!userId) {
    var wrapEl = document.querySelector('.tf-wrap');
    wrapEl.innerHTML = '<div class="tf-card" style="text-align:center;padding:40px 24px">'
      + '<div style="font-size:40px;margin-bottom:16px">🤝</div>'
      + '<h1 style="margin-bottom:12px">' + tfT('tfCoAdminClaimTitle') + '</h1>'
      + '<p style="color:var(--txt2);font-size:14px;margin-bottom:24px">' + tfT('tfCoAdminClaimMsg').replace('%name', '') + '</p>'
      + '<a href="index.html" class="btn btn-primary" style="display:inline-block;text-decoration:none">' + tfT('tfCoAdminSignIn') + '</a>'
      + '</div>';
    return;
  }

  var res = await supabase.rpc('tf_claim_coadmin', { p_token: TF.coadminToken });
  if (!res.data || res.data.error) {
    var errMsg = res.data && res.data.error === 'already_owner'
      ? (tfLang() === 'fr' ? 'Vous êtes déjà propriétaire de cette équipe.' : 'You are already the owner.')
      : (tfLang() === 'fr' ? 'Lien invalide ou expiré.' : 'Invalid or expired link.');
    document.querySelector('.tf-wrap').innerHTML = '<div class="tf-card" style="text-align:center;padding:40px 24px"><p style="color:var(--txt2)">' + errMsg + '</p><a href="team-form.html" class="btn btn-primary" style="display:inline-block;text-decoration:none;margin-top:16px">Retour</a></div>';
    return;
  }

  tfSaveAdminToken(res.data.co_admin_token, res.data.team_name, res.data.manager_name, true);
  TF.isCoadmin = true;
  await tfInitCoadminDashboard();
}

async function tfInitCoadminDashboard() {
  var res = await supabase.rpc('tf_get_dashboard_coadmin', { p_coadmin_token: TF.coadminToken });
  if (res.error || !res.data) {
    document.querySelector('.tf-wrap').innerHTML = '<div class="tf-card" style="text-align:center;padding:40px 24px"><p style="color:var(--txt2)">' + (tfLang() === 'fr' ? 'Accès refusé ou session expirée.' : 'Access denied or session expired.') + '</p></div>';
    return;
  }
  TF.survey = res.data.survey || {};
  TF.members = res.data.members || [];
  TF.isCoadmin = true;
  tfShow('tf-view-dashboard');
  tfRenderDashboard();
}
```

- [ ] **Step 4 : Modifier `tfSaveAdminToken` pour supporter `is_coadmin`**

Trouver :
```js
function tfSaveAdminToken(token, teamName, managerName) {
  var teams = tfGetSavedTeams();
  teams = teams.filter(function(t) { return t.token !== token; });
  teams.unshift({ token: token, teamName: teamName, managerName: managerName || '', createdAt: Date.now() });
```

Remplacer par :
```js
function tfSaveAdminToken(token, teamName, managerName, isCoadmin) {
  var teams = tfGetSavedTeams();
  teams = teams.filter(function(t) { return t.token !== token; });
  teams.unshift({ token: token, teamName: teamName, managerName: managerName || '', createdAt: Date.now(), is_coadmin: !!isCoadmin });
```

- [ ] **Step 5 : Modifier `tfMergeAndSaveTeams` pour passer `is_coadmin`**

Trouver :
```js
    if (!localTokens[t.token]) {
      tfSaveAdminToken(t.token, t.team_name, t.manager_name);
    }
```

Remplacer par :
```js
    if (!localTokens[t.token]) {
      tfSaveAdminToken(t.token, t.team_name, t.manager_name, t.is_coadmin);
    }
```

- [ ] **Step 6 : Vérifier la syntaxe**

```bash
node --check js/team-form.js
```

Expected: aucune sortie.

- [ ] **Step 7 : Commit**

```bash
git add js/team-form.js
git commit -m "feat(team-form): add coadmin token to TF object and claim flow"
```

---

## Task 6 : JS — Section co-admin dans le dashboard propriétaire

**Files:**
- Modify: `js/team-form.js`

- [ ] **Step 1 : Modifier `tfRenderDashboard` pour ajouter la section co-admin (propriétaire uniquement)**

Trouver dans `tfRenderDashboard` :
```js
  document.getElementById('tf-dash-actions').innerHTML =
    '<div style="display:flex;gap:8px;flex-wrap:wrap">'
    + '<button class="btn btn-ghost btn-sm" onclick="tfPrintQR()">' + tfT('printQR') + '</button>'
    + '<button class="btn btn-ghost btn-sm" onclick="tfExportCSV()">' + tfT('exportCSV') + '</button>'
    + '<button class="btn btn-primary btn-sm" onclick="tfSyncBloomday()">' + tfT('importAllMembers') + '</button>'
    + '</div>'
    + '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">'
    + '<button class="btn btn-ghost btn-sm" onclick="tfNewTeam()">' + tfT('newTeam') + '</button>'
    + '</div>';
```

Remplacer par :
```js
  var coAdminSection = TF.isCoadmin ? '' :
    '<div style="margin-top:16px;padding-top:16px;border-top:1px solid var(--brd)">'
    + '<div style="font-size:12px;font-weight:700;color:var(--txt2);margin-bottom:8px;text-transform:uppercase;letter-spacing:0.5px">' + tfT('tfCoAdmin') + '</div>'
    + '<div id="tf-coadmin-section"><div style="font-size:13px;color:var(--txt3)">' + tfT('tfCoAdminClaiming') + '</div></div>'
    + '</div>';

  document.getElementById('tf-dash-actions').innerHTML =
    '<div style="display:flex;gap:8px;flex-wrap:wrap">'
    + '<button class="btn btn-ghost btn-sm" onclick="tfPrintQR()">' + tfT('printQR') + '</button>'
    + '<button class="btn btn-ghost btn-sm" onclick="tfExportCSV()">' + tfT('exportCSV') + '</button>'
    + '<button class="btn btn-primary btn-sm" onclick="tfSyncBloomday()">' + tfT('importAllMembers') + '</button>'
    + '</div>'
    + '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">'
    + '<button class="btn btn-ghost btn-sm" onclick="tfNewTeam()">' + tfT('newTeam') + '</button>'
    + '</div>'
    + coAdminSection;

  if (!TF.isCoadmin) tfLoadCoAdminSection();
```

- [ ] **Step 2 : Ajouter les fonctions co-admin à la fin du fichier**

Ajouter après les fonctions Task 5 (TF_REMOVE) :

```js
// ── CO-ADMIN SECTION ──
async function tfLoadCoAdminSection() {
  var el = document.getElementById('tf-coadmin-section');
  if (!el) return;
  var res = await supabase.rpc('tf_get_coadmin_info', { p_admin_token: TF.adminToken });
  if (res.error || !res.data) { el.innerHTML = ''; return; }
  var info = res.data;
  if (info.has_active_coadmin) {
    el.innerHTML = '<div style="font-size:13px;color:var(--txt2);margin-bottom:8px">'
      + (tfLang() === 'fr' ? 'Co-admin actif' : 'Active co-admin')
      + (info.invited_email ? ' : <strong>' + tfEsc(info.invited_email) + '</strong>' : '')
      + '</div>'
      + '<button class="btn btn-ghost btn-sm" style="color:#c0392b;border-color:#e8c0b8" onclick="tfRevokeCoAdmin()">' + tfT('tfRevokeCoAdmin') + '</button>';
  } else {
    el.innerHTML = '<div style="font-size:13px;color:var(--txt3);margin-bottom:10px">' + tfT('tfNoCoAdmin') + '</div>'
      + '<div style="display:flex;gap:8px;flex-wrap:wrap">'
      + '<button class="btn btn-ghost btn-sm" onclick="tfOpenCoAdminInviteEmail()">' + tfT('tfInviteByEmail') + '</button>'
      + '<button class="btn btn-ghost btn-sm" onclick="tfCopyCoAdminLink(\'' + tfEsc(info.co_admin_token) + '\')">' + tfT('tfCopyCoAdminLink') + '</button>'
      + '</div>';
  }
}

function tfOpenCoAdminInviteEmail() {
  document.getElementById('tf-modal-coadmin-invite').style.display = 'flex';
  document.getElementById('tf-modal-coadmin-invite-inner').innerHTML =
    '<h2 style="font-family:\'Playfair Display\',serif;font-size:17px;font-weight:800;margin-bottom:16px">' + tfT('tfInviteByEmail') + '</h2>'
    + '<label style="text-align:left;display:block">' + tfT('tfCoAdminEmailLabel') + '</label>'
    + '<input id="tf-coadmin-email-inp" type="email" placeholder="email@exemple.com" style="margin-bottom:16px">'
    + '<div style="display:flex;gap:8px">'
    + '<button class="btn btn-ghost" style="flex:1" onclick="document.getElementById(\'tf-modal-coadmin-invite\').style.display=\'none\'">' + tfT('cancelAdd') + '</button>'
    + '<button class="btn btn-primary" style="flex:1" id="tf-coadmin-invite-btn" onclick="tfSendCoAdminInvite()">' + tfT('tfInviteByEmail') + '</button>'
    + '</div>';
  setTimeout(function() {
    var inp = document.getElementById('tf-coadmin-email-inp');
    if (inp) inp.focus();
  }, 100);
}

async function tfSendCoAdminInvite() {
  var inp = document.getElementById('tf-coadmin-email-inp');
  var email = inp ? inp.value.trim() : '';
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    alert(tfT('errorRequired'));
    return;
  }
  var btn = document.getElementById('tf-coadmin-invite-btn');
  if (btn) { btn.disabled = true; btn.textContent = '…'; }

  var infoRes = await supabase.rpc('tf_get_coadmin_info', { p_admin_token: TF.adminToken });
  if (infoRes.error || !infoRes.data) {
    alert(tfLang() === 'fr' ? 'Erreur lors de la récupération du lien.' : 'Error fetching link.');
    if (btn) { btn.disabled = false; btn.textContent = tfT('tfInviteByEmail'); }
    return;
  }
  var claimUrl = window.location.origin + window.location.pathname + '?coadmin=' + encodeURIComponent(infoRes.data.co_admin_token);

  await supabase.rpc('tf_save_coadmin_invitation', { p_admin_token: TF.adminToken, p_email: email });

  await fetch('/.netlify/functions/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'coadmin_invite',
      data: {
        email: email,
        managerName: TF.survey.manager_name || '',
        teamName: TF.survey.team_name || '',
        claimUrl: claimUrl
      }
    })
  });

  document.getElementById('tf-modal-coadmin-invite').style.display = 'none';
  tfToast(tfT('tfCoAdminInviteSent'));
  tfLoadCoAdminSection();
}

async function tfCopyCoAdminLink(coAdminToken) {
  var url = window.location.origin + window.location.pathname + '?coadmin=' + encodeURIComponent(coAdminToken);
  try {
    await navigator.clipboard.writeText(url);
    tfToast(tfT('tfLinkCopied'));
  } catch(e) {
    prompt(tfLang() === 'fr' ? 'Copiez ce lien :' : 'Copy this link:', url);
  }
}

async function tfRevokeCoAdmin() {
  if (!confirm(tfLang() === 'fr' ? 'Révoquer l\'accès du co-admin ?' : 'Revoke co-admin access?')) return;
  var res = await supabase.rpc('tf_revoke_coadmin', { p_admin_token: TF.adminToken });
  if (res.error) { alert('Erreur : ' + res.error.message); return; }
  tfToast(tfLang() === 'fr' ? 'Accès révoqué.' : 'Access revoked.');
  tfLoadCoAdminSection();
}
```

- [ ] **Step 3 : Vérifier la syntaxe**

```bash
node --check js/team-form.js
```

Expected: aucune sortie.

- [ ] **Step 4 : Commit**

```bash
git add js/team-form.js
git commit -m "feat(team-form): add co-admin dashboard section (invite, copy link, revoke)"
```

---

## Task 7 : JS — Adaptations pour le mode co-admin dans la liste d'équipes

**Files:**
- Modify: `js/team-form.js`

- [ ] **Step 1 : Modifier `tfInitTeams` pour le lien "Ouvrir" et masquer "Supprimer" pour les co-admins**

Trouver dans `tfInitTeams` :
```js
      + '<div style="display:flex;gap:8px">'
      + '<a href="team-form.html?admin=' + encodeURIComponent(t.token) + '" class="btn btn-ghost btn-sm">' + tfT('openTeam') + '</a>'
      + '<button class="btn btn-ghost btn-sm" style="color:#c0392b;border-color:#e8c0b8" '
      + 'data-token="' + tfEsc(t.token) + '" data-teamname="' + tfEsc(t.teamName) + '" '
      + 'onclick="tfDeleteTeam(this.dataset.token,this.dataset.teamname)">' + tfT('tfDeleteBtn') + '</button>'
      + '</div>'
      + '</div>';
```

Remplacer par :
```js
      + '<div style="display:flex;gap:8px">'
      + '<a href="team-form.html?' + (t.is_coadmin ? 'coadmin' : 'admin') + '=' + encodeURIComponent(t.token) + '" class="btn btn-ghost btn-sm">' + tfT('openTeam') + '</a>'
      + (!t.is_coadmin
        ? '<button class="btn btn-ghost btn-sm" style="color:#c0392b;border-color:#e8c0b8" '
          + 'data-token="' + tfEsc(t.token) + '" data-teamname="' + tfEsc(t.teamName) + '" '
          + 'onclick="tfDeleteTeam(this.dataset.token,this.dataset.teamname)">' + tfT('tfDeleteBtn') + '</button>'
        : '')
      + '</div>'
      + '</div>';
```

- [ ] **Step 2 : Modifier `tfSubmitAddMember` pour utiliser `tf_add_member_coadmin` si co-admin**

Trouver :
```js
  var res = await supabase.rpc('tf_add_member', {
    p_admin_token: TF.adminToken,
    p_member: { first_name: firstName, last_name: lastName, email: email || '', relation: relation || '' }
  });
```

Remplacer par :
```js
  var res = TF.isCoadmin
    ? await supabase.rpc('tf_add_member_coadmin', {
        p_coadmin_token: TF.coadminToken,
        p_member: { first_name: firstName, last_name: lastName, email: email || '', relation: relation || '' }
      })
    : await supabase.rpc('tf_add_member', {
        p_admin_token: TF.adminToken,
        p_member: { first_name: firstName, last_name: lastName, email: email || '', relation: relation || '' }
      });
```

- [ ] **Step 3 : Modifier `tfRefreshDashboard` pour utiliser `tf_refresh_dashboard_coadmin` si co-admin**

Trouver la fonction `tfRefreshDashboard` (appel de `tf_refresh_dashboard`) :
```js
  var res = await supabase.rpc('tf_refresh_dashboard', { p_admin_token: TF.adminToken });
  if (!res.error && res.data) { TF.members = res.data; tfRenderDashboard(); }
```

Remplacer par :
```js
  var res = TF.isCoadmin
    ? await supabase.rpc('tf_refresh_dashboard_coadmin', { p_coadmin_token: TF.coadminToken })
    : await supabase.rpc('tf_refresh_dashboard', { p_admin_token: TF.adminToken });
  if (!res.error && res.data) { TF.members = res.data; tfRenderDashboard(); }
```

- [ ] **Step 4 : Modifier `tfExecuteRemoveMember` pour le mode co-admin**

Le RPC `tf_remove_member` prend `p_admin_token`. En mode co-admin, on n'a pas l'admin token. Il faut créer une alternative OU restreindre la suppression de membre au propriétaire uniquement.

Pour v1 : désactiver le bouton "Retirer" si `TF.isCoadmin`.

Trouver dans `tfRenderMemberCard` le `tf-remove-btn` :
```js
    + '<button class="tf-remove-btn" data-token="' + m.token + '" data-name="' + fullName + '" onclick="tfOpenRemoveModal(this.dataset.token,this.dataset.name)" title="' + tfT('tfRemoveMemberBtn') + '">×</button>'
```

Remplacer par :
```js
    + (TF.isCoadmin ? '' : '<button class="tf-remove-btn" data-token="' + m.token + '" data-name="' + fullName + '" onclick="tfOpenRemoveModal(this.dataset.token,this.dataset.name)" title="' + tfT('tfRemoveMemberBtn') + '">×</button>')
```

Et dans la `tf-dash-card-del` :
```js
    + '<div class="tf-dash-card-del" data-token="' + m.token + '" data-name="' + fullName + '" onclick="tfOpenRemoveModal(this.dataset.token,this.dataset.name)">' + tfT('tfRemoveMemberBtn') + '</div>'
```

Remplacer par :
```js
    + (TF.isCoadmin ? '' : '<div class="tf-dash-card-del" data-token="' + m.token + '" data-name="' + fullName + '" onclick="tfOpenRemoveModal(this.dataset.token,this.dataset.name)">' + tfT('tfRemoveMemberBtn') + '</div>')
```

- [ ] **Step 5 : Vérifier la syntaxe**

```bash
node --check js/team-form.js
```

Expected: aucune sortie.

- [ ] **Step 6 : Commit**

```bash
git add js/team-form.js
git commit -m "feat(team-form): adapt teams list and dashboard operations for co-admin mode"
```

---

## Task 8 : Vérification manuelle + déploiement

- [ ] **Step 1 : Tester le flux "Copier le lien" (propriétaire)**

1. Ouvrir le dashboard d'une équipe (`?admin=<token>`)
2. Vérifier la section "Co-administrateur" en bas du panneau gauche
3. Cliquer "Copier le lien" → toast "Lien copié !" + lien dans le presse-papier
4. Vérifier le format du lien : `https://mybloomday.app/team-form.html?coadmin=<uuid>`

- [ ] **Step 2 : Tester le flux "Inviter par email"**

1. Cliquer "Inviter par email" → modale s'ouvre
2. Saisir une vraie adresse email → cliquer "Inviter"
3. Toast "Invitation envoyée !" → section co-admin affiche l'email
4. Vérifier que l'email est reçu avec le bon template et le bon lien

- [ ] **Step 3 : Tester le claim (co-admin non connecté)**

1. Ouvrir le lien co-admin dans un autre navigateur (non connecté)
2. Page affiche : "Accès co-administrateur — Connectez-vous..."
3. Bouton "Se connecter à Bloomday" → redirige vers index.html

- [ ] **Step 4 : Tester le claim (co-admin connecté)**

1. Ouvrir le lien co-admin dans un navigateur avec un compte connecté
2. `tf_claim_coadmin` est appelé automatiquement
3. Dashboard s'ouvre → section co-admin absente (pas de section "delete" disponible)
4. Bouton "+" membres → fonctionne (utilise `tf_add_member_coadmin`)
5. Bouton `×` sur les membres → absent (co-admin ne peut pas retirer)

- [ ] **Step 5 : Tester la liste d'équipes (co-admin)**

1. Se déconnecter et reconnecter sur un autre compte (le co-admin)
2. Aller sur team-form.html (sans paramètre URL)
3. L'équipe co-admin doit apparaître dans la liste avec "Ouvrir" mais sans bouton "Supprimer"
4. Cliquer "Ouvrir" → dashboard s'ouvre en mode co-admin

- [ ] **Step 6 : Tester "Révoquer" (propriétaire)**

1. Depuis le dashboard propriétaire, cliquer "Révoquer"
2. Confirm → toast "Accès révoqué"
3. Section co-admin affiche à nouveau "Aucun co-admin"
4. L'ancien lien co-admin ne fonctionne plus (token régénéré)

- [ ] **Step 7 : Déployer**

```bash
git push origin main
```

Puis vérifier sur https://mybloomday.app/team-form.html.
