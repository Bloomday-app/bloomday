# Member Name Correction + Phone Number Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow a team-form member to correct their first/last name and add their phone number (with country code selector) when submitting their profile form.

**Architecture:** Add two columns (`phone_code`, `phone_number`) to `survey_members`, extend the `tf_submit_member_form` RPC to also update names and phone, add a "Vos informations" section at the top of the member form in `tfRenderMemberForm`, and propagate phone to Bloomday contact import.

**Tech Stack:** PostgreSQL/Supabase RPC (SECURITY DEFINER), Vanilla JS ES6+, no bundler.

---

## File Map

| File | Change |
|---|---|
| `supabase/migrations/20260608180000_tf_add_phone.sql` | **Create** — new columns + updated RPC |
| `js/team-form-i18n.js` | **Modify** — add 3 new i18n keys (fr + en) |
| `js/team-form.js` line 25 | **Modify** — add `TF_PHONE_CODES` constant |
| `js/team-form.js` lines 623-659 | **Modify** — `tfRenderMemberForm()` new section |
| `js/team-form.js` lines 671-715 | **Modify** — `tfSubmitMember()` reads new fields |
| `js/team-form.js` lines 548-554 | **Modify** — `tfImportMember()` phone concat |
| `js/team-form.js` lines 585-591 | **Modify** — `tfSyncBloomday()` phone concat |

---

## Task 1 — Migration SQL : colonnes phone + RPC étendue

**Files:**
- Create: `supabase/migrations/20260608180000_tf_add_phone.sql`

- [ ] **Step 1 : Créer le fichier de migration**

```sql
-- Ajout des colonnes téléphone dans survey_members
ALTER TABLE survey_members ADD COLUMN IF NOT EXISTS phone_code   text;
ALTER TABLE survey_members ADD COLUMN IF NOT EXISTS phone_number text;

-- Suppression de l'ancienne signature (paramètres différents = nouvel overload sinon)
DROP FUNCTION IF EXISTS tf_submit_member_form(text, int, int, int, text, boolean, text, int, int, int);

-- Nouvelle version : accepte first_name, last_name, phone_code, phone_number en plus
CREATE OR REPLACE FUNCTION tf_submit_member_form(
  p_member_token  text,
  p_first_name    text,
  p_last_name     text,
  p_birth_day     int,
  p_birth_month   int,
  p_birth_year    int,
  p_gender        text,
  p_married       boolean,
  p_spouse_name   text,
  p_wedding_day   int,
  p_wedding_month int,
  p_wedding_year  int,
  p_phone_code    text DEFAULT NULL,
  p_phone_number  text DEFAULT NULL
)
RETURNS boolean
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE rows_updated int;
BEGIN
  UPDATE survey_members SET
    first_name    = COALESCE(NULLIF(TRIM(p_first_name), ''), first_name),
    last_name     = COALESCE(NULLIF(TRIM(p_last_name),  ''), last_name),
    phone_code    = p_phone_code,
    phone_number  = p_phone_number,
    birth_day     = p_birth_day,
    birth_month   = p_birth_month,
    birth_year    = p_birth_year,
    gender        = p_gender,
    married       = p_married,
    spouse_name   = p_spouse_name,
    wedding_day   = p_wedding_day,
    wedding_month = p_wedding_month,
    wedding_year  = p_wedding_year,
    completed     = true,
    completed_at  = now()
  WHERE token = p_member_token
    AND completed = false;

  GET DIAGNOSTICS rows_updated = ROW_COUNT;
  RETURN rows_updated > 0;
END;
$$;

GRANT EXECUTE ON FUNCTION tf_submit_member_form(text, text, text, int, int, int, text, boolean, text, int, int, int, text, text) TO anon;
```

- [ ] **Step 2 : Vérifier la syntaxe du fichier**

