# Supabase Phase 2 — Migration des données Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrer les données Bloomday de localStorage vers Supabase PostgreSQL pour activer le sync multi-device, avec localStorage comme cache offline.

**Architecture:** Pattern write-through cache — localStorage reste la source de vérité pour la session courante (lecture rapide, offline-first). À chaque sauvegarde, on écrit aussi dans Supabase. Au SIGNED_IN, on migre les données localStorage vers Supabase si c'est le premier login, puis on recharge depuis Supabase. Les groupes et membres sont les tables principales ; profil et stats sont aussi persistés.

**Tech Stack:** Supabase JS SDK (déjà chargé via CDN), Supabase PostgreSQL avec RLS, vanilla JS (pas de bundler).

---

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `js/db.js` | **Create** | CRUD Supabase : groupes, membres, profil, stats |
| `js/migration.js` | **Create** | Migration one-shot localStorage → Supabase |
| `js/auth.js` | **Modify** (lignes 27-49) | Déclencher migration + sync sur SIGNED_IN |
| `js/i18n.js` | **Modify** (lignes 4305-4309) | Write-through : saveG/saveSt/savePr pushent vers Supabase |
| `index.html` | **Modify** (ligne 444) | Ajouter les balises `<script>` pour db.js et migration.js |
| `netlify/functions/create-setup-intent.js` | **Modify** | Accepter userId, stocker stripe_customer_id dans profiles |

---

## Task 1: Schéma Supabase

**Files:** Aucun fichier modifié — SQL à exécuter dans le Supabase Dashboard > SQL Editor.

- [ ] **Step 1: Ouvrir le SQL Editor Supabase**

  Aller sur https://supabase.com/dashboard → projet Bloomday → **SQL Editor** → **New query**.

- [ ] **Step 2: Exécuter le SQL suivant**

```sql
-- Profils utilisateurs
CREATE TABLE IF NOT EXISTS profiles (
  id                  uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name                text,
  phone               text,
  plan                text NOT NULL DEFAULT 'free',
  plan_activated_at   timestamptz,
  stripe_customer_id  text,
  live                text DEFAULT 'fr',
  religion            text DEFAULT 'christian',
  created_at          timestamptz DEFAULT now()
);

-- Groupes
CREATE TABLE IF NOT EXISTS groups (
  id         text PRIMARY KEY,
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       text NOT NULL,
  icon       text,
  mode       text NOT NULL DEFAULT 'perso',
  created_at timestamptz DEFAULT now()
);

-- Membres
CREATE TABLE IF NOT EXISTS members (
  id         text PRIMARY KEY,
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  group_id   text REFERENCES groups(id) ON DELETE SET NULL,
  name       text NOT NULL,
  day        int,
  month      int,
  year       int,
  phone      text,
  note       text,
  type       text DEFAULT 'birthday',
  gender     text,
  created_at timestamptz DEFAULT now()
);

-- Stats
CREATE TABLE IF NOT EXISTS stats (
  user_id     uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  msgs_month  int NOT NULL DEFAULT 0,
  celeb       int NOT NULL DEFAULT 0,
  total_sent  int NOT NULL DEFAULT 0,
  total_gen   int NOT NULL DEFAULT 0,
  code        text,
  updated_at  timestamptz DEFAULT now()
);

-- RLS sur toutes les tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups   ENABLE ROW LEVEL SECURITY;
ALTER TABLE members  ENABLE ROW LEVEL SECURITY;
ALTER TABLE stats    ENABLE ROW LEVEL SECURITY;

-- Policies : chaque user voit/modifie uniquement ses données
CREATE POLICY "profiles_own" ON profiles USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "groups_own"   ON groups   USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "members_own"  ON members  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "stats_own"    ON stats    USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
```

- [ ] **Step 3: Vérifier**

  Aller dans **Table Editor** → vérifier que les 4 tables apparaissent (profiles, groups, members, stats).

---

## Task 2: Créer `js/db.js`

**Files:**
- Create: `js/db.js`

- [ ] **Step 1: Créer le fichier avec les fonctions de lecture**

```js
// ── DB.JS — Supabase data layer ──
// Utilise le client `supabase` global défini dans supabase-client.js

async function dbLoadGroups(userId) {
  try {
    var gRes = await supabase.from('groups').select('*').eq('user_id', userId);
    var mRes = await supabase.from('members').select('*').eq('user_id', userId);
    if (gRes.error || mRes.error) return null;
    var grps = gRes.data || [];
    var mbrs = mRes.data || [];
    return grps.map(function(g) {
      return {
        id: g.id,
        name: g.name,
        icon: g.icon,
        mode: g.mode,
        members: mbrs.filter(function(m) { return m.group_id === g.id; }).map(function(m) {
          return { id: m.id, name: m.name, day: m.day, month: m.month, year: m.year,
                   phone: m.phone, note: m.note, type: m.type, gender: m.gender };
        })
      };
    });
  } catch(e) { return null; }
}

async function dbLoadProfile(userId) {
  try {
    var res = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (res.error) return null;
    return res.data;
  } catch(e) { return null; }
}

async function dbLoadStats(userId) {
  try {
    var res = await supabase.from('stats').select('*').eq('user_id', userId).single();
    if (res.error) return null;
    var d = res.data;
    return { msgsM: d.msgs_month, celeb: d.celeb, totalSent: d.total_sent, totalGen: d.total_gen, code: d.code };
  } catch(e) { return null; }
}
```

