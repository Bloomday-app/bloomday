# Team-Form Remove Member Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter un bouton "Retirer" sur chaque carte membre du dashboard team-form, avec une modale de confirmation proposant de supprimer aussi le contact de Bloomday.

**Architecture:** Un bouton `×` visible sur desktop + swipe-to-delete sur mobile. La confirmation passe par une modale `tf-modal-remove`. L'état temporaire est stocké dans `TF_REMOVE`. La RPC `tf_remove_member(p_admin_token, p_member_token)` supprime le membre de Supabase. Si l'utilisateur est connecté et coche "Supprimer aussi de Bloomday", le membre est supprimé de la table `members` via Supabase JS client.

**Tech Stack:** Vanilla JS ES6+, Supabase RPC + table access direct, localStorage, HTML/CSS inline, `js/team-form-i18n.js` (fr + en)

---

## Fichiers touchés

| Fichier | Action |
|---|---|
| `supabase/migrations/20260610120000_tf_remove_member.sql` | Créer — RPC de suppression membre |
| `js/team-form-i18n.js` | Modifier — 5 nouvelles clés (fr + en) |
| `team-form.html` | Modifier — modal `tf-modal-remove` + CSS swipe |
| `js/team-form.js` | Modifier — logique suppression + rendu carte + swipe |

---

## Task 1 : Migration Supabase — RPC `tf_remove_member`

**Files:**
- Create: `supabase/migrations/20260610120000_tf_remove_member.sql`

- [ ] **Step 1 : Créer le fichier de migration**

```sql
-- Supprime un membre d'un survey identifié par son admin token.
-- Retourne true si supprimé, false si admin token invalide.
CREATE OR REPLACE FUNCTION tf_remove_member(p_admin_token text, p_member_token text)
RETURNS boolean
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE v_survey_id uuid;
BEGIN
  SELECT id INTO v_survey_id FROM surveys WHERE token = p_admin_token LIMIT 1;
  IF v_survey_id IS NULL THEN RETURN false; END IF;
  DELETE FROM survey_members WHERE survey_id = v_survey_id AND token = p_member_token;
  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION tf_remove_member(text, text) TO anon;
```

- [ ] **Step 2 : Vérifier le contenu du fichier**

```bash
cat supabase/migrations/20260610120000_tf_remove_member.sql
```

Expected: affiche le SQL sans erreur.

- [ ] **Step 3 : Appliquer la migration à Supabase**

```bash
supabase db push
```

Expected: migration appliquée sans erreur. Si `supabase` CLI non disponible, appliquer manuellement via le Supabase Dashboard → SQL Editor.

- [ ] **Step 4 : Commit**

```bash
git add supabase/migrations/20260610120000_tf_remove_member.sql
git commit -m "feat(team-form): add tf_remove_member RPC"
```

---

## Task 2 : i18n — 5 nouvelles clés dans `team-form-i18n.js`

**Files:**
- Modify: `js/team-form-i18n.js`

- [ ] **Step 1 : Ajouter les clés FR**

Dans `TF_I18N.fr`, trouver la ligne :
```js
    tfDeleteSuccess: 'Équipe supprimée',
```

La remplacer par :
```js
    tfDeleteSuccess: 'Équipe supprimée',
    tfRemoveMemberBtn: 'Retirer',
    tfRemoveConfirmTitle: 'Retirer %name ?',
    tfRemoveAlsoBloomday: 'Supprimer aussi de mes contacts Bloomday',
    tfRemoving: 'Suppression…',
    tfRemoveSuccess: 'Membre retiré',
```

- [ ] **Step 2 : Ajouter les clés EN**

Dans `TF_I18N.en`, trouver la ligne :
```js
    tfDeleteSuccess: 'Team deleted',
```

La remplacer par :
```js
    tfDeleteSuccess: 'Team deleted',
    tfRemoveMemberBtn: 'Remove',
    tfRemoveConfirmTitle: 'Remove %name?',
    tfRemoveAlsoBloomday: 'Also delete from my Bloomday contacts',
    tfRemoving: 'Removing…',
    tfRemoveSuccess: 'Member removed',
```

- [ ] **Step 3 : Vérifier la syntaxe**

```bash
node --check js/team-form-i18n.js
```

