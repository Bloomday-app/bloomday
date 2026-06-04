# Team Form — Améliorations UX

**Date :** 2026-06-04  
**Scope :** team-form.html, js/team-form.js, js/team-form-i18n.js, nouvelle migration SQL

---

## Contexte

La page `team-form.html` permet à un manager de collecter les anniversaires de son équipe. Quatre problèmes identifiés lors des tests utilisateur :

1. Le QR code s'ouvre dans une popup externe — inaccessible sur mobile, pas de retour, trop petit.
2. L'admin token est perdu si l'onglet est fermé — le manager doit tout recréer.
3. Impossible d'ajouter un membre après la création initiale de l'équipe.
4. Le message d'invitation par défaut mélange tutoiement ("t'invite") et vouvoiement ("vos moments"), et manque d'une signature claire.

---

## Décisions de design

### 1. QR Code — modal overlay

Remplacement de `window.open()` par une modal `<div id="tf-modal-qr">` en `position:fixed` avec fond semi-transparent.

**Contenu de la modal :**
- Nom du membre
- QR code centré, grand format (scale 6)
- URL en texte (petite, sous le QR)
- Bouton "Imprimer"
- Bouton ✕ pour fermer (retour au dashboard)

`tfShowQR(memberToken)` remplit et affiche la modal au lieu d'ouvrir une fenêtre. Fermeture via `tfCloseQRModal()`.

### 2. Persistance localStorage

Quand `tfSubmitCreate()` crée une équipe avec succès :
- Sauvegarde `localStorage.setItem('tf_admin_token', adminToken)` avant la redirection.

Au chargement (`DOMContentLoaded`) sans paramètre URL :
- Si `localStorage.getItem('tf_admin_token')` existe → redirection vers `?admin=TOKEN`.
- Sinon → affichage normal du wizard de création.

Sur le dashboard : bouton "Nouvelle équipe" placé dans la zone d'actions (même ligne que "Imprimer QR", "Exporter CSV"), pas dans la navbar — pour éviter un clic accidentel. Il efface `localStorage.removeItem('tf_admin_token')` et recharge `team-form.html` sans paramètre.

### 3. Ajouter un membre depuis le dashboard

Un bouton "+ Ajouter un membre" s'affiche dans les actions du dashboard (à côté des boutons "Imprimer QR" etc.).

En cliquant, un formulaire inline s'affiche en bas du dashboard :
- Champs : Prénom*, Nom, Email (optionnel), Relation (select utilisant `TF.relationLabels` de l'équipe existante)
- Bouton "Ajouter →" et bouton "Annuler"

En validant, appel RPC `tf_add_member(p_admin_token, p_member_json)`.  
Après succès, la liste des membres est rafraîchie et le formulaire se ferme. La nouvelle fiche membre apparaît immédiatement avec ses boutons de partage.

### 4. Message d'invitation corrigé

**Nouveau message par défaut (FR) :**
```
Bonjour [Prénom] !
[Manager] t'invite à compléter ton profil pour l'équipe [Équipe]. Ça prend 2 minutes et ça permettra de ne jamais rater tes moments importants 🎂
👉 [LIEN]

— L'équipe Bloomday 🌸
```

Changements :
- Saut de ligne après "Bonjour [Prénom] !"
- `"vos moments"` → `"tes moments"` (cohérence tutoiement)
- Signature `— L'équipe Bloomday 🌸` en fin de message

**Nouveau message par défaut (EN) :**
```
Hi [First name]!
[Manager] is inviting you to complete your profile for the [Team] team. Takes 2 minutes and will make sure no one ever misses your important moments 🎂
👉 [LINK]

— The Bloomday Team 🌸
```

---

## Migration SQL

Nouveau fichier : `supabase/migrations/20260604120000_tf_add_member.sql`

```sql
CREATE OR REPLACE FUNCTION tf_add_member(
  p_admin_token text,
  p_member      jsonb
)
RETURNS json
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
  v_survey_id uuid;
  v_member_id uuid;
BEGIN
  SELECT id INTO v_survey_id FROM surveys WHERE token = p_admin_token LIMIT 1;
  IF v_survey_id IS NULL THEN RETURN NULL; END IF;

  INSERT INTO survey_members (survey_id, token, first_name, last_name, email, relation)
  VALUES (
    v_survey_id,
    gen_random_uuid()::text,
    p_member->>'first_name',
    p_member->>'last_name',
    NULLIF(p_member->>'email', ''),
    NULLIF(p_member->>'relation', '')
  )
  RETURNING id INTO v_member_id;

  RETURN (SELECT row_to_json(m) FROM survey_members m WHERE m.id = v_member_id);
END;
$$;

GRANT EXECUTE ON FUNCTION tf_add_member(text, jsonb) TO anon;
```

---

## Fichiers modifiés

| Fichier | Changements |
|---|---|
| `team-form.html` | + modal QR (`#tf-modal-qr`) + styles CSS |
| `js/team-form.js` | `tfShowQR` → modal ; localStorage persistence ; `tfAddMemberDashboard()` ; `tfSubmitAddMember()` |
| `js/team-form-i18n.js` | Message FR et EN mis à jour ; nouvelles clés i18n pour le formulaire inline |
| `supabase/migrations/20260604120000_tf_add_member.sql` | Nouveau RPC `tf_add_member` |

---

## Ce que l'utilisateur doit faire

1. Exécuter la migration SQL dans le dashboard Supabase (éditeur SQL → coller le contenu du fichier de migration → Run).

Rien d'autre — le reste est purement frontend et se déploie via `git push`.
