# Design : Suppression de membre + Co-admin dans team-form

**Date :** 2026-06-10
**Statut :** Approuvé

---

## Contexte

La page `team-form.html` permet aux managers de créer des équipes et d'en voir le dashboard. Deux fonctionnalités manquent :
1. Supprimer un membre individuel depuis le dashboard (actuellement impossible après envoi du formulaire)
2. Inviter un co-administrateur pour partager la gestion de l'équipe

---

## Feature 1 — Suppression de membre depuis le dashboard

### Objectif

Permettre au propriétaire de l'équipe de retirer un membre du dashboard, avec option de le supprimer aussi de ses contacts Bloomday.

### UI/UX

**Desktop** — bouton "Retirer" (rouge discret) sur chaque carte membre dans le dashboard.

**Mobile** — swipe vers la gauche sur une carte membre révèle un bouton rouge "Supprimer" (pattern iOS Contacts).

**Modale de confirmation :**

```
Retirer [Prénom Nom] de l'équipe ?

☑ Supprimer aussi de mes contacts Bloomday

[Annuler]   [Supprimer]
```

La case "Supprimer aussi de Bloomday" est affichée uniquement si l'utilisateur est connecté à Bloomday ET que le membre existe dans ses contacts.

### Backend

Nouvelle RPC Supabase :

```sql
CREATE OR REPLACE FUNCTION tf_remove_member(p_admin_token text, p_member_token text)
RETURNS boolean
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
  v_survey_id uuid;
BEGIN
  SELECT id INTO v_survey_id FROM surveys WHERE token = p_admin_token LIMIT 1;
  IF v_survey_id IS NULL THEN RETURN false; END IF;
  DELETE FROM survey_members WHERE survey_id = v_survey_id AND token = p_member_token;
  RETURN true;
END;
$$;
GRANT EXECUTE ON FUNCTION tf_remove_member(text, text) TO anon;
```

### Séquence d'exécution côté JS

1. Appel RPC `tf_remove_member(adminToken, memberToken)` → supprime la ligne dans `survey_members`
2. Si le RPC échoue → alert d'erreur, stopper
3. Si case "Bloomday" cochée + utilisateur connecté → `supabase.from('members').delete().eq('id', bloomdayMemberId)`
4. Retirer le membre du tableau `TF.members` en mémoire + rerendre le dashboard

### Fichiers modifiés

| Fichier | Action |
|---|---|
| `supabase/migrations/YYYYMMDDHHMMSS_tf_remove_member.sql` | Créer — RPC suppression membre |
| `js/team-form-i18n.js` | Modifier — nouvelles clés i18n |
| `js/team-form.js` | Modifier — bouton retirer, swipe mobile, modale |

### i18n (fr + en)

| Clé | FR | EN |
|---|---|---|
| `tfRemoveMember` | Retirer | Remove |
| `tfRemoveConfirmTitle` | Retirer %name de l'équipe ? | Remove %name from the team? |
| `tfRemoveAlsoBloomday` | Supprimer aussi de mes contacts Bloomday | Also delete from my Bloomday contacts |
| `tfRemoving` | Suppression… | Removing… |
| `tfRemoveSuccess` | Membre retiré | Member removed |

### Ce qui est hors scope

- Suppression en masse de plusieurs membres à la fois
- Historique des suppressions
- Restauration d'un membre supprimé

---

## Feature 2 — Co-administrateur

### Objectif

Permettre au propriétaire d'une équipe d'inviter un co-admin qui peut gérer l'équipe (ajouter membres, envoyer invitations, voir le dashboard) mais ne peut pas supprimer l'équipe.

Le co-admin doit obligatoirement avoir un compte Bloomday.

### UI dans le dashboard

Nouvelle section en bas du dashboard :

```
── Co-administrateur ─────────────────────────────
  Aucun co-admin pour cette équipe.

  [✉ Inviter par email]   [🔗 Copier le lien]
```

Si un co-admin est déjà actif :

```
  Co-admin : email@example.com   [Révoquer]
```

### Flux d'invitation

**Option email :**
1. Admin saisit l'email du co-admin → clic "Inviter"
2. Netlify Function envoie un email Bloomday avec le lien de claim
3. Un enregistrement est créé dans `co_admin_invitations`

**Option lien copier-coller :**
1. Admin clique "Copier le lien"
2. Lien `https://mybloomday.app/team-form.html?coadmin=<token>` copié dans le presse-papier
3. Toast "Lien copié !"

### Email Bloomday envoyé

```
Objet : Vous avez été nommé co-administrateur d'une équipe Bloomday

Bonjour,

[Nom du manager] vous invite à co-gérer l'équipe "[Nom de l'équipe]" sur Bloomday.

Pour accéder à cette équipe, vous avez besoin d'un compte Bloomday.
Si vous n'en avez pas encore, créez-en un gratuitement — c'est rapide.

[Accéder à l'équipe →]

— L'équipe Bloomday
```

