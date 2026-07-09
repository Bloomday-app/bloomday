# Design : Team-Form (recherche, filtre statut, anti-doublon) + tri Membres

**Date :** 2026-07-10
**Statut :** Approuvé

---

## Contexte

Retours utilisateur sur `team-form.html` et l'écran Membres de l'app principale :

1. Aucune barre de recherche dans le dashboard Team-Form pour retrouver un membre déjà ajouté.
2. Aucun moyen de filtrer les membres par statut (complété / en attente).
3. **Bug** : cliquer sur "Importer" un contact déjà importé l'importe quand même, créant des doublons dans `members`.
4. Un membre nouvellement ajouté apparaît en bas de la liste au lieu du haut.
5. Dans l'écran Membres d'un groupe (app principale), la liste n'est pas triée alphabétiquement.

**Hors périmètre** (traité séparément) : la synchronisation des contacts importés entre un admin et son co-admin. Investigation faite : `groups`/`members` sont scopés par `user_id`, un import écrit uniquement dans les données privées de l'utilisateur qui clique sur "Importer". Il n'existe aucun concept de groupe partagé multi-comptes dans l'app aujourd'hui — en faire une vraie synchro est une fonctionnalité à part (permissions, RLS, UI transverse), pas un bug fix. Ce sujet fera l'objet d'une conversation de design dédiée.

---

## Root cause du bug de doublons (item 3)

`TF.importedTokens` (`js/team-form.js:26`) est un `Set` JS en mémoire, jamais persisté. Il est vidé à chaque rechargement de page. Résultat : recharger le dashboard, ouvrir un nouvel onglet, ou consulter le dashboard en tant que co-admin fait disparaître l'état "déjà importé" — le bouton redevient cliquable et `tfImportMember()` (ligne 834) réinsère les mêmes lignes dans `members` sans aucune vérification serveur.

---

## 1. Recherche + filtre statut dans Team-Form

**Fichiers :** `js/team-form.js`, `team-form.html`

- Ajouter une barre de recherche au-dessus de la liste des membres du dashboard (même style visuel que `#search-inp` dans l'app principale), filtrant sur prénom + nom, tous statuts confondus (complétés + en attente).
- Ajouter des chips `Tous / Complétés / En attente` sous la barre de recherche (même pattern que les chips de mois existantes dans `rMembers()`).
- Recherche et filtre statut se combinent avant le rendu des cartes.
- Purement client-side dans `tfRenderDashboard()` — pas de changement serveur, pas de nouvelle RPC.
- État de recherche/filtre gardé dans une variable `TF` (ex. `TF.dashSearch`, `TF.dashStatusFilter`), reset à l'ouverture du dashboard (pas de persistance `localStorage`).

## 2. Anti-doublon persistant

**Fichiers :** nouvelle migration SQL, `js/team-form.js`

- Migration : `ALTER TABLE survey_members ADD COLUMN IF NOT EXISTS imported_at timestamptz;`
- Après un import réussi — dans `tfImportMember()` (import unitaire) et `tfSyncBloomday()` (import groupé) — faire `await supabase.from('survey_members').update({ imported_at: new Date().toISOString() }).eq('token', memberToken)` (ou `.in('token', tokens)` pour le groupé) juste après l'insert réussi dans `members`.
- Les RPC existantes (`tf_get_dashboard`, `tf_refresh_dashboard`, `tf_get_dashboard_coadmin`, `tf_refresh_dashboard_coadmin`) utilisent `json_agg(m ORDER BY m.created_at)` sur toute la ligne `survey_members` — `imported_at` remonte donc automatiquement dans le JSON sans toucher aux RPC.
- Au chargement du dashboard (`tfInitDashboard`, `tfInitCoadminDashboard`) et à chaque poll 30s (`tfLoadDashboardMembers`), reconstruire `TF.importedTokens` à partir de `m.imported_at` (non null) pour chaque membre. L'état "déjà importé" survit donc à un reload, un nouvel onglet, et est visible par le co-admin dans les 30s.
- Le bouton "Importer" se désactive immédiatement au clic (avant l'appel réseau), pour éviter qu'un double-clic rapide insère deux fois avant la mise à jour de l'état.
- Comportement final : si `imported_at` est déjà set, le bouton affiche "Déjà importé" (grisé, `disabled`, sans `onclick`) — aucun clic possible, donc aucun nouvel insert.

## 3. Nouveau membre en haut de la liste (Team-Form)

**Fichier :** `js/team-form.js`

- Dans `tfRenderDashboard()`, trier une copie de `TF.members` par `created_at` décroissant avant de générer les cartes (tri client, aucun changement RPC/SQL). S'applique aussi bien à l'ajout manuel depuis le dashboard qu'aux réponses reçues du formulaire.

## 4. Tri alphabétique de la liste Membres (A→Z / Z→A)

**Fichier :** `js/render.js` (`rMembers()`)

- Trier `filtered` par nom complet (`localeCompare`, insensible casse/accents) avant l'affichage, en remplacement de l'ordre d'ajout actuel.
- Ajouter un bouton icône `⇅` à côté de la barre de recherche existante (`#search-inp`) : un clic inverse l'ordre (A→Z ↔ Z→A).
- État de direction du tri gardé dans une variable JS (comme `fMonth`/`fType`), pas de persistance `localStorage` — repart toujours à A→Z à l'ouverture de l'app ou en changeant de groupe.
- La recherche et les filtres mois/type existants continuent de s'appliquer par-dessus, dans les deux sens de tri.

---

## Hors périmètre / suite

- Synchronisation des contacts importés entre admin et co-admin d'une équipe Team-Form : nécessite un vrai modèle de groupes partagés multi-comptes (RLS, permissions, UI transverse à l'app principale). À traiter dans une conversation de design séparée.