- [ ] **Step 2: Ajouter les fonctions d'écriture**

Ajouter à la suite dans `js/db.js` :

```js
async function dbSaveGroups(userId, grps) {
  try {
    // Upsert groupes
    var gRows = (grps || []).map(function(g) {
      return { id: g.id, user_id: userId, name: g.name, icon: g.icon || '', mode: g.mode || 'perso' };
    });
    if (gRows.length) await supabase.from('groups').upsert(gRows);

    // Supprimer anciens membres puis réinsérer (plus simple qu'un diff)
    await supabase.from('members').delete().eq('user_id', userId);
    var mRows = [];
    (grps || []).forEach(function(g) {
      (g.members || []).forEach(function(m) {
        mRows.push({ id: String(m.id), user_id: userId, group_id: g.id,
                     name: m.name, day: m.day || null, month: m.month || null,
                     year: m.year || null, phone: m.phone || '', note: m.note || '',
                     type: m.type || 'birthday', gender: m.gender || '' });
      });
    });
    if (mRows.length) await supabase.from('members').insert(mRows);
  } catch(e) {}
}

async function dbSaveProfile(userId, prof) {
  try {
    await supabase.from('profiles').upsert({
      id: userId,
      name: prof.name || '',
      phone: prof.phone || '',
      live: prof.live || 'fr',
      religion: prof.religion || 'christian'
    });
  } catch(e) {}
}

async function dbSaveStats(userId, st) {
  try {
    await supabase.from('stats').upsert({
      user_id: userId,
      msgs_month: st.msgsM || 0,
      celeb: st.celeb || 0,
      total_sent: st.totalSent || 0,
      total_gen: st.totalGen || 0,
      code: st.code || '',
      updated_at: new Date().toISOString()
    });
  } catch(e) {}
}
```

- [ ] **Step 3: Commit**

```bash
git add js/db.js
git commit -m "feat: add Supabase data access layer (db.js)"
```

---

## Task 3: Créer `js/migration.js`

**Files:**
- Create: `js/migration.js`

- [ ] **Step 1: Créer le fichier**

```js
// ── MIGRATION.JS — localStorage → Supabase (one-shot) ──

async function migrateIfNeeded(userId) {
  if (localStorage.getItem('bdg16_migrated') === '1') return;

  // Vérifier si Supabase a déjà des données pour cet utilisateur
  try {
    var existing = await supabase.from('groups').select('id').eq('user_id', userId).limit(1);
    if (existing.data && existing.data.length > 0) {
      localStorage.setItem('bdg16_migrated', '1');
      return;
    }
  } catch(e) {}

  // Lire les données localStorage
  function lsGet(key, def) {
    try { var v = localStorage.getItem(key); return v ? JSON.parse(v) : def; } catch(e) { return def; }
  }

  var lsGroups  = lsGet('bdg16_groups', []);
  var lsProfile = lsGet('bdg16_profile', {});
  var lsStats   = lsGet('bdg16_stats', {});
  var lsPlan    = localStorage.getItem('bdg16_plan') || 'free';

  // Migrer profil
  try {
    await supabase.from('profiles').upsert({
      id: userId,
      name: lsProfile.name || '',
      phone: lsProfile.phone || '',
      plan: lsPlan,
      live: lsProfile.live || 'fr',
      religion: lsProfile.religion || 'christian'
    });
  } catch(e) {}

  // Migrer stats
  if (lsStats && Object.keys(lsStats).length) {
    try {
      await supabase.from('stats').upsert({
        user_id: userId,
        msgs_month: lsStats.msgsM || 0,
        celeb: lsStats.celeb || 0,
        total_sent: lsStats.totalSent || 0,
        total_gen: lsStats.totalGen || 0,
        code: lsStats.code || ''
      });
    } catch(e) {}
  }

  // Migrer groupes + membres
  if (lsGroups.length) {
    await dbSaveGroups(userId, lsGroups);
  }

  localStorage.setItem('bdg16_migrated', '1');
}
```

- [ ] **Step 2: Commit**

```bash
git add js/migration.js
git commit -m "feat: add localStorage-to-Supabase migration (migration.js)"
```

---

## Task 4: Ajouter les scripts dans `index.html`