### Flux de claim (co-admin clique le lien)

1. `team-form.html?coadmin=<token>` s'ouvre
2. Si non connecté → message affiché :
   > "Ce lien vous donne accès à l'équipe **[nom]** en tant que co-administrateur. Connectez-vous ou créez un compte Bloomday pour continuer."
   > [Se connecter]  [Créer un compte]
3. Après connexion Supabase → RPC `tf_claim_coadmin(token)` appelée automatiquement
4. RPC stocke le `user_id` dans `surveys.co_admin_user_ids` (JSONB)
5. L'équipe apparaît dans l'interface du co-admin
6. Dashboard identique au propriétaire, **sauf** : bouton "Supprimer l'équipe" masqué

### Base de données

**Modification table `surveys` :**
```sql
ALTER TABLE surveys
  ADD COLUMN co_admin_token UUID DEFAULT gen_random_uuid(),
  ADD COLUMN co_admin_user_ids JSONB DEFAULT '[]'::jsonb;
```

**Nouvelle table `co_admin_invitations` :**
```sql
CREATE TABLE co_admin_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID REFERENCES surveys(id) ON DELETE CASCADE,
  token UUID UNIQUE DEFAULT gen_random_uuid(),
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**Token co-admin vs token admin :**

- `surveys.token` = token propriétaire (accès complet, donne droit de supprimer)
- `surveys.co_admin_token` = token co-admin (accès complet sauf suppression)

Ces deux tokens sont distincts. Le co-admin ne connaît jamais le token propriétaire. La restriction de suppression est donc **enforcée côté serveur** (le RPC `tf_delete_survey` n'accepte que `surveys.token`, jamais `co_admin_token`).

**Nouvelles RPCs :**

- `tf_claim_coadmin(p_token text)` → vérifie que `p_token = surveys.co_admin_token`, ajoute `auth.uid()` dans `surveys.co_admin_user_ids`, retourne `{ co_admin_token, team_name, manager_name }`
- `tf_get_dashboard_coadmin(p_coadmin_token text)` → identique à `tf_get_dashboard` mais identifie le survey via `co_admin_token` (le bouton supprimer est caché côté JS sur la base du mode stocké en localStorage)
- `tf_get_my_surveys` mis à jour → retourne aussi les surveys où `auth.uid() = ANY(co_admin_user_ids)`
- `tf_revoke_coadmin(p_admin_token text)` → vide `co_admin_user_ids`, régénère `co_admin_token`

**`co_admin_invitations` :** stocke uniquement l'email invité pour l'afficher dans le dashboard ("Co-admin : email@example.com"). Le token d'invitation est `surveys.co_admin_token` (même token pour email et lien copié).

### Distinction propriétaire / co-admin côté JS

Après `tf_claim_coadmin` réussi, le co-admin stocke en localStorage :
```js
tf_coadmin_tokens: [{ token: co_admin_token, teamName, managerName }]
```
(liste séparée de `tf_admin_tokens`). Côté rendu, si le mode `coadmin` est actif, le bouton "Supprimer l'équipe" n'est pas rendu.

### i18n (fr + en)

| Clé | FR | EN |
|---|---|---|
| `tfCoAdmin` | Co-administrateur | Co-administrator |
| `tfNoCoAdmin` | Aucun co-admin pour cette équipe | No co-admin for this team |
| `tfInviteByEmail` | Inviter par email | Invite by email |
| `tfCopyLink` | Copier le lien | Copy link |
| `tfLinkCopied` | Lien copié ! | Link copied! |
| `tfRevokeCoAdmin` | Révoquer | Revoke |
| `tfCoAdminEmailLabel` | Email du co-admin | Co-admin email |
| `tfCoAdminInviteSent` | Invitation envoyée | Invitation sent |
| `tfCoAdminClaimTitle` | Accès co-administrateur | Co-admin access |
| `tfCoAdminClaimMsg` | Ce lien vous donne accès à l'équipe %name en tant que co-administrateur. Connectez-vous ou créez un compte Bloomday pour continuer. | This link gives you co-admin access to the team %name. Sign in or create a Bloomday account to continue. |
| `tfCoAdminSignIn` | Se connecter | Sign in |
| `tfCoAdminSignUp` | Créer un compte | Create an account |

### Ce qui est hors scope

- Plusieurs co-admins simultanés (1 seul co-admin par équipe pour l'instant)
- Co-admin qui peut lui-même inviter d'autres co-admins
- Historique des actions du co-admin
- Notifications push au co-admin lors d'un nouveau membre
