# Team-Form Search/Dedup/Sort Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the Team-Form duplicate-import bug with a persistent server-side flag, add search + status filter + newest-first ordering to the Team-Form dashboard, and add an alphabetical A→Z/Z→A sort to the main app's group Members list.

**Architecture:** Team-Form changes are additive: one nullable `imported_at` column on `survey_members`, client-side search/filter/sort applied over the already-fetched `TF.members` array (no new RPCs needed since existing RPCs already `json_agg` the whole row). Members-list sort is a pure client-side change in `js/render.js`/`js/core.js` using `localeCompare` over the existing in-memory group data — no backend change.

**Tech Stack:** Vanilla JS ES6+ (no bundler), Supabase (Postgres + `supabase-js` client), no test framework — verification is `node --check` for syntax plus manual browser QA.

## Global Constraints

- No npm dependencies may be introduced (vanilla JS only, project-wide rule).
- Every user-visible string in `js/i18n.js` must exist in all 7 languages: fr, en, es, ar, hi, zh, pt.
- Every user-visible string in `js/team-form-i18n.js` must exist in fr and en (this file's own established 2-language convention — do not add the other 5 here).
- Never rename existing HTML IDs or JS function names without grepping all callers first.
- After every JS file edit: run `node --check js/<file>.js` before moving on.
- Do not run destructive git commands. Do not push to Netlify/GitHub as part of this plan — that's a separate, explicit step the user triggers via `/ship-bloomday`.

---

### Task 1: Migration — `imported_at` column on `survey_members`

**Files:**
- Create: `supabase/migrations/20260710120000_tf_survey_members_imported_at.sql`

**Interfaces:**
- Produces: a nullable `survey_members.imported_at timestamptz` column, consumed by Task 2 (set via `UPDATE`) and returned automatically in the JSON from `tf_get_dashboard`, `tf_refresh_dashboard`, `tf_get_dashboard_coadmin`, `tf_refresh_dashboard_coadmin` (all use `json_agg(m ...)` on the full row, so no RPC changes needed).

- [ ] **Step 1: Write the migration file**

```sql
-- Ajout du suivi d'import pour éviter les doublons (Team-Form → Bloomday).
-- Nullable : les lignes existantes restent "non importées" (imported_at IS NULL).
ALTER TABLE survey_members
  ADD COLUMN IF NOT EXISTS imported_at timestamptz;
```

- [ ] **Step 2: Verify SQL syntax**

Run: `cat supabase/migrations/20260710120000_tf_survey_members_imported_at.sql`
Expected: file prints exactly the SQL above, no trailing errors.

- [ ] **Step 3: Apply the migration to the Supabase project**

This project's existing migrations are applied by running, from the repo root:
```bash
supabase login   # only if not already authenticated — opens a browser flow
supabase db push
```
If `supabase login` isn't possible in this environment (no browser / no access token), tell the user directly: "The `imported_at` migration needs to be applied to the Supabase project via `supabase db push` (after `supabase login`) or by pasting the SQL from `supabase/migrations/20260710120000_tf_survey_members_imported_at.sql` into the Supabase Dashboard's SQL editor. Task 2's code depends on this column existing in production before it ships." Do not skip this — inserting into `.update({imported_at: ...})` before the column exists will silently no-op or error depending on RLS, and must not be masked.

- [ ] **Step 4: Confirm the column exists**

Run (via `psql` connection string from the Supabase dashboard, or the SQL editor):
```sql
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'survey_members' AND column_name = 'imported_at';
```
Expected: one row, `imported_at | timestamp with time zone`.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20260710120000_tf_survey_members_imported_at.sql
git commit -m "feat(team-form): ajouter colonne imported_at pour anti-doublon persistant"
```

---

### Task 2: Persist and rehydrate the "already imported" state

**Files:**
- Modify: `js/team-form.js:834-879` (`tfImportMember`)
- Modify: `js/team-form.js:882-942` (`tfSyncBloomday`)
- Modify: `js/team-form.js:429-499` (`tfInitDashboard`, `tfInitCoadminDashboard`, `tfLoadDashboardMembers`)

**Interfaces:**
- Consumes: `supabase.from('survey_members').update(...)` (existing Supabase client, `survey_members` RLS policy is `FOR ALL USING (true) WITH CHECK (true)` so this works without an RPC), the `imported_at` column from Task 1.
- Produces: `TF.importedTokens` (existing `Set`, `js/team-form.js:26`) now stays accurate across page reloads, new tabs, and co-admin sessions. Task 3 renders off this same `Set`, unchanged.

- [ ] **Step 1: Replace `tfImportMember` to persist `imported_at` and guard against double-click**

Find this exact block in `js/team-form.js` (currently lines 834-879):

```js
// ── IMPORT UNITAIRE ──
async function tfImportMember(memberToken) {
  if (TF.importedTokens.has(memberToken)) {
    tfToast(tfT('alreadyImported'));
    return;
  }
  var m = TF.members.find(function(x) { return x.token === memberToken; });
  if (!m || !m.completed) return;

  var sessRes = await supabase.auth.getSession();
  var userId = sessRes.data && sessRes.data.session && sessRes.data.session.user && sessRes.data.session.user.id;
  if (!userId) { alert(tfT('syncNotConnected')); return; }

  var gRes = await supabase.from('groups').select('id').eq('user_id', userId).eq('name', TF.survey.team_name).maybeSingle();
  var groupId;
  if (gRes.data && gRes.data.id) {
    groupId = gRes.data.id;
  } else {
    var newG = await supabase.from('groups').insert({ id: 'g' + Date.now(), user_id: userId, name: TF.survey.team_name, icon: '👥', mode: 'biz' }).select('id').single();
    if (newG.error) { alert('Erreur groupe : ' + newG.error.message); return; }
    groupId = newG.data.id;
  }

  var rows = [];
  var base = Date.now();
  var fullName = (m.first_name + ' ' + m.last_name).trim();
  var note = m.relation ? 'Relation : ' + m.relation : '';
  if (m.birth_day && m.birth_month) {
    rows.push({ id: String(base), user_id: userId, group_id: groupId, name: fullName, day: m.birth_day, month: m.birth_month, year: m.birth_year || null, phone: ((m.phone_code || '') + (m.phone_number || '')).trim(), note: note, type: 'birthday', gender: m.gender || '', incomplete: false, notif_days_before: null, notif_time: null });
  }
  if (m.married && m.wedding_day && m.wedding_month) {
    rows.push({ id: String(base + 1), user_id: userId, group_id: groupId, name: fullName + ' (mariage avec ' + (m.spouse_name || '?') + ')', day: m.wedding_day, month: m.wedding_month, year: m.wedding_year || null, phone: ((m.phone_code || '') + (m.phone_number || '')).trim(), note: note, type: 'wedding', gender: '', incomplete: false, notif_days_before: null, notif_time: null });
  }
  if (!rows.length) { tfToast(tfLang() === 'fr' ? 'Aucune date à importer.' : 'No date to import.'); return; }
  var iRes = await supabase.from('members').insert(rows);
  if (iRes.error) { alert('Erreur import : ' + iRes.error.message); return; }
  tfUpdateLocalStorage(groupId, TF.survey.team_name, rows);
  TF.importedTokens.add(memberToken);
  var importBtn = document.querySelector('[onclick*="tfImportMember"][data-token="' + memberToken + '"]');
  if (importBtn) {
    importBtn.disabled = true;
    importBtn.style.cssText = 'grid-column:span 2;background:#ddd;border-color:#aaa;color:#888;font-weight:700;cursor:default';
    importBtn.textContent = tfT('alreadyImported');
    importBtn.removeAttribute('onclick');
  }
  tfToast(tfT('syncSuccess').replace('%d', rows.length));
}
```

Replace it with:

```js
// ── IMPORT UNITAIRE ──
async function tfImportMember(memberToken) {
  if (TF.importedTokens.has(memberToken)) {
    tfToast(tfT('alreadyImported'));
    return;
  }
  var importBtn = document.querySelector('[onclick*="tfImportMember"][data-token="' + memberToken + '"]');
  if (importBtn) {
    if (importBtn.disabled) return;
    importBtn.disabled = true;
  }
  var m = TF.members.find(function(x) { return x.token === memberToken; });
  if (!m || !m.completed) { if (importBtn) importBtn.disabled = false; return; }

  var sessRes = await supabase.auth.getSession();
  var userId = sessRes.data && sessRes.data.session && sessRes.data.session.user && sessRes.data.session.user.id;
  if (!userId) { alert(tfT('syncNotConnected')); if (importBtn) importBtn.disabled = false; return; }

  var gRes = await supabase.from('groups').select('id').eq('user_id', userId).eq('name', TF.survey.team_name).maybeSingle();
  var groupId;
  if (gRes.data && gRes.data.id) {
    groupId = gRes.data.id;
  } else {
    var newG = await supabase.from('groups').insert({ id: 'g' + Date.now(), user_id: userId, name: TF.survey.team_name, icon: '👥', mode: 'biz' }).select('id').single();
    if (newG.error) { alert('Erreur groupe : ' + newG.error.message); if (importBtn) importBtn.disabled = false; return; }
    groupId = newG.data.id;
  }

  var rows = [];
  var base = Date.now();
  var fullName = (m.first_name + ' ' + m.last_name).trim();
  var note = m.relation ? 'Relation : ' + m.relation : '';
  if (m.birth_day && m.birth_month) {
    rows.push({ id: String(base), user_id: userId, group_id: groupId, name: fullName, day: m.birth_day, month: m.birth_month, year: m.birth_year || null, phone: ((m.phone_code || '') + (m.phone_number || '')).trim(), note: note, type: 'birthday', gender: m.gender || '', incomplete: false, notif_days_before: null, notif_time: null });
  }
  if (m.married && m.wedding_day && m.wedding_month) {
    rows.push({ id: String(base + 1), user_id: userId, group_id: groupId, name: fullName + ' (mariage avec ' + (m.spouse_name || '?') + ')', day: m.wedding_day, month: m.wedding_month, year: m.wedding_year || null, phone: ((m.phone_code || '') + (m.phone_number || '')).trim(), note: note, type: 'wedding', gender: '', incomplete: false, notif_days_before: null, notif_time: null });
  }
  if (!rows.length) { tfToast(tfLang() === 'fr' ? 'Aucune date à importer.' : 'No date to import.'); if (importBtn) importBtn.disabled = false; return; }
  var iRes = await supabase.from('members').insert(rows);
  if (iRes.error) { alert('Erreur import : ' + iRes.error.message); if (importBtn) importBtn.disabled = false; return; }
  tfUpdateLocalStorage(groupId, TF.survey.team_name, rows);
  await supabase.from('survey_members').update({ imported_at: new Date().toISOString() }).eq('token', memberToken);
  TF.importedTokens.add(memberToken);
  m.imported_at = new Date().toISOString();
  if (importBtn) {
    importBtn.disabled = true;
    importBtn.style.cssText = 'grid-column:span 2;background:#ddd;border-color:#aaa;color:#888;font-weight:700;cursor:default';
    importBtn.textContent = tfT('alreadyImported');
    importBtn.removeAttribute('onclick');
  }
  tfToast(tfT('syncSuccess').replace('%d', rows.length));
}
```

Key changes: the import button is disabled *before* the first `await` (prevents a fast double-click from firing two inserts before `TF.importedTokens` updates), and a `survey_members` update persists `imported_at` right after the `members` insert succeeds.

- [ ] **Step 2: Make `tfSyncBloomday` skip already-imported members and persist `imported_at` for the ones it does import**

Find this exact block (currently lines 882-942):

```js
// ── SYNC DIRECTE BLOOMDAY ──
async function tfSyncBloomday() {
  var sessRes = await supabase.auth.getSession();
  var userId = sessRes.data && sessRes.data.session && sessRes.data.session.user && sessRes.data.session.user.id;
  if (!userId) { alert(tfT('syncNotConnected')); return; }

  var completed = TF.members.filter(function(m) { return m.completed; });
  if (!completed.length) { alert('Aucun membre complété.'); return; }
```

Replace the `completed` line with:

```js
// ── SYNC DIRECTE BLOOMDAY ──
async function tfSyncBloomday() {
  var sessRes = await supabase.auth.getSession();
  var userId = sessRes.data && sessRes.data.session && sessRes.data.session.user && sessRes.data.session.user.id;
  if (!userId) { alert(tfT('syncNotConnected')); return; }

  var completed = TF.members.filter(function(m) { return m.completed && !TF.importedTokens.has(m.token); });
  if (!completed.length) { tfToast(tfT('alreadyImported')); return; }
```

Then find the end of the same function (currently lines 938-942):

```js
  var iRes = await supabase.from('members').insert(rows);
  if (iRes.error) { alert('Erreur import : ' + iRes.error.message); return; }
  tfUpdateLocalStorage(groupId, TF.survey.team_name, rows);
  tfToast(tfT('syncSuccess').replace('%d', rows.length));
}
```

Replace with:

```js
  var iRes = await supabase.from('members').insert(rows);
  if (iRes.error) { alert('Erreur import : ' + iRes.error.message); return; }
  tfUpdateLocalStorage(groupId, TF.survey.team_name, rows);
  var importedTokensNow = completed.map(function(m) { return m.token; });
  await supabase.from('survey_members').update({ imported_at: new Date().toISOString() }).in('token', importedTokensNow);
  importedTokensNow.forEach(function(tok) {
    TF.importedTokens.add(tok);
    var mm = TF.members.find(function(x) { return x.token === tok; });
    if (mm) mm.imported_at = new Date().toISOString();
  });
  tfToast(tfT('syncSuccess').replace('%d', rows.length));
  tfRenderDashboard();
}
```

`tfSyncBloomday` ("Tout importer dans Bloomday") previously re-imported every completed member on every click, ignoring anything already imported one-by-one or in a previous bulk sync — this was the other half of the duplicates bug. It now only imports members not yet flagged, and re-renders the dashboard so their individual "Importer" buttons flip to "Déjà importé".

- [ ] **Step 3: Rehydrate `TF.importedTokens` from `imported_at` on dashboard load and poll refresh**

Find in `tfInitDashboard` (currently lines 429-444):

```js
  TF.survey = res.data.survey;
  TF.members = res.data.members || [];
  tfSaveAdminToken(TF.adminToken, TF.survey.team_name, TF.survey.manager_name);
```

Replace with:

```js
  TF.survey = res.data.survey;
  TF.members = res.data.members || [];
  TF.members.forEach(function(m) { if (m.imported_at) TF.importedTokens.add(m.token); });
  tfSaveAdminToken(TF.adminToken, TF.survey.team_name, TF.survey.manager_name);
```

Find in `tfInitCoadminDashboard` (currently lines 478-486):

```js
  TF.survey = res.data.survey || {};
  TF.members = res.data.members || [];
  TF.isCoadmin = true;
```

Replace with:

```js
  TF.survey = res.data.survey || {};
  TF.members = res.data.members || [];
  TF.members.forEach(function(m) { if (m.imported_at) TF.importedTokens.add(m.token); });
  TF.isCoadmin = true;
```

Find `tfLoadDashboardMembers` (currently lines 494-499):

```js
async function tfLoadDashboardMembers() {
  var res = TF.isCoadmin
    ? await supabase.rpc('tf_refresh_dashboard_coadmin', { p_coadmin_token: TF.coadminToken })
    : await supabase.rpc('tf_refresh_dashboard', { p_admin_token: TF.adminToken });
  if (!res.error && res.data) { TF.members = res.data; tfRenderDashboard(); }
}
```

Replace with:

```js
async function tfLoadDashboardMembers() {
  var res = TF.isCoadmin
    ? await supabase.rpc('tf_refresh_dashboard_coadmin', { p_coadmin_token: TF.coadminToken })
    : await supabase.rpc('tf_refresh_dashboard', { p_admin_token: TF.adminToken });
  if (!res.error && res.data) {
    TF.members = res.data;
    TF.members.forEach(function(m) { if (m.imported_at) TF.importedTokens.add(m.token); });
    tfRenderDashboard();
  }
}
```

- [ ] **Step 4: Verify syntax**

Run: `node --check js/team-form.js`
Expected: no output, exit code 0.

- [ ] **Step 5: Manual verification**

Requires Task 1's migration already applied to a Supabase project reachable from this environment.

1. Open `team-form.html?admin=<a real admin token from an existing test team>` in a browser.
2. Import one completed member individually — confirm the button flips to "✓ Déjà importé dans Bloomday" and stays disabled.
3. Reload the page. Expected: that same member's button still shows "✓ Déjà importé dans Bloomday" (this was the bug — previously it would revert to "🌸 Importer ce contact" after reload).
4. Click "🌸 Tout importer dans Bloomday". Expected: the already-imported member from step 2 is not re-inserted (check the `members` table row count for that name stays at 1), and every other completed member gets imported and their individual buttons update to "Déjà importé" without a page reload.
5. Click "🌸 Tout importer dans Bloomday" again with nothing new completed. Expected: a toast reading "✓ Déjà importé dans Bloomday" (no alert, no new rows).

- [ ] **Step 6: Commit**

```bash
git add js/team-form.js
git commit -m "fix(team-form): anti-doublon persistant via imported_at (survit au reload et au co-admin)"
```

---

### Task 3: Search bar + status filter + newest-first order in the Team-Form dashboard

**Files:**
- Modify: `team-form.html:131-133` (add toolbar container + CSS)
- Modify: `js/team-form-i18n.js` (add `tfSearchPlaceholder`, `tfFilterAll`, `tfNoSearchResults` in fr + en)
- Modify: `js/team-form.js` (TF state, `tfRenderDashboard`, new `tfRenderDashboardToolbar`/`tfRenderMemberList`/`tfOnDashSearchInput`/`tfClearDashSearch`/`tfSetDashFilter`)

**Interfaces:**
- Consumes: `TF.members` (existing), `TF.importedTokens` (from Task 2), `tfRenderMemberCard(m)` (existing, unchanged signature).
- Produces: `tfRenderMemberList()` — callable with no arguments, re-renders `#tf-member-cards` from current `TF.members` + `TF.dashSearch` + `TF.dashStatusFilter`. Used by the new search/filter handlers and by `tfRenderDashboard()`.

- [ ] **Step 1: Add toolbar CSS to `team-form.html`**

Find this exact line in `team-form.html` (around line 46):

```css
    .badge-wait{background:var(--b1l,#FDF6E3);color:var(--b1,#7A5A10)}
```

Insert immediately after it:

```css
    .badge-wait{background:var(--b1l,#FDF6E3);color:var(--b1,#7A5A10)}
    .tf-search-wrap{display:flex;align-items:center;gap:8px;background:var(--bg);border:1.5px solid var(--brd);border-radius:12px;padding:8px 12px;margin-bottom:10px}
    .tf-search-wrap svg{color:var(--txt3);flex-shrink:0}
    .tf-search-wrap input{border:none;background:transparent;padding:0;margin:0;flex:1;font-size:14px;color:var(--txt)}
    .tf-search-wrap input:focus{outline:none}
    .tf-search-clr{background:none;border:none;cursor:pointer;color:var(--txt3);font-size:14px;padding:0 4px;font-family:inherit}
    .tf-chips{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px}
    .tf-chip{padding:6px 12px;border-radius:20px;font-size:12px;font-weight:600;border:1.5px solid var(--brd);background:var(--bg2);color:var(--txt2);cursor:pointer;font-family:inherit;transition:all .15s}
    .tf-chip.on{background:var(--grad);color:#fff;border-color:transparent}
```

- [ ] **Step 2: Add the toolbar container to the dashboard markup**

Find this exact block in `team-form.html` (currently lines 131-133):

```html
      <div id="tf-dash-right">
        <div id="tf-member-cards"></div>
      </div>
```

Replace with:

```html
      <div id="tf-dash-right">
        <div id="tf-dash-toolbar"></div>
        <div id="tf-member-cards"></div>
      </div>
```

- [ ] **Step 3: Add i18n keys to `js/team-form-i18n.js`**

Find this exact line in the `fr` block (currently line 89):

```js
    tfCoAdminMsg: 't\'invite à co-gérer l\'équipe'
  },
```

Replace with:

```js
    tfCoAdminMsg: 't\'invite à co-gérer l\'équipe',
    tfSearchPlaceholder: 'Rechercher un membre…',
    tfFilterAll: 'Tous',
    tfNoSearchResults: 'Aucun résultat pour cette recherche.'
  },
```

Find this exact line in the `en` block (currently line 178):

```js
    tfCoAdminMsg: 'invites you to co-manage the team'
  }
};
```

Replace with:

```js
    tfCoAdminMsg: 'invites you to co-manage the team',
    tfSearchPlaceholder: 'Search a member…',
    tfFilterAll: 'All',
    tfNoSearchResults: 'No results for this search.'
  }
};
```

- [ ] **Step 4: Add search/filter state to the `TF` object**

Find this exact block in `js/team-form.js` (currently lines 9-30):

```js
var TF = {
  survey: null,
  members: [],
  mode: null,
  adminToken: null,
  memberToken: null,
  coadminToken: null,
  isCoadmin: false,
  pendingMembers: [],
  pendingTeamName: '',
  pendingManagerName: '',
  pendingInviteMsg: '',
  relationLabels: [],
  currentMember: null,
  selectedGender: '',
  pollInterval: null,
  submitting: false,
  importedTokens: new Set(),
  user: null,
  _coAdminShareToken: null,
  coAdminName: ''
};
```

Replace with:

```js
var TF = {
  survey: null,
  members: [],
  mode: null,
  adminToken: null,
  memberToken: null,
  coadminToken: null,
  isCoadmin: false,
  pendingMembers: [],
  pendingTeamName: '',
  pendingManagerName: '',
  pendingInviteMsg: '',
  relationLabels: [],
  currentMember: null,
  selectedGender: '',
  pollInterval: null,
  submitting: false,
  importedTokens: new Set(),
  user: null,
  _coAdminShareToken: null,
  coAdminName: '',
  dashSearch: '',
  dashStatusFilter: 'all',
  dashSearchDebounce: null
};
```

- [ ] **Step 5: Split rendering into a guarded toolbar + a re-runnable member list**

Find this exact block in `js/team-form.js` (currently lines 501-529):

```js
function tfRenderDashboard() {
  var done = TF.members.filter(function(m) { return m.completed; }).length;
  var total = TF.members.length;
  document.getElementById('tf-dash-title').textContent = '🌸 ' + TF.survey.team_name;
  document.getElementById('tf-progress-fill').style.width = (total ? Math.round(done / total * 100) : 0) + '%';
  document.getElementById('tf-progress-text').textContent = tfT('progress').replace('%done', done).replace('%total', total);
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
  document.getElementById('tf-member-cards').innerHTML = TF.members.map(function(m) {
    return tfRenderMemberCard(m);
  }).join('');
  tfInitSwipe();
}
```

Replace with:

```js
function tfRenderDashboard() {
  var done = TF.members.filter(function(m) { return m.completed; }).length;
  var total = TF.members.length;
  document.getElementById('tf-dash-title').textContent = '🌸 ' + TF.survey.team_name;
  document.getElementById('tf-progress-fill').style.width = (total ? Math.round(done / total * 100) : 0) + '%';
  document.getElementById('tf-progress-text').textContent = tfT('progress').replace('%done', done).replace('%total', total);
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
  tfRenderDashboardToolbar();
  tfRenderMemberList();
}

// Rendu unique de la barre de recherche + chips — ne se recrée pas à chaque
// poll (30s) ou re-render, sinon le focus/clavier mobile saute pendant la frappe.
function tfRenderDashboardToolbar() {
  var el = document.getElementById('tf-dash-toolbar');
  if (!el || document.getElementById('tf-dash-search-inp')) return;
  el.innerHTML =
    '<div class="tf-search-wrap">'
    + '<svg width="16" height="16" viewBox="0 0 20 20" fill="none"><circle cx="9" cy="9" r="6" stroke="currentColor" stroke-width="1.5"/><path d="M13.5 13.5L17 17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>'
    + '<input type="text" id="tf-dash-search-inp" placeholder="' + tfT('tfSearchPlaceholder') + '" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" inputmode="search" oninput="tfOnDashSearchInput(this.value)" onkeydown="if(event.key===\'Enter\'){this.blur();}">'
    + '<button id="tf-dash-search-clr" class="tf-search-clr" style="display:none" onclick="tfClearDashSearch()">✕</button>'
    + '</div>'
    + '<div class="tf-chips" id="tf-dash-status-chips">'
    + '<button class="tf-chip on" data-f="all" onclick="tfSetDashFilter(\'all\')">' + tfT('tfFilterAll') + '</button>'
    + '<button class="tf-chip" data-f="completed" onclick="tfSetDashFilter(\'completed\')">' + tfT('statusCompleted') + '</button>'
    + '<button class="tf-chip" data-f="pending" onclick="tfSetDashFilter(\'pending\')">' + tfT('statusPending') + '</button>'
    + '</div>';
}

function tfRenderMemberList() {
  var el = document.getElementById('tf-member-cards');
  if (!el) return;
  var list = TF.members.slice().sort(function(a, b) { return new Date(b.created_at) - new Date(a.created_at); });
  var q = (TF.dashSearch || '').trim().toLowerCase();
  if (q) {
    list = list.filter(function(m) {
      return (m.first_name + ' ' + m.last_name).toLowerCase().indexOf(q) !== -1;
    });
  }
  if (TF.dashStatusFilter === 'completed') list = list.filter(function(m) { return m.completed; });
  else if (TF.dashStatusFilter === 'pending') list = list.filter(function(m) { return !m.completed; });
  if (!list.length) {
    el.innerHTML = '<div style="text-align:center;color:var(--txt2);font-size:13px;padding:24px 0">' + tfT('tfNoSearchResults') + '</div>';
    return;
  }
  el.innerHTML = list.map(function(m) { return tfRenderMemberCard(m); }).join('');
  tfInitSwipe();
}

function tfOnDashSearchInput(val) {
  TF.dashSearch = val;
  var clrBtn = document.getElementById('tf-dash-search-clr');
  if (clrBtn) clrBtn.style.display = val ? 'flex' : 'none';
  clearTimeout(TF.dashSearchDebounce);
  TF.dashSearchDebounce = setTimeout(tfRenderMemberList, 200);
}

function tfClearDashSearch() {
  TF.dashSearch = '';
  var inp = document.getElementById('tf-dash-search-inp');
  if (inp) inp.value = '';
  var clrBtn = document.getElementById('tf-dash-search-clr');
  if (clrBtn) clrBtn.style.display = 'none';
  tfRenderMemberList();
}

function tfSetDashFilter(f) {
  TF.dashStatusFilter = f;
  var chips = document.querySelectorAll('#tf-dash-status-chips .tf-chip');
  for (var i = 0; i < chips.length; i++) {
    chips[i].classList.toggle('on', chips[i].dataset.f === f);
  }
  tfRenderMemberList();
}
```

- [ ] **Step 6: Verify syntax**

Run: `node --check js/team-form.js && node --check js/team-form-i18n.js`
Expected: no output, exit code 0.

- [ ] **Step 7: Manual verification**

1. Open `team-form.html?admin=<admin token>` with at least 3 members, some completed and some pending.
2. Confirm a search box and three chips (Tous/Complétés/En attente) appear above the member cards, and "Tous" is highlighted by default.
3. Type part of a member's first name — confirm the list narrows to matching members only, other cards disappear without the search box losing focus.
4. Clear the search via the ✕ button — confirm the full list returns.
5. Click "Complétés" — confirm only completed members show and the chip highlights; click "En attente" — confirm only pending members show; click "Tous" — confirm the full list returns.
6. Add a new member via the dashboard's "+ Ajouter un membre" form — confirm the new member's card appears at the very top of the list, not the bottom.
7. Type a search query with zero matches — confirm the "Aucun résultat pour cette recherche." message shows instead of an empty list.

- [ ] **Step 8: Commit**

```bash
git add team-form.html js/team-form.js js/team-form-i18n.js
git commit -m "feat(team-form): recherche, filtre statut et nouveaux membres en haut de liste"
```

---

### Task 4: Alphabetical A→Z/Z→A sort for the Members list

**Files:**
- Modify: `js/i18n.js` (add `sortAsc`, `sortDesc` keys in all 7 language blocks)
- Modify: `js/i18n.js:5699-5700` (add `sortDir` global state)
- Modify: `js/core.js:269` (`switchG` resets `sortDir`)
- Modify: `js/render.js:323-380` (`rMembers`) and `js/render.js:1653-1668` (search handlers area — add sort toggle button + handler)

**Interfaces:**
- Consumes: `wname(p)` (existing, `js/render.js:27`) for the display name each card shows — sorting must match what's visually shown, including the "First & Spouse" wedding format.
- Produces: `sortDir` (module-level string, `'asc'` or `'desc'`), `toggleSortDir()` (new function, no args, flips `sortDir` and re-renders).

- [ ] **Step 1: Add `sortDir` global state**

Find this exact line in `js/i18n.js` (currently line 5699-5700):

```js
let editId=null,editAdm=null,fMonth=0,fType='';
let searchInput='',searchFiltered=null; // Axe 2 : état séparé
```

Replace with:

```js
let editId=null,editAdm=null,fMonth=0,fType='';
let searchInput='',searchFiltered=null; // Axe 2 : état séparé
let sortDir='asc';
```

- [ ] **Step 2: Reset `sortDir` when switching groups**

Find this exact line in `js/core.js` (currently line 269):

```js
function switchG(id){curG=id;fMonth=0;fType='';searchInput='';searchFiltered=null;editId=null;refresh();}
```

Replace with:

```js
function switchG(id){curG=id;fMonth=0;fType='';searchInput='';searchFiltered=null;sortDir='asc';editId=null;refresh();}
```

- [ ] **Step 3: Add `sortAsc`/`sortDesc` i18n keys to all 7 languages**

Find this exact line in the `fr` block (currently `js/i18n.js:574`):

```js
    searchMember:'Rechercher un membre…',
```

Replace with:

```js
    searchMember:'Rechercher un membre…',
    sortAsc:'Ordre alphabétique A→Z',
    sortDesc:'Ordre alphabétique Z→A',
```

Find this exact line in the `en` block (currently `js/i18n.js:1473`):

```js
    searchMember:'Search a member…',
```

Replace with:

```js
    searchMember:'Search a member…',
    sortAsc:'Alphabetical order A→Z',
    sortDesc:'Alphabetical order Z→A',
```

Find this exact line in the `es` block (currently `js/i18n.js:2240`):

```js
    searchMember:'Buscar miembro…',
```

Replace with:

```js
    searchMember:'Buscar miembro…',
    sortAsc:'Orden alfabético A→Z',
    sortDesc:'Orden alfabético Z→A',
```

Find this exact line in the `ar` block (currently `js/i18n.js:3007`):

```js
    searchMember:'البحث عن عضو…',
```

Replace with:

```js
    searchMember:'البحث عن عضو…',
    sortAsc:'ترتيب أبجدي تصاعدي (A→Z)',
    sortDesc:'ترتيب أبجدي تنازلي (Z→A)',
```

Find this exact line in the `hi` block (currently `js/i18n.js:3774`):

```js
    searchMember:'सदस्य खोजें…',
```

Replace with:

```js
    searchMember:'सदस्य खोजें…',
    sortAsc:'वर्णानुक्रम A→Z',
    sortDesc:'वर्णानुक्रम Z→A',
```

Find this exact line in the `zh` block (currently `js/i18n.js:4541`):

```js
    searchMember:'搜索成员…',
```

Replace with:

```js
    searchMember:'搜索成员…',
    sortAsc:'字母顺序 A→Z',
    sortDesc:'字母顺序 Z→A',
```

Find this exact line in the `pt` block (currently `js/i18n.js:5308`):

```js
    searchMember:'Buscar membro…',
```

Replace with:

```js
    searchMember:'Buscar membro…',
    sortAsc:'Ordem alfabética A→Z',
    sortDesc:'Ordem alfabética Z→A',
```

- [ ] **Step 4: Verify syntax**

Run: `node --check js/i18n.js && node --check js/core.js`
Expected: no output, exit code 0.

- [ ] **Step 5: Add the sort toggle button next to the search bar and apply the sort**

Find this exact block in `js/render.js` (currently lines 356-363):

```js
  h+=`<div class="sw">
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><circle cx="9" cy="9" r="6" stroke="currentColor" stroke-width="1.5"/><path d="M13.5 13.5L17 17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
    <input type="text" id="search-inp" placeholder="${t('searchMember')}" value="${esc(searchInput)}"
      autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"
      inputmode="search"
      oninput="onSearchInput(this.value)" onkeydown="if(event.key==='Enter'){this.blur();}">
    <button id="srch-clr" class="clear-btn" style="display:${searchInput?'flex':'none'}" onclick="clearSearch()">✕</button>
  </div>`;
```

Replace with:

```js
  h+=`<div style="display:flex;gap:8px;align-items:center">
  <div class="sw" style="flex:1">
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><circle cx="9" cy="9" r="6" stroke="currentColor" stroke-width="1.5"/><path d="M13.5 13.5L17 17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
    <input type="text" id="search-inp" placeholder="${t('searchMember')}" value="${esc(searchInput)}"
      autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"
      inputmode="search"
      oninput="onSearchInput(this.value)" onkeydown="if(event.key==='Enter'){this.blur();}">
    <button id="srch-clr" class="clear-btn" style="display:${searchInput?'flex':'none'}" onclick="clearSearch()">✕</button>
  </div>
  <button onclick="toggleSortDir()" title="${sortDir==='asc'?t('sortAsc'):t('sortDesc')}" style="flex-shrink:0;width:40px;height:40px;border-radius:12px;border:1.5px solid var(--brd);background:var(--bg2);color:var(--txt2);font-size:16px;cursor:pointer">⇅</button>
  </div>`;
```

- [ ] **Step 6: Sort `filtered` alphabetically before rendering**

Find this exact block in `js/render.js` (currently lines 378-380):

```js
  if(!filtered.length){h+=`<div class="es">${m.length===0?t('noMembersYet'):t('noSearchResults')}</div>`;el.innerHTML=h;return;}
  h+=`<div style="font-size:12px;color:var(--txt2);margin-bottom:10px;font-weight:600">${filtered.length} ${filtered.length!==1?t('membersCount'):t('memberCount')} · Plan ${PLANS[plan].name}</div>`;
  filtered.forEach(p=>{
```

Replace with:

```js
  if(!filtered.length){h+=`<div class="es">${m.length===0?t('noMembersYet'):t('noSearchResults')}</div>`;el.innerHTML=h;return;}
  filtered=filtered.slice().sort((a,b)=>{const r=wname(a).localeCompare(wname(b),undefined,{sensitivity:'base'});return sortDir==='asc'?r:-r;});
  h+=`<div style="font-size:12px;color:var(--txt2);margin-bottom:10px;font-weight:600">${filtered.length} ${filtered.length!==1?t('membersCount'):t('memberCount')} · Plan ${PLANS[plan].name}</div>`;
  filtered.forEach(p=>{
```

- [ ] **Step 7: Add the `toggleSortDir` handler next to the other search handlers**

Find this exact block in `js/render.js` (currently lines 1664-1668):

```js
function clearSearch(){
  searchInput='';searchFiltered=null;
  var inp=document.getElementById('search-inp');if(inp)inp.value='';
  rMembers();
}
```

Replace with:

```js
function clearSearch(){
  searchInput='';searchFiltered=null;
  var inp=document.getElementById('search-inp');if(inp)inp.value='';
  rMembers();
}

function toggleSortDir(){
  sortDir=sortDir==='asc'?'desc':'asc';
  rMembers();
}
```

- [ ] **Step 8: Verify syntax**

Run: `node --check js/render.js`
Expected: no output, exit code 0.

- [ ] **Step 9: Manual verification**

1. Open `index.html`, sign in, go to a group with several members whose names aren't already alphabetical.
2. Confirm the Members list is sorted A→Z by default (case/accent-insensitive — e.g. "École" and "elodie" sort together correctly).
3. Confirm a `⇅` button sits next to the search bar.
4. Click it — confirm the list flips to Z→A order, and the button's tooltip (hover, or long-press on mobile) reflects the new state.
5. Click it again — confirm it flips back to A→Z.
6. Type a search query — confirm the filtered results are still sorted per the current direction.
7. Switch to a different group (or back), and confirm the sort resets to A→Z default (per the "always resets" requirement) rather than carrying over the Z→A choice.
8. Confirm a group containing a wedding entry (e.g. "Alice & Bob") sorts on the displayed "Alice & Bob" string, not on the raw stored name.

- [ ] **Step 10: Commit**

```bash
git add js/i18n.js js/core.js js/render.js
git commit -m "feat(membres): tri alphabétique A→Z/Z→A avec bouton bascule"
```

---

## Post-plan

None of these tasks touch `/ship-bloomday`'s deploy step — after all 4 tasks are committed, the user should still be asked before pushing to `main` (Netlify auto-deploys on push). Task 1's Supabase migration must be applied to production *before* Tasks 2-4 are deployed, since Task 2's code writes to `imported_at` immediately.
