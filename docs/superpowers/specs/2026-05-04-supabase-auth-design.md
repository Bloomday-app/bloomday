# Bloomday — Supabase Auth & Data Migration

**Date:** 2026-05-04
**Scope:** Migration complète de localStorage vers Supabase Auth + DB
**Approche retenue:** Phase 1 (auth) puis Phase 2 (données)

---

## Contexte

Bloomday est un site statique vanilla JS hébergé sur Netlify. Toute la persistance est actuellement dans `localStorage` (`bdg16_*`). Les utilisateurs sont identifiés par un `uid` généré côté client — facilement falsifiable, ce qui rend les quotas IA contournables. L'objectif est une protection totale des quotas + sync multi-device.

---

## Architecture cible

```
Browser (vanilla JS)
  └── supabase-js (CDN)
  └── Auth state : Supabase session (JWT)
  └── Données phase 1 : localStorage (inchangé)
  └── Données phase 2 : Supabase DB

Netlify Functions
  └── generate-message.js → vérifie JWT → user.id réel
  └── send-email.js (inchangé)
  └── create-setup-intent.js (user.id Supabase en phase 2)

Supabase Cloud
  └── Auth : email+password + Google OAuth
  └── DB : profiles, groups, members, stats, msg_history
  └── RLS : user_id = auth.uid() sur toutes les tables
```

---

## Phase 1 — Auth Supabase (2-3 jours)

### Objectif
Remplacer l'auth localStorage par Supabase Auth. Les données restent dans localStorage. Les quotas IA sont protégés par JWT vérifié server-side.

### Frontend

**Chargement :** `supabase-js` via CDN dans `index.html`. Client initialisé avec `SUPABASE_URL` et `SUPABASE_ANON_KEY` (publics, sûrs côté client).

**`js/auth.js` (nouveau fichier) :**
- `initAuth()` — écoute `onAuthStateChange`, reconstruit `currentUser` depuis la session Supabase
- `doRegister(name, email, phone, password)` → `supabase.auth.signUp()` + `sendEmail('welcome', ...)`
- `doLogin(email, password)` → `supabase.auth.signInWithPassword()`
- `doGoogleLogin()` → `supabase.auth.signInWithOAuth({ provider: 'google' })`
- `doLogout()` → `supabase.auth.signOut()`

**`features.js` :** `doRegister()` et `doLogin()` délèguent à `js/auth.js`. `getOrCreateUID()` retourne `supabase.auth.getSession().user.id` si connecté, sinon uid localStorage (utilisateurs anonymes).

**Appels `generate-message` :** tous les `fetch` ajoutent :
```js
headers: {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer ' + (await supabase.auth.getSession()).data.session?.access_token
}
```

**Google OAuth :** redirect URL `https://bloomday-day.netlify.app/auth/callback` configurée dans Supabase dashboard. Page `auth/callback` gère le hash fragment et redirige vers `/`.

### Backend — `generate-message.js`

Vérification JWT via l'endpoint Supabase `/auth/v1/user` (Authorization: Bearer token). Si valide → `user.id` réel utilisé pour les quotas Netlify Blobs. Si token absent ou invalide → fallback sur IP (utilisateurs anonymes, quota plus strict : 3/mois).

```
GET /auth/v1/user
Authorization: Bearer <token>
→ { id: "uuid-réel", email: "..." }
```

### Variables d'environnement Netlify
- `SUPABASE_URL` — URL du projet Supabase
- `SUPABASE_SERVICE_ROLE_KEY` — clé service (côté fonction uniquement, non exposée)

### Quotas mis à jour
| Contexte | Quota mensuel |
|---|---|
| Utilisateur authentifié — free | 5 msg/mois |
| Utilisateur authentifié — solo | 30 msg/mois |
| Utilisateur authentifié — bloom+ | illimité |
| Anonyme (sans compte) | 3 msg/mois (par IP) |

---

## Phase 2 — Migration des données (1 semaine)

### Schéma Supabase

```sql
-- Profils utilisateurs (étend auth.users)
CREATE TABLE profiles (
  id              uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name            text,
  phone           text,
  plan            text NOT NULL DEFAULT 'free',
  plan_activated_at timestamptz,
  stripe_customer_id text,
  created_at      timestamptz DEFAULT now()
);

-- Groupes
CREATE TABLE groups (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       text NOT NULL,
  mode       text NOT NULL DEFAULT 'perso',
  created_at timestamptz DEFAULT now()
);

-- Membres
CREATE TABLE members (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  group_id   uuid REFERENCES groups(id) ON DELETE SET NULL,
  name       text NOT NULL,
  day        int NOT NULL,
  month      int NOT NULL,
  year       int,
  note       text,
  phone      text,
  gender     text,
  type       text,
  created_at timestamptz DEFAULT now()
);

-- Stats
CREATE TABLE stats (
  user_id    uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  msgs_month int NOT NULL DEFAULT 0,
  celeb      int NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

-- Historique messages
CREATE TABLE msg_history (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  member_id  uuid REFERENCES members(id) ON DELETE SET NULL,
  date       date NOT NULL DEFAULT current_date,
  text       text NOT NULL
);
```

### Row Level Security

Chaque table active RLS avec une policy identique :
```sql
ALTER TABLE <table> ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_owns_data" ON <table>
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
```

### Migration localStorage → Supabase

`js/migration.js` (nouveau fichier) — fonction `migrateIfNeeded()` :
1. Vérifie `localStorage.getItem('bdg16_migrated')` — si présent, skip
2. Lit toutes les clés `bdg16_*`
3. Insère en batch dans Supabase (profiles, groups, members, stats)
4. Pose `localStorage.setItem('bdg16_migrated', '1')`
5. Ne supprime PAS localStorage (garde en fallback offline)

Appelée une fois après le premier login réussi.

### Mise à jour des fonctions de lecture/écriture

`js/db.js` (nouveau fichier) remplace les accès directs à localStorage :
- `getMembers()` → `supabase.from('members').select()`
- `addMember(data)` → `supabase.from('members').insert()`
- `updateMember(id, data)` → `supabase.from('members').update()`
- `deleteGroup(id)` → `supabase.from('groups').delete()`
- etc.

Fallback offline : si `navigator.onLine === false`, utilise les données localStorage mises en cache.

### Stripe

`create-setup-intent.js` accepte `userId` (Supabase UUID) dans le body. `stripe_customer_id` stocké dans `profiles`. Supprime la dépendance à l'uid localStorage côté paiement.

---

## Ce qui ne change pas

- Templates email et `send-email.js`
- Logique de génération IA (prompt, modèle Haiku 4.5)
- Plans et tarifs
- UI/UX — aucun changement visible pour l'utilisateur sauf ajout du bouton Google

---

## Risques

| Risque | Mitigation |
|---|---|
| Utilisateurs existants perdent leurs données | Migration automatique au premier login |
| Supabase indisponible | Fallback localStorage pour lecture offline |
| Google OAuth mal configuré | Redirect URL testée en staging avant prod |
| RLS bloque des requêtes légitimes | Tests unitaires sur chaque policy avant deploy |