Expected: aucune sortie (pas d'erreur de syntaxe).

- [ ] **Step 4 : Commit**

```bash
git add js/team-form-i18n.js
git commit -m "feat(team-form): add remove member i18n keys (fr + en)"
```

---

## Task 3 : HTML — Modal `tf-modal-remove` + CSS swipe

**Files:**
- Modify: `team-form.html`

- [ ] **Step 1 : Ajouter `#tf-modal-remove` au sélecteur CSS existant**

Trouver la ligne (dans le `<style>`) :
```css
#tf-modal-qr,#tf-modal-delete{position:fixed;inset:0;background:rgba(45,27,20,.6);z-index:100;align-items:center;justify-content:center;padding:20px}
```

La remplacer par :
```css
#tf-modal-qr,#tf-modal-delete,#tf-modal-remove{position:fixed;inset:0;background:rgba(45,27,20,.6);z-index:100;align-items:center;justify-content:center;padding:20px}
```

- [ ] **Step 2 : Ajouter les classes CSS pour le swipe mobile et le bouton desktop**

Après la ligne `.tf-dash-card{...}` (dans le `<style>`), ajouter :
```css
.tf-dash-card{position:relative;overflow:hidden}
.tf-dash-swipe-inner{transform:translateX(0);transition:transform .25s ease;will-change:transform}
.tf-dash-card-del{position:absolute;right:0;top:0;bottom:0;width:80px;background:#c0392b;display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;font-weight:700;cursor:pointer;border-radius:0 var(--rad) var(--rad) 0;user-select:none}
.tf-remove-btn{background:none;border:none;cursor:pointer;color:var(--txt3);font-size:20px;line-height:1;padding:0 4px;transition:color .15s;font-family:inherit}
.tf-remove-btn:hover{color:#c0392b}
@media(min-width:600px){.tf-dash-card-del{display:none}}
```

Note : `.tf-dash-card` a déjà une définition — il faut SEULEMENT ajouter `position:relative;overflow:hidden` à la règle existante. Si le sélecteur `.tf-dash-card{...}` n'a pas encore ces propriétés, les ajouter en modifiant la règle existante :

Trouver :
```css
.tf-dash-card{background:var(--bg2);border-radius:var(--rad);box-shadow:var(--sh);padding:16px;margin-bottom:12px;border:1px solid var(--brd)}
```

Remplacer par :
```css
.tf-dash-card{background:var(--bg2);border-radius:var(--rad);box-shadow:var(--sh);padding:16px;margin-bottom:12px;border:1px solid var(--brd);position:relative;overflow:hidden}
```

Puis ajouter juste après cette ligne :
```css
.tf-dash-swipe-inner{transform:translateX(0);transition:transform .25s ease;will-change:transform}
.tf-dash-card-del{position:absolute;right:0;top:0;bottom:0;width:80px;background:#c0392b;display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;font-weight:700;cursor:pointer;border-radius:0 var(--rad) var(--rad) 0;user-select:none}
.tf-remove-btn{background:none;border:none;cursor:pointer;color:var(--txt3);font-size:20px;line-height:1;padding:0 4px;transition:color .15s;font-family:inherit}
.tf-remove-btn:hover{color:#c0392b}
@media(min-width:600px){.tf-dash-card-del{display:none}}
```

- [ ] **Step 3 : Ajouter la structure HTML de la modale**

Trouver le HTML de `tf-modal-delete` :
```html
  <div id="tf-modal-delete" style="display:none">
    <div class="tf-modal-inner" id="tf-modal-delete-inner"></div>
```

Ajouter APRÈS sa div fermante `</div>` :
```html
  <div id="tf-modal-remove" style="display:none">
    <div class="tf-modal-inner" id="tf-modal-remove-inner"></div>
  </div>
```

- [ ] **Step 4 : Commit**

```bash
git add team-form.html
git commit -m "feat(team-form): add remove member modal and swipe CSS"
```

---

## Task 4 : JS — Modifier `tfRenderMemberCard`

**Files:**
- Modify: `js/team-form.js`

- [ ] **Step 1 : Modifier `tfRenderMemberCard` pour ajouter l'enveloppe swipe + bouton ×**

Trouver la fonction `tfRenderMemberCard` et son `return`. Le début du return est :
```js
  return '<div class="tf-dash-card">'
    + '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px">'
    + '<div><div style="font-weight:700;font-size:15px">' + tfEsc(m.first_name) + ' ' + tfEsc(m.last_name) + '</div>'
    + '<div style="font-size:12px;color:var(--txt2)">' + tfEsc(m.relation || '') + '</div></div>'
    + '<span class="badge ' + badgeCls + '">' + badgeTxt + '</span>'
    + '</div>'
    + detailsHtml
    + '<div class="share-btns">'
```

La fin du return est :
```js
    + (m.completed ? '<button class="share-btn" data-token="' + m.token + '" onclick="tfImportMember(this.dataset.token)" style="grid-column:span 2;background:#E3F9F0;border-color:#0A5C3A;color:#0A5C3A;font-weight:700">' + tfT('importMember') + '</button>' : '')
    + '</div></div>';
```

Remplacer TOUT le `return` (depuis `return '<div class="tf-dash-card">'` jusqu'à `+ '</div></div>';`) par :

```js
  var fullName = tfEsc(m.first_name + ' ' + m.last_name);
  return '<div class="tf-dash-card">'
    + '<div class="tf-dash-swipe-inner">'
    + '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px">'
    + '<div><div style="font-weight:700;font-size:15px">' + tfEsc(m.first_name) + ' ' + tfEsc(m.last_name) + '</div>'
    + '<div style="font-size:12px;color:var(--txt2)">' + tfEsc(m.relation || '') + '</div></div>'
    + '<div style="display:flex;align-items:center;gap:6px">'
    + '<span class="badge ' + badgeCls + '">' + badgeTxt + '</span>'
    + '<button class="tf-remove-btn" data-token="' + m.token + '" data-name="' + fullName + '" onclick="tfOpenRemoveModal(this.dataset.token,this.dataset.name)" title="' + tfT('tfRemoveMemberBtn') + '">×</button>'
    + '</div>'
    + '</div>'
    + detailsHtml
    + '<div class="share-btns">'
    + (hasEmail ? '<button class="share-btn" data-token="' + m.token + '" onclick="tfShareEmail(this.dataset.token)">' + tfT('sendEmail') + '</button>' : '')
    + '<button class="share-btn" data-token="' + m.token + '" onclick="tfShareWhatsApp(this.dataset.token)">' + tfT('sendWhatsApp') + '</button>'
    + '<button class="share-btn" data-token="' + m.token + '" onclick="tfShareSMS(this.dataset.token)">' + tfT('sendSMS') + '</button>'
    + '<button class="share-btn" data-token="' + m.token + '" onclick="tfShareCopy(this.dataset.token)">' + tfT('copyLink') + '</button>'
    + '<button class="share-btn" data-token="' + m.token + '" onclick="tfShowQR(this.dataset.token)">' + tfT('qrCode') + '</button>'
    + (m.completed ? '<button class="share-btn" data-token="' + m.token + '" onclick="tfImportMember(this.dataset.token)" style="grid-column:span 2;background:#E3F9F0;border-color:#0A5C3A;color:#0A5C3A;font-weight:700">' + tfT('importMember') + '</button>' : '')
    + '</div>'
    + '</div>'
    + '<div class="tf-dash-card-del" data-token="' + m.token + '" data-name="' + fullName + '" onclick="tfOpenRemoveModal(this.dataset.token,this.dataset.name)">' + tfT('tfRemoveMemberBtn') + '</div>'
    + '</div>';
```

- [ ] **Step 2 : Vérifier la syntaxe**

```bash
node --check js/team-form.js
```

Expected: aucune sortie.

- [ ] **Step 3 : Commit**

```bash
git add js/team-form.js
git commit -m "feat(team-form): wrap member card content for swipe + add remove button"
```

---

## Task 5 : JS — État `TF_REMOVE` + fonctions de suppression

**Files:**
- Modify: `js/team-form.js`

- [ ] **Step 1 : Ajouter l'objet d'état `TF_REMOVE`**

Trouver la ligne :
```js
var TF_DELETE = { token: null, teamName: null, groupId: null, bloomdayMembers: [] };
```

Ajouter APRÈS :
```js
var TF_REMOVE = { token: null, name: null, userId: null };
```

- [ ] **Step 2 : Ajouter toutes les fonctions de suppression à la fin du fichier**

À la toute fin de `js/team-form.js` (après la dernière fonction), ajouter :

```js
// ── SUPPRESSION DE MEMBRE ──
async function tfOpenRemoveModal(memberToken, memberName) {
  TF_REMOVE.token = memberToken;
  TF_REMOVE.name = memberName;
  var sessRes = await supabase.auth.getSession();
  TF_REMOVE.userId = sessRes.data && sessRes.data.session && sessRes.data.session.user
    ? sessRes.data.session.user.id : null;
  var modal = document.getElementById('tf-modal-remove');
  modal.style.display = 'flex';
  document.getElementById('tf-modal-remove-inner').innerHTML = tfRenderRemoveModal(memberName, !!TF_REMOVE.userId);
}

function tfRenderRemoveModal(memberName, showBloomday) {
  return '<h2 style="font-family:\'Playfair Display\',serif;font-size:17px;font-weight:800;margin-bottom:12px">'
    + tfT('tfRemoveConfirmTitle').replace('%name', memberName) + '</h2>'
    + (showBloomday
      ? '<label style="display:flex;align-items:center;gap:10px;font-size:13px;margin-bottom:20px;cursor:pointer;text-align:left">'
        + '<input type="checkbox" id="tf-remove-bloomday-cb" style="width:18px;height:18px;accent-color:var(--b3);flex-shrink:0;margin:0">'
        + '<span>' + tfT('tfRemoveAlsoBloomday') + '</span>'
        + '</label>'
      : '<div style="margin-bottom:20px"></div>')
    + '<div style="display:flex;gap:8px">'
    + '<button class="btn btn-ghost" style="flex:1" onclick="tfCloseRemoveModal()">' + tfT('cancelAdd') + '</button>'
    + '<button class="btn btn-primary" style="flex:1;background:#c0392b;border:none" id="tf-remove-exec-btn" onclick="tfExecuteRemoveMember()">'
    + tfT('tfRemoveMemberBtn') + '</button>'
    + '</div>';
}

function tfCloseRemoveModal() {
  document.getElementById('tf-modal-remove').style.display = 'none';
  TF_REMOVE.token = null;
  TF_REMOVE.name = null;
  TF_REMOVE.userId = null;
  document.querySelectorAll('.tf-dash-swipe-inner').forEach(function(el) {
    el.style.transform = 'translateX(0)';
  });
}

async function tfExecuteRemoveMember() {
  var btn = document.getElementById('tf-remove-exec-btn');
  if (btn) { btn.disabled = true; btn.textContent = tfT('tfRemoving'); }

  var res = await supabase.rpc('tf_remove_member', {
    p_admin_token: TF.adminToken,
    p_member_token: TF_REMOVE.token
  });
  if (res.error || res.data === false) {
    alert('Erreur : ' + (res.error ? res.error.message : 'Token invalide'));
    if (btn) { btn.disabled = false; btn.textContent = tfT('tfRemoveMemberBtn'); }
    return;
  }

  var alsoBloomday = document.getElementById('tf-remove-bloomday-cb') && document.getElementById('tf-remove-bloomday-cb').checked;
  if (alsoBloomday && TF_REMOVE.userId) {
    var member = TF.members.find(function(m) { return m.token === TF_REMOVE.token; });
    if (member) {
      var fullName = (member.first_name + ' ' + member.last_name).trim();
      var gRes = await supabase.from('groups').select('id')
        .eq('user_id', TF_REMOVE.userId).eq('name', TF.survey.team_name).maybeSingle();
      if (gRes.data && gRes.data.id) {
        await supabase.from('members').delete().eq('group_id', gRes.data.id).eq('name', fullName);
        await supabase.from('members').delete().eq('group_id', gRes.data.id).ilike('name', fullName + ' (mariage%');
      }
    }
  }

  TF.members = TF.members.filter(function(m) { return m.token !== TF_REMOVE.token; });
  tfCloseRemoveModal();
  tfToast(tfT('tfRemoveSuccess'));
  tfRenderDashboard();
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
git commit -m "feat(team-form): add TF_REMOVE state and remove member modal functions"
```

---

## Task 6 : JS — Swipe-to-delete mobile + appel dans `tfRenderDashboard`

**Files:**
- Modify: `js/team-form.js`

- [ ] **Step 1 : Ajouter `tfInitSwipe()` à la fin du fichier (après les fonctions Task 5)**

```js
// ── SWIPE-TO-DELETE MOBILE ──
function tfInitSwipe() {
  document.querySelectorAll('#tf-member-cards .tf-dash-card').forEach(function(card) {
    var startX = 0, startY = 0, dragging = false, delta = 0;
    card.addEventListener('touchstart', function(e) {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      dragging = true;
      delta = 0;
    }, { passive: true });
    card.addEventListener('touchmove', function(e) {
      if (!dragging) return;
      var dx = e.touches[0].clientX - startX;
      var dy = e.touches[0].clientY - startY;
      if (Math.abs(dy) > Math.abs(dx)) { dragging = false; return; }
      if (dx > 0) { delta = 0; return; }
      delta = Math.max(dx, -80);
      var inner = card.querySelector('.tf-dash-swipe-inner');
      if (inner) inner.style.transform = 'translateX(' + delta + 'px)';
    }, { passive: true });
    card.addEventListener('touchend', function() {
      if (!dragging) return;
      dragging = false;
      var inner = card.querySelector('.tf-dash-swipe-inner');
      if (delta < -40) {
        if (inner) inner.style.transform = 'translateX(-80px)';
        document.querySelectorAll('#tf-member-cards .tf-dash-swipe-inner').forEach(function(other) {
          if (other !== inner) other.style.transform = 'translateX(0)';
        });
      } else {
        if (inner) inner.style.transform = 'translateX(0)';
      }
    });
  });
}
```

- [ ] **Step 2 : Appeler `tfInitSwipe()` à la fin de `tfRenderDashboard`**

Trouver dans `tfRenderDashboard` :
```js
  document.getElementById('tf-member-cards').innerHTML = TF.members.map(function(m) {
    return tfRenderMemberCard(m);
  }).join('');
}
```

Remplacer par :
```js
  document.getElementById('tf-member-cards').innerHTML = TF.members.map(function(m) {
    return tfRenderMemberCard(m);
  }).join('');
  tfInitSwipe();
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
git commit -m "feat(team-form): add swipe-to-delete mobile gesture on member cards"
```

---

## Task 7 : Vérification manuelle + déploiement

- [ ] **Step 1 : Tester en local (serveur HTTP)**

Ouvrir `team-form.html` via un serveur local (ex: `python3 -m http.server 8080`, puis `http://localhost:8080/team-form.html`).

- [ ] **Step 2 : Tester le bouton × (desktop)**

1. Ouvrir le dashboard d'une équipe avec des membres (via `?admin=<token>`)
2. Vérifier que chaque carte membre affiche un `×` discret en haut à droite
3. Cliquer `×` → modale s'ouvre avec le nom du membre
4. Sans connexion Bloomday : modale sans case à cocher
5. Cliquer "Annuler" → modale se ferme, swipes reset
6. Cliquer `×` à nouveau → "Retirer" → vérifier que le membre disparaît + toast "Membre retiré"

- [ ] **Step 3 : Tester le swipe mobile (DevTools → mode mobile)**

1. Activer le mode Device dans Chrome DevTools (F12 → icône mobile)
2. Swiper une carte vers la gauche → bouton rouge "Retirer" apparaît
3. Swiper d'autres cartes → les autres se ferment
4. Tapper le bouton rouge → modale s'ouvre
5. Confirmer → membre retiré

- [ ] **Step 4 : Tester "Supprimer aussi de Bloomday" (avec compte connecté)**

1. Se connecter à Bloomday sur `index.html`
2. Importer un membre depuis une équipe (`🌸 Importer ce contact`)
3. Revenir sur le dashboard team-form
4. Cliquer `×` sur ce membre → case à cocher "Supprimer aussi de mes contacts Bloomday" visible
5. Cocher + confirmer → vérifier dans Bloomday que le contact a disparu

- [ ] **Step 5 : Déployer**

```bash
git push origin main
```

Puis vérifier sur https://mybloomday.app/team-form.html.