**Files:**
- Modify: `index.html` (ligne 444, après supabase-client.js)

- [ ] **Step 1: Ajouter les deux balises script**

Dans `index.html`, trouver la ligne :
```html
  <script src="js/supabase-client.js?v=20260505a"></script>
```

Remplacer par :
```html
  <script src="js/supabase-client.js?v=20260505a"></script>
  <script src="js/db.js?v=20260505b"></script>
  <script src="js/migration.js?v=20260505b"></script>
```

- [ ] **Step 2: Commit**

```bash
git add index.html
git commit -m "chore: load db.js and migration.js in index.html"
```

---

## Task 5: Déclencher la migration dans `auth.js`

**Files:**
- Modify: `js/auth.js` (bloc `SIGNED_IN`, lignes 28-44)

- [ ] **Step 1: Modifier le handler SIGNED_IN**

Dans `js/auth.js`, remplacer le bloc du handler `onAuthStateChange` :

**Avant (lignes 28-44) :**
```js
  supabase.auth.onAuthStateChange(function(event, session) {
    if (event === 'SIGNED_IN' && session) {
      var isNew = !currentUser;
      currentUser = buildUserFromSession(session);
      safeLsSet('bdg16_user', JSON.stringify(currentUser));
      if (isNew) {
        closeOv('m-auth');
        showToast(t('welcomeUser') + ' ' + currentUser.name.split(' ')[0] + ' !', 'success');
        sendEmail('welcome', { name: currentUser.name, email: currentUser.email });
      }
      updateTopbar();
      var logoutBtnIn = document.getElementById('tb-logout');
      if (logoutBtnIn) logoutBtnIn.style.display = 'inline-block';
      refresh();
    } else if (event === 'SIGNED_OUT') {
```

**Après :**
```js
  supabase.auth.onAuthStateChange(async function(event, session) {
    if (event === 'SIGNED_IN' && session) {
      var isNew = !currentUser;
      currentUser = buildUserFromSession(session);
      safeLsSet('bdg16_user', JSON.stringify(currentUser));

      // Migration one-shot localStorage → Supabase
      await migrateIfNeeded(currentUser.uid);

      // Charger les données Supabase et mettre à jour localStorage + globales
      var sbGroups = await dbLoadGroups(currentUser.uid);
      if (sbGroups && sbGroups.length) {
        groups = sbGroups;
        sg('bdg16_groups', groups);
      }
      var sbStats = await dbLoadStats(currentUser.uid);
      if (sbStats) {
        Object.assign(stats, sbStats);
        sg('bdg16_stats', stats);
      }
      var sbProfile = await dbLoadProfile(currentUser.uid);
      if (sbProfile) {
        profile.live = sbProfile.live || profile.live;
        profile.religion = sbProfile.religion || profile.religion;
        sg('bdg16_profile', profile);
      }

      if (isNew) {
        closeOv('m-auth');
        showToast(t('welcomeUser') + ' ' + currentUser.name.split(' ')[0] + ' !', 'success');
        sendEmail('welcome', { name: currentUser.name, email: currentUser.email });
      }
      updateTopbar();
      var logoutBtnIn = document.getElementById('tb-logout');
      if (logoutBtnIn) logoutBtnIn.style.display = 'inline-block';
      refresh();
    } else if (event === 'SIGNED_OUT') {
```

- [ ] **Step 2: Commit**

```bash
git add js/auth.js
git commit -m "feat: trigger migration and Supabase sync on SIGNED_IN"
```

---

## Task 6: Write-through dans les fonctions de sauvegarde (`i18n.js`)

**Files:**
- Modify: `js/i18n.js` (lignes 4305-4309)

- [ ] **Step 1: Mettre à jour les fonctions save**

Dans `js/i18n.js`, remplacer les lignes 4305-4309 :

**Avant :**
```js
const saveG=()=>sg('bdg16_groups',groups);
const saveA=()=>sg('bdg16_admins',admins);
const saveH=()=>sg('bdg16_hist',hist);
const saveSt=()=>sg('bdg16_stats',stats);
const savePr=()=>{buildCats();sg('bdg16_profile',profile);};
```

**Après :**
```js
const saveG=()=>{sg('bdg16_groups',groups);if(currentUser)dbSaveGroups(currentUser.uid,groups);};
const saveA=()=>sg('bdg16_admins',admins);
const saveH=()=>sg('bdg16_hist',hist);
const saveSt=()=>{sg('bdg16_stats',stats);if(currentUser)dbSaveStats(currentUser.uid,stats);};
const savePr=()=>{buildCats();sg('bdg16_profile',profile);if(currentUser)dbSaveProfile(currentUser.uid,profile);};
```

- [ ] **Step 2: Commit**

```bash
git add js/i18n.js
git commit -m "feat: write-through to Supabase on saveG/saveSt/savePr"
```