```bash
node --check js/team-form.js
```
Expected: aucune erreur (le fichier JS n'a pas encore changé, vérification de base).

- [ ] **Step 3 : Appliquer la migration via Supabase Dashboard**

Aller dans **Supabase Dashboard → SQL Editor**, coller et exécuter le contenu du fichier.

Vérifier ensuite dans **Table Editor → survey_members** que les colonnes `phone_code` et `phone_number` apparaissent.

- [ ] **Step 4 : Commit**

```bash
git add supabase/migrations/20260608180000_tf_add_phone.sql
git commit -m "feat(db): add phone_code/phone_number columns and extend tf_submit_member_form RPC"
```

---

## Task 2 — i18n : nouvelles clés fr + en

**Files:**
- Modify: `js/team-form-i18n.js`

- [ ] **Step 1 : Ajouter les clés dans le bloc `fr` (après `alreadyCompleted`)**

Dans `TF_I18N.fr`, après la ligne `alreadyCompleted: '...',`, ajouter :

```js
    yourInfo: 'Vos informations',
    phoneOptional: 'Téléphone (optionnel)',
    phonePlaceholder: 'Ex : 6 12 34 56 78',
```

- [ ] **Step 2 : Ajouter les clés dans le bloc `en` (après `alreadyCompleted`)**

Dans `TF_I18N.en`, après la ligne `alreadyCompleted: '...',`, ajouter :

```js
    yourInfo: 'Your information',
    phoneOptional: 'Phone (optional)',
    phonePlaceholder: 'E.g. 6 12 34 56 78',
```

- [ ] **Step 3 : Vérifier la syntaxe**

```bash
node --check js/team-form-i18n.js
```
Expected: aucune sortie (pas d'erreur).

- [ ] **Step 4 : Commit**

```bash
git add js/team-form-i18n.js
git commit -m "feat(i18n): add yourInfo, phoneOptional, phonePlaceholder keys for member form"
```

---

## Task 3 — Constante `TF_PHONE_CODES` dans team-form.js

**Files:**
- Modify: `js/team-form.js` — ajouter après la ligne 25 (`var TF_DELETE = ...`)

- [ ] **Step 1 : Insérer la constante après `var TF_DELETE`**

Après la ligne :
```js
var TF_DELETE = { token: null, teamName: null, groupId: null, bloomdayMembers: [] };
```

Ajouter :
```js
var TF_PHONE_CODES = [
  { code: '+33',  flag: '🇫🇷', name: 'France' },
  { code: '+32',  flag: '🇧🇪', name: 'Belgique / Belgium' },
  { code: '+41',  flag: '🇨🇭', name: 'Suisse / Schweiz' },
  { code: '+1',   flag: '🇨🇦', name: 'Canada' },
  { code: '+44',  flag: '🇬🇧', name: 'Royaume-Uni / UK' },
  { code: '+49',  flag: '🇩🇪', name: 'Allemagne / Deutschland' },
  { code: '+34',  flag: '🇪🇸', name: 'Espagne / España' },
  { code: '+39',  flag: '🇮🇹', name: 'Italie / Italia' },
  { code: '+351', flag: '🇵🇹', name: 'Portugal' },
  { code: '+31',  flag: '🇳🇱', name: 'Pays-Bas / Nederland' },
  { code: '+212', flag: '🇲🇦', name: 'Maroc' },
  { code: '+213', flag: '🇩🇿', name: 'Algérie' },
  { code: '+216', flag: '🇹🇳', name: 'Tunisie' },
  { code: '+221', flag: '🇸🇳', name: 'Sénégal' },
  { code: '+225', flag: '🇨🇮', name: "Côte d'Ivoire" },
  { code: '+237', flag: '🇨🇲', name: 'Cameroun' },
  { code: '+243', flag: '🇨🇩', name: 'Congo (RDC)' },
  { code: '+242', flag: '🇨🇬', name: 'Congo (Brazzaville)' },
  { code: '+241', flag: '🇬🇦', name: 'Gabon' },
  { code: '+226', flag: '🇧🇫', name: 'Burkina Faso' },
  { code: '+223', flag: '🇲🇱', name: 'Mali' },
  { code: '+229', flag: '🇧🇯', name: 'Bénin' },
  { code: '+228', flag: '🇹🇬', name: 'Togo' },
  { code: '+227', flag: '🇳🇪', name: 'Niger' },
  { code: '+261', flag: '🇲🇬', name: 'Madagascar' },
  { code: '+262', flag: '🇷🇪', name: 'Réunion' },
  { code: '+596', flag: '🇲🇶', name: 'Martinique' },
  { code: '+590', flag: '🇬🇵', name: 'Guadeloupe' },
  { code: '+689', flag: '🇵🇫', name: 'Polynésie française' },
  { code: '+55',  flag: '🇧🇷', name: 'Brésil / Brasil' },
  { code: '+1',   flag: '🇺🇸', name: 'États-Unis / USA' },
  { code: '+52',  flag: '🇲🇽', name: 'Mexique / México' },
  { code: '+91',  flag: '🇮🇳', name: 'Inde / India' },
  { code: '+86',  flag: '🇨🇳', name: 'Chine / China' },
  { code: '+81',  flag: '🇯🇵', name: 'Japon / Japan' },
  { code: '+7',   flag: '🇷🇺', name: 'Russie / Россия' }
];
```

- [ ] **Step 2 : Vérifier la syntaxe**

```bash
node --check js/team-form.js
```
Expected: aucune sortie.

- [ ] **Step 3 : Commit**

```bash
git add js/team-form.js
git commit -m "feat(team-form): add TF_PHONE_CODES country list constant"
```

---

## Task 4 — `tfRenderMemberForm` : section "Vos informations"

**Files:**
- Modify: `js/team-form.js` — remplacer la fonction `tfRenderMemberForm` (lignes 623-659)

- [ ] **Step 1 : Remplacer le corps de `tfRenderMemberForm`**

Remplacer **tout** le contenu de `document.getElementById('tf-member-form').innerHTML = ...` (de la ligne qui commence par `'<p style="font-size:15px...'` jusqu'au `+ '<button id="tf-submit-btn"...'`) par :

```js
  document.getElementById('tf-member-form').innerHTML =
    '<h2 style="font-size:14px;font-weight:700;color:var(--txt2);text-transform:uppercase;letter-spacing:.5px;margin-bottom:12px">' + tfT('yourInfo') + '</h2>'
    + '<label>' + tfT('firstName') + '</label>'
    + '<input id="tf-inp-edit-first" type="text" value="' + tfEsc(m.first_name) + '" autocomplete="given-name">'
    + '<label>' + tfT('lastName') + '</label>'
    + '<input id="tf-inp-edit-last" type="text" value="' + tfEsc(m.last_name) + '" autocomplete="family-name">'
    + '<label>' + tfT('phoneOptional') + '</label>'
    + '<div style="display:flex;gap:8px;margin-bottom:12px">'
    + '<select id="tf-phone-code" style="width:150px;flex-shrink:0;margin-bottom:0">'
    + TF_PHONE_CODES.map(function(c) {
        return '<option value="' + c.code + '"'
          + (c.code === '+33' && c.name === 'France' ? ' selected' : '')
          + '>' + c.flag + ' ' + c.code + ' — ' + c.name + '</option>';
      }).join('')
    + '</select>'
    + '<input id="tf-phone-number" type="tel" style="flex:1;margin-bottom:0" placeholder="' + tfT('phonePlaceholder') + '">'
    + '</div>'
    + '<hr style="border:none;border-top:1px solid var(--brd);margin:4px 0 16px">'
    + '<label>' + tfT('birthDate') + '</label>'
    + '<div style="display:grid;grid-template-columns:1fr 2fr 1fr;gap:8px;margin-bottom:12px">'
    + '<input id="tf-birth-day" type="number" min="1" max="31" placeholder="' + tfT('day') + '">'
    + '<select id="tf-birth-month"><option value="">— ' + tfT('month') + ' —</option>' + monthOpts + '</select>'
    + '<input id="tf-birth-year" type="number" min="1920" max="2015" placeholder="' + tfT('year') + '">'
    + '</div>'
    + '<label>' + tfT('gender') + '</label>'
    + '<div class="tf-gender-row">'
    + '<button class="tf-gender-btn" id="tf-gender-m" onclick="tfSelectGender(\'M\')">' + tfT('male') + '</button>'
    + '<button class="tf-gender-btn" id="tf-gender-f" onclick="tfSelectGender(\'F\')">' + tfT('female') + '</button>'
    + '</div>'
    + '<div class="tf-toggle">'
    + '<input type="checkbox" id="tf-married" onchange="tfToggleMarried(this.checked)">'
    + '<label for="tf-married" style="margin:0;font-size:14px;font-weight:600;color:var(--txt)">' + tfT('married') + '</label>'
    + '</div>'
    + '<div id="tf-married-fields" style="display:none">'
    + '<label>' + tfT('spouseName') + '</label>'
    + '<input id="tf-spouse-name" type="text" placeholder="Prénom Nom">'
    + '<label>' + tfT('weddingDate') + '</label>'
    + '<div style="display:grid;grid-template-columns:1fr 2fr 1fr;gap:8px;margin-bottom:12px">'
    + '<input id="tf-wed-day" type="number" min="1" max="31" placeholder="' + tfT('day') + '">'
    + '<select id="tf-wed-month"><option value="">— ' + tfT('month') + ' —</option>' + monthOpts + '</select>'
    + '<input id="tf-wed-year" type="number" min="1950" max="2030" placeholder="' + tfT('year') + '">'
    + '</div>'
    + '</div>'
    + '<button id="tf-submit-btn" class="btn btn-primary" onclick="tfSubmitMember()">' + tfT('submit') + '</button>';
```

- [ ] **Step 2 : Vérifier la syntaxe**

```bash
node --check js/team-form.js
```
Expected: aucune sortie.

- [ ] **Step 3 : Commit**

```bash
git add js/team-form.js
git commit -m "feat(team-form): add 'Vos informations' section with editable name and phone selector in member form"
```

---

## Task 5 — `tfSubmitMember` : lire et soumettre les nouveaux champs

**Files:**
- Modify: `js/team-form.js` — remplacer la fonction `tfSubmitMember` (lignes 671-715)

- [ ] **Step 1 : Remplacer la fonction `tfSubmitMember`**

Remplacer l'intégralité de la fonction `tfSubmitMember` par :

```js
async function tfSubmitMember() {
  if (TF.submitting) return;
  var firstName = (document.getElementById('tf-inp-edit-first').value || '').trim();
  var lastName  = (document.getElementById('tf-inp-edit-last').value  || '').trim();
  if (!firstName || !lastName) { alert(tfT('errorRequired')); return; }
  var phoneCode   = document.getElementById('tf-phone-code').value;
  var phoneNumber = (document.getElementById('tf-phone-number').value || '').trim();
  var birthDay   = parseInt(document.getElementById('tf-birth-day').value)   || null;
  var birthMonth = parseInt(document.getElementById('tf-birth-month').value) || null;
  var birthYear  = parseInt(document.getElementById('tf-birth-year').value)  || null;
  if (!birthDay || !birthMonth) { alert(tfT('errorRequired')); return; }
  var married    = document.getElementById('tf-married').checked;
  var spouseName = married ? (document.getElementById('tf-spouse-name').value || '').trim() : null;
  var wedDay     = married ? (parseInt(document.getElementById('tf-wed-day').value)   || null) : null;
  var wedMonth   = married ? (parseInt(document.getElementById('tf-wed-month').value) || null) : null;
  var wedYear    = married ? (parseInt(document.getElementById('tf-wed-year').value)  || null) : null;
  if (married && (!spouseName || !wedDay || !wedMonth)) { alert(tfT('errorRequired')); return; }

  TF.submitting = true;
  var btn = document.getElementById('tf-submit-btn');
  if (btn) { btn.disabled = true; btn.textContent = '...'; }

  var res = await supabase.rpc('tf_submit_member_form', {
    p_member_token:  TF.memberToken,
    p_first_name:    firstName,
    p_last_name:     lastName,
    p_birth_day:     birthDay,   p_birth_month: birthMonth, p_birth_year: birthYear,
    p_gender:        TF.selectedGender || null,
    p_married:       married,    p_spouse_name: spouseName,
    p_wedding_day:   wedDay,     p_wedding_month: wedMonth, p_wedding_year: wedYear,
    p_phone_code:    phoneNumber ? phoneCode : null,
    p_phone_number:  phoneNumber || null
  });

  TF.submitting = false;
  if (btn) { btn.disabled = false; btn.textContent = tfT('submit'); }

  if (res.error || !res.data) {
    var isNetwork = res.error && (
      res.error.message.includes('Load failed') ||
      res.error.message.includes('Failed to fetch') ||
      res.error.message.includes('NetworkError') ||
      res.error.message.toLowerCase().includes('network')
    );
    alert(isNetwork ? tfT('errorNetwork') : (res.error ? 'Erreur : ' + res.error.message : tfT('errorRequired')));
    return;
  }
  TF.currentMember.first_name = firstName;
  TF.currentMember.last_name  = lastName;
  tfShow('tf-view-thanks');
  document.getElementById('tf-thanks-title').textContent = tfT('thankYou')
    .replace('[Prénom]', TF.currentMember.first_name)
    .replace('[First name]', TF.currentMember.first_name);
  document.getElementById('tf-thanks-sub').textContent = tfT('thankYouSub');
  setTimeout(function() { window.location.href = 'https://mybloomday.app'; }, 3000);
}
```

- [ ] **Step 2 : Vérifier la syntaxe**

```bash
node --check js/team-form.js
```
Expected: aucune sortie.

- [ ] **Step 3 : Commit**

```bash
git add js/team-form.js
git commit -m "feat(team-form): extend tfSubmitMember to send first_name, last_name, phone to RPC"
```

---

## Task 6 — Import Bloomday : propager le téléphone

**Files:**
- Modify: `js/team-form.js` — lignes 551, 554, 588, 591 (champ `phone: ''`)

Il y a **4 occurrences** de `phone: ''` dans les fonctions `tfImportMember` et `tfSyncBloomday`. Toutes doivent être remplacées par la concaténation phone_code + phone_number.

- [ ] **Step 1 : Modifier les 4 lignes ciblées dans `tfImportMember` et `tfSyncBloomday`**

⚠️ Il y a 5 occurrences de `phone: ''` dans le fichier. La ligne ~518 (variable `r`, pas `m`) ne doit **pas** être touchée. Modifier uniquement les 4 lignes suivantes.

Dans `tfImportMember` (lignes ~551 et ~554), remplacer chaque `phone: ''` par :
```js
phone: ((m.phone_code || '') + (m.phone_number || '')).trim(),
```

Dans `tfSyncBloomday` (lignes ~588 et ~591), remplacer de même chaque `phone: ''` par :
```js
phone: ((m.phone_code || '') + (m.phone_number || '')).trim(),
```

Le moyen le plus sûr est d'éditer les 4 lignes une par une via l'outil Edit (chercher le contexte exact de chaque ligne plutôt qu'un replace-all).

- [ ] **Step 2 : Vérifier la syntaxe**

```bash
node --check js/team-form.js
```
Expected: aucune sortie.

- [ ] **Step 3 : Commit**

```bash
git add js/team-form.js
git commit -m "feat(team-form): propagate phone_code+phone_number to Bloomday contact import"
```

---

## Task 7 — Test manuel + déploiement

- [ ] **Step 1 : Tester le formulaire membre en local**

Ouvrir `team-form.html?member=<token_valide>` dans le navigateur.

Vérifications :
- [ ] La section "Vos informations" apparaît en premier
- [ ] Les champs Prénom et Nom sont pré-remplis avec les valeurs du manager
- [ ] Le sélecteur pays affiche 🇫🇷 +33 — France par défaut
- [ ] Changer de pays met à jour le code immédiatement dans la liste
- [ ] Le champ téléphone est vide et optionnel (soumission sans tel fonctionne)
- [ ] Vider le prénom et soumettre → alert "champs obligatoires"
- [ ] Remplir et soumettre → écran de remerciement avec le nouveau prénom
- [ ] Vérifier dans Supabase Dashboard que `phone_code`, `phone_number`, `first_name`, `last_name` sont bien enregistrés

- [ ] **Step 2 : Déployer**

```bash
git push origin main
```

Vérifier sur Netlify que le déploiement se termine sans erreur.
