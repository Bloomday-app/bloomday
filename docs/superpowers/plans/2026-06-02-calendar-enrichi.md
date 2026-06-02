# Calendrier latéral enrichi — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enrichir le panneau droit desktop de Bloomday avec une navigation année/mois, des marqueurs de fêtes sur la grille, et un panneau mensuel mixte (anniversaires + fêtes triés par date).

**Architecture:** Toutes les modifications sont dans `renderSideCalendar()` dans `js/render.js`. Une fonction locale `getFetesForMonth(year, month)` est ajoutée dans la même fonction pour filtrer les fêtes par mois/profil. Quatre clés i18n sont ajoutées dans `js/i18n.js`.

**Tech Stack:** Vanilla JS ES6+, pas de bundler. Syntaxe vérifiée avec `node --check`. Tests manuels dans le navigateur (pas de framework de test).

---

## Fichiers modifiés

- `js/i18n.js` — 4 nouvelles clés × 7 langues (fr, en, es, ar, hi, zh, pt)
- `js/render.js` — fonction `renderSideCalendar()` lignes 703–808 : header, grille, panneau

---

## Task 1 : i18n — 4 nouvelles clés

**Files:**
- Modify: `js/i18n.js:378` (fr), `js/i18n.js:1098` (en), `js/i18n.js:1808` (es), `js/i18n.js:2518` (ar), `js/i18n.js:3228` (hi), `js/i18n.js:3938` (zh), `js/i18n.js:4648` (pt)

- [ ] **Ajouter les 4 clés après `upcomingBdays` dans chaque langue**

Dans `js/i18n.js`, chercher chaque occurrence de `upcomingBdays` et ajouter les 4 lignes juste après :

**Français (ligne ~378) :**
```js
upcomingBdays:'Prochains anniversaires',
thisMonth:'Ce mois',
noEventsThisMonth:'Aucun événement ce mois',
tagHoliday:'fête',
tagBirthday:'anniv',
```

**Anglais (ligne ~1098) :**
```js
upcomingBdays:'Upcoming birthdays',
thisMonth:'This month',
noEventsThisMonth:'No events this month',
tagHoliday:'holiday',
tagBirthday:'bday',
```

**Espagnol (ligne ~1808) :**
```js
upcomingBdays:'Próximos cumpleaños',
thisMonth:'Este mes',
noEventsThisMonth:'Sin eventos este mes',
tagHoliday:'festivo',
tagBirthday:'cumple',
```

**Arabe (ligne ~2518) :**
```js
upcomingBdays:'أعياد الميلاد القادمة',
thisMonth:'هذا الشهر',
noEventsThisMonth:'لا أحداث هذا الشهر',
tagHoliday:'عطلة',
tagBirthday:'عيد ميلاد',
```

**Hindi (ligne ~3228) :**
```js
upcomingBdays:'आगामी जन्मदिन',
thisMonth:'इस महीने',
noEventsThisMonth:'इस महीने कोई कार्यक्रम नहीं',
tagHoliday:'त्योहार',
tagBirthday:'जन्मदिन',
```

**Chinois (ligne ~3938) :**
```js
upcomingBdays:'即将到来的生日',
thisMonth:'本月',
noEventsThisMonth:'本月无活动',
tagHoliday:'节日',
tagBirthday:'生日',
```

**Portugais (ligne ~4648) :**
```js
upcomingBdays:'Próximos aniversários',
thisMonth:'Este mês',
noEventsThisMonth:'Sem eventos este mês',
tagHoliday:'feriado',
tagBirthday:'aniversário',
```