---

## Task 7: Mettre à jour `create-setup-intent.js` (Stripe → profil Supabase)

**Files:**
- Modify: `netlify/functions/create-setup-intent.js`

- [ ] **Step 1: Accepter userId et stocker stripe_customer_id dans Supabase**

Dans `netlify/functions/create-setup-intent.js`, après la création du customer Stripe (ligne ~38), ajouter la mise à jour du profil Supabase.

Remplacer le contenu de `exports.handler` après la ligne `const email = ...` par :

```js
  const email = (body.email || '').substring(0, 254);
  const planId = (body.plan || 'bloom').substring(0, 20);
  const userId = (body.userId || '').substring(0, 36);

  // Créer un Customer Stripe
  const customer = await stripePost('/v1/customers', secretKey, {
    email: email || undefined,
    metadata: { plan: planId, source: 'bloomday_trial', supabase_user_id: userId },
  });
  if (customer.error) {
    return { statusCode: 502, body: JSON.stringify({ error: customer.error.message }) };
  }

  // Stocker stripe_customer_id dans Supabase profiles si userId fourni
  if (userId) {
    const { createClient } = require('@supabase/supabase-js');
    const sbAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    await sbAdmin.from('profiles').upsert({ id: userId, plan: planId, stripe_customer_id: customer.id, plan_activated_at: new Date().toISOString() });
  }

  // Créer un SetupIntent attaché au customer
  const intent = await stripePost('/v1/setup_intents', secretKey, {
    customer: customer.id,
    usage: 'off_session',
    metadata: { plan: planId },
  });
  if (intent.error) {
    return { statusCode: 502, body: JSON.stringify({ error: intent.error.message }) };
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': origin || '*' },
    body: JSON.stringify({ clientSecret: intent.client_secret, customerId: customer.id }),
  };
```

- [ ] **Step 2: Mettre à jour l'appel frontend dans `js/features.js`**

Dans `js/features.js`, trouver le `fetch('/.netlify/functions/create-setup-intent'` et ajouter `userId` dans le body :

```js
var resp=await fetch('/.netlify/functions/create-setup-intent',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({plan:targetPlan,email:ei.value.trim(),userId:currentUser?currentUser.uid:''})});
```

- [ ] **Step 3: Ajouter @supabase/supabase-js aux dépendances backend**

Vérifier si déjà installé :
```bash
cat package.json | grep supabase
```

Si absent, installer :
```bash
npm install @supabase/supabase-js
```

- [ ] **Step 4: Commit**

```bash
git add netlify/functions/create-setup-intent.js js/features.js package.json package-lock.json
git commit -m "feat: store stripe_customer_id in Supabase profiles on subscription"
```

---

## Task 8: Vérification manuelle (test end-to-end)

**Files:** Aucun fichier modifié.

- [ ] **Step 1: Lancer le serveur local**

```bash
netlify dev
```

- [ ] **Step 2: Test — Utilisateur existant avec données localStorage**

  1. Ouvrir http://localhost:8888 en mode navigation privée
  2. Entrer dans l'app sans se connecter → ajouter 2-3 membres dans un groupe
  3. Se connecter avec un compte email (existant ou nouveau)
  4. Vérifier dans Supabase Dashboard → Table Editor → tables `groups` et `members` : les membres migrés doivent apparaître
  5. Vérifier que `localStorage.getItem('bdg16_migrated')` vaut `'1'` (console du navigateur)

- [ ] **Step 3: Test — Sync multi-device**

  1. Ouvrir un second navigateur (ou profil Chrome différent)
  2. Se connecter avec le même compte
  3. Vérifier que les mêmes membres apparaissent

- [ ] **Step 4: Test — Sauvegarde write-through**

  1. Toujours connecté, ajouter un nouveau membre
  2. Vérifier dans Supabase Dashboard → `members` : le nouveau membre apparaît

- [ ] **Step 5: Test — Utilisateur non connecté**

  1. Se déconnecter
  2. Ajouter un membre → vérifier que l'app fonctionne normalement (localStorage uniquement)
  3. Vérifier qu'aucune erreur JS n'apparaît dans la console

---

## Notes d'implémentation

- `dbSaveGroups` fait un delete+reinsert des membres (pas un diff). C'est intentionnel — les données sont petites et cela évite une logique de diff complexe.
- Les IDs des groupes et membres sont des strings (ex: `g1`, `m1704067200000_abc`) — la table utilise `text` pour PRIMARY KEY.
- `currentUser` est une variable globale définie dans `features.js` / `auth.js`. Les fonctions db.js y accèdent via le closure window global.
- La migration ne supprime PAS localStorage — il reste le fallback offline.
- En cas d'erreur Supabase (réseau, RLS), les fonctions échouent silencieusement (catch vide) — l'app continue avec localStorage.