- [ ] **Vérifier la syntaxe**
```bash
node --check js/i18n.js
```
Résultat attendu : aucune sortie (= pas d'erreur).

- [ ] **Commit**
```bash
git add js/i18n.js
git commit -m "feat(i18n): thisMonth, noEventsThisMonth, tagHoliday, tagBirthday — 7 langues"
```

---

## Task 2 : Navigation calendrier — deux rangées (année + mois)

**Files:**
- Modify: `js/render.js:716-744` (bloc header dans `renderSideCalendar`)

- [ ] **Remplacer le bloc header existant (lignes 716–744) par deux rangées**

Localiser ce bloc dans `renderSideCalendar()` :
```js
  // Header de navigation
  var header = document.createElement('div');
  header.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin-bottom:12px';

  var prevBtn = document.createElement('button');
  prevBtn.textContent = '‹';
  ...
  header.appendChild(prevBtn);
  header.appendChild(titleEl);
  header.appendChild(nextBtn);
  parts.push(header);
```

Le remplacer entièrement par :
```js
  // Rangée année (±1 an)
  var yearRow = document.createElement('div');
  yearRow.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin-bottom:4px';
  var prevYearBtn = document.createElement('button');
  prevYearBtn.textContent = '‹‹';
  prevYearBtn.style.cssText = 'background:var(--bg2);border:1px solid var(--brd);border-radius:6px;color:var(--txt);font-size:12px;padding:1px 7px;cursor:pointer;line-height:1';
  prevYearBtn.onclick = function() { sideCal.year--; renderSideCalendar(); };
  var yearEl = document.createElement('div');
  yearEl.style.cssText = 'font-size:10px;font-weight:700;color:var(--b1d);letter-spacing:1px';
  yearEl.textContent = String(year);
  var nextYearBtn = document.createElement('button');
  nextYearBtn.textContent = '››';
  nextYearBtn.style.cssText = 'background:var(--bg2);border:1px solid var(--brd);border-radius:6px;color:var(--txt);font-size:12px;padding:1px 7px;cursor:pointer;line-height:1';
  nextYearBtn.onclick = function() { sideCal.year++; renderSideCalendar(); };
  yearRow.appendChild(prevYearBtn);
  yearRow.appendChild(yearEl);
  yearRow.appendChild(nextYearBtn);

  // Rangée mois (±1 mois)
  var monthRow = document.createElement('div');
  monthRow.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin-bottom:12px';
  var prevBtn = document.createElement('button');
  prevBtn.textContent = '‹';
  prevBtn.style.cssText = 'background:var(--bg2);border:1px solid var(--brd);border-radius:6px;color:var(--txt);font-size:16px;padding:1px 8px;cursor:pointer;line-height:1';
  prevBtn.onclick = function() {
    sideCal.month--;
    if (sideCal.month < 0) { sideCal.month = 11; sideCal.year--; }
    renderSideCalendar();
  };
  var titleEl = document.createElement('div');
  titleEl.style.cssText = 'font-size:13px;font-weight:700;color:var(--txt)';
  titleEl.textContent = MN[month];
  var nextBtn = document.createElement('button');
  nextBtn.textContent = '›';
  nextBtn.style.cssText = 'background:var(--bg2);border:1px solid var(--brd);border-radius:6px;color:var(--txt);font-size:16px;padding:1px 8px;cursor:pointer;line-height:1';
  nextBtn.onclick = function() {
    sideCal.month++;
    if (sideCal.month > 11) { sideCal.month = 0; sideCal.year++; }
    renderSideCalendar();
  };
  monthRow.appendChild(prevBtn);
  monthRow.appendChild(titleEl);
  monthRow.appendChild(nextBtn);

  parts.push(yearRow);
  parts.push(monthRow);
```

- [ ] **Vérifier la syntaxe**
```bash
node --check js/render.js
```
Résultat attendu : aucune sortie.

- [ ] **Test manuel** — ouvrir `index.html` dans le navigateur, aller sur le panneau droit desktop :
  - Vérifier que la rangée année affiche l'année en couleur ambrée, avec `‹‹` et `››`
  - Cliquer `‹‹` → année décrémente, mois reste identique
  - Cliquer `›` sur le mois → mois s'incrémente normalement
  - Cliquer `‹` jusqu'au mois 0 → mois passe à décembre et année décrémente

- [ ] **Commit**
```bash
git add js/render.js
git commit -m "feat(calendar): navigation deux rangées année/mois"
```

---

## Task 3 : `getFetesForMonth` + marqueurs teal sur la grille

**Files:**
- Modify: `js/render.js:759-773` (boucle cellules grille dans `renderSideCalendar`)

- [ ] **Ajouter `getFetesForMonth` et `feteDays` juste avant la création de `grid`**

Localiser la ligne `var grid = document.createElement('div');` (ligne ~748) et insérer **avant** :

```js
  // Fêtes du mois affiché, filtrées selon le profil
  function getFetesForMonth(y, mo) {
    var lv = (profile && profile.live) || 'fr';
    var or = (profile && profile.origin) || '';
    var or2 = (profile && profile.origin2) || '';
    var rl = (profile && profile.religion) || '';
    var all = FETES.concat(getMoveableFetes(y));
    var seen = {};
    return all.filter(function(f) {
      if (f.m !== mo + 1) return false;
      var ok = f.c.includes('universal') || f.c.includes(lv) ||
               (or && f.c.includes(or)) || (or2 && f.c.includes(or2)) ||
               (rl && f.c.includes(rl));
      if (!ok || seen[f.n]) return false;
      seen[f.n] = true;
      return true;
    });
  }
  var feteDays = {};
  getFetesForMonth(year, month).forEach(function(f) { feteDays[f.d] = true; });
```

- [ ] **Mettre à jour la boucle de cellules (lignes 759–773)**

Localiser :
```js
    var hasBday = dayMembers.length > 0;
    var cell = document.createElement('div');
    cell.textContent = String(day);
    cell.style.cssText = 'padding:5px 2px;border-radius:6px;cursor:pointer;';
    if (isToday) cell.style.cssText += 'background:var(--b1);color:#2D1B14;font-weight:700;';
    else if (hasBday) cell.style.cssText += 'background:var(--b2l);color:var(--b2d);font-weight:700;';
```

Remplacer par :
```js
    var hasBday = dayMembers.length > 0;
    var hasFete = !!feteDays[day];
    var cell = document.createElement('div');
    cell.textContent = String(day);
    cell.style.cssText = 'padding:5px 2px;border-radius:6px;cursor:pointer;';
    if (isToday) {
      cell.style.cssText += 'background:var(--b1);color:#2D1B14;font-weight:700;';
    } else if (hasBday && hasFete) {
      cell.style.cssText += 'background:var(--b2l);color:var(--b2d);font-weight:700;position:relative;';
      var dot = document.createElement('span');
      dot.style.cssText = 'position:absolute;bottom:2px;right:2px;width:4px;height:4px;border-radius:50%;background:#5dbfaa;pointer-events:none';
      cell.appendChild(dot);
    } else if (hasBday) {
      cell.style.cssText += 'background:var(--b2l);color:var(--b2d);font-weight:700;';
    } else if (hasFete) {
      cell.style.cssText += 'background:#1c3330;color:#5dbfaa;font-weight:600;';
    }
```

- [ ] **Vérifier la syntaxe**
```bash
node --check js/render.js
```
Résultat attendu : aucune sortie.

- [ ] **Test manuel** — dans le navigateur, naviguer vers un mois avec des fêtes connues (ex. juin) :
  - Vérifier que les jours de fête ont un fond teal (`#1c3330`)
  - Vérifier qu'un jour d'anniversaire seul reste orange
  - Vérifier qu'un jour cumulant les deux est orange avec un petit point teal visible en bas à droite
  - Vérifier que `today` reste toujours orange-ambre et n'est pas écrasé par teal

- [ ] **Commit**
```bash
git add js/render.js
git commit -m "feat(calendar): marqueurs fêtes teal sur la grille, point pour cumul anniv+fête"
```

---

## Task 4 : Panneau mensuel mixte (remplace "Prochains anniversaires")

**Files:**
- Modify: `js/render.js:776-805` (section upcoming dans `renderSideCalendar`)

- [ ] **Remplacer le bloc "Prochains anniversaires" (lignes 776–805) par le panneau mixte**

Localiser le commentaire `// Prochains anniversaires (30j)` et remplacer tout jusqu'à la ligne `while (el.firstChild)` par :

```js
  // Panneau mensuel mixte — anniversaires + fêtes du mois affiché, triés par date
  var monthBdays = m.filter(function(p) { return p.month === month + 1; });
  var monthFetes = getFetesForMonth(year, month);

  var events = [];
  monthBdays.forEach(function(p) {
    events.push({ d: p.day, type: 'bday', name: tIco(p.type) + ' ' + p.name });
  });
  monthFetes.forEach(function(f) {
    events.push({ d: f.d, type: 'fete', name: f.i + ' ' + f.n });
  });
  events.sort(function(a, b) {
    if (a.d !== b.d) return a.d - b.d;
    return a.type === 'bday' ? -1 : 1;
  });

  var monthTitle = document.createElement('div');
  monthTitle.style.cssText = 'font-size:12px;font-weight:700;color:var(--txt);margin:16px 0 8px';
  monthTitle.textContent = t('thisMonth');
  parts.push(monthTitle);

  if (events.length === 0) {
    var emptyEl = document.createElement('div');
    emptyEl.style.cssText = 'font-size:11px;color:var(--txt2);padding:8px 0';
    emptyEl.textContent = t('noEventsThisMonth');
    parts.push(emptyEl);
  } else {
    events.forEach(function(ev) {
      var row = document.createElement('div');
      row.style.cssText = 'display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid var(--brd)';
      var dateEl = document.createElement('div');
      dateEl.style.cssText = 'min-width:28px;font-size:10px;font-weight:700;color:var(--b1d)';
      dateEl.textContent = ev.d + '/' + (month + 1);
      var nameEl = document.createElement('div');
      nameEl.style.cssText = 'flex:1;font-size:11px;font-weight:600';
      nameEl.textContent = ev.name;
      var tagEl = document.createElement('span');
      if (ev.type === 'bday') {
        tagEl.style.cssText = 'background:#3d2a1a;color:#e8944a;border-radius:3px;font-size:9px;padding:1px 5px;white-space:nowrap;flex-shrink:0';
        tagEl.textContent = t('tagBirthday');
      } else {
        tagEl.style.cssText = 'background:#1c3330;color:#5dbfaa;border-radius:3px;font-size:9px;padding:1px 5px;white-space:nowrap;flex-shrink:0';
        tagEl.textContent = t('tagHoliday');
      }
      row.appendChild(dateEl);
      row.appendChild(nameEl);
      row.appendChild(tagEl);
      parts.push(row);
    });
  }
```

- [ ] **Vérifier la syntaxe**
```bash
node --check js/render.js
```
Résultat attendu : aucune sortie.

- [ ] **Test manuel** — dans le navigateur :
  - Vérifier que la section s'intitule "Ce mois" (ou traduction selon la langue)
  - Vérifier que les anniversaires et fêtes du mois affiché sont mélangés et triés par jour
  - Vérifier les tags `anniv` (orange) et `fête` (teal) sur chaque ligne
  - Naviguer vers un mois sans anniversaire ni fête → message "Aucun événement ce mois"
  - Naviguer vers un mois passé (ex. janvier 2025) → fêtes de janvier affichées correctement
  - Changer la langue (FR → EN) → tags et titre traduits

- [ ] **Commit**
```bash
git add js/render.js
git commit -m "feat(calendar): panneau mensuel mixte anniversaires+fêtes triés par date"
```

---

## Task 5 : Déploiement

- [ ] **Push et vérification prod**
```bash
git push origin main
```
Attendre ~1 min, puis vérifier sur https://mybloomday.app que le calendrier latéral affiche les deux rangées de navigation et le panneau mensuel.
