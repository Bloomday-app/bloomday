# Calendrier mensuel interactif — Panneau droit desktop

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enrichir le panneau droit desktop Bloomday en un calendrier mensuel navigable (‹ ›) avec accès inline à la fiche de chaque personne + fix du bouton admin invisible.

**Architecture:** Deux fichiers modifiés — `js/render.js` (ajout de la variable d'état `sideCal`, réécriture de `renderSideCalendar` et `showDayDetails`, ajout de `showMemberEditPanel` + `saveEditPanel`) et `index.html` (fix bouton admin). Aucune nouvelle dépendance. Flow : calendrier → détail jour → formulaire édition → retour calendrier.

**Tech Stack:** Vanilla JS ES6+ global (pas de module/import), CSS custom via variables CSS, `saveG()` + `setMems()` + `mems()` depuis `i18n.js` pour la persistence.

---

## Fichiers modifiés

| Fichier | Zone | Changement |
|---|---|---|
| `index.html` | ligne 329 | Ajout `style=` sur le bouton admin |
| `js/render.js` | avant ligne 555 | Ajout `var sideCal = {...}` |
| `js/render.js` | lignes 555–635 | Réécriture `renderSideCalendar()` |
| `js/render.js` | lignes 637–696 | Réécriture `showDayDetails()` |
| `js/render.js` | après ligne 696 | Ajout `showMemberEditPanel()` + `saveEditPanel()` |

**Fonctions utilitaires disponibles globalement (définies dans `i18n.js`) :**
- `mems()` — retourne les membres du groupe courant
- `setMems(arr)` — enregistre le tableau de membres
- `saveG()` — persiste groupes en localStorage + Supabase
- `ini(name)` — retourne les initiales (ex: "Dadou" → "D")
- `tIco(type)` — retourne l'emoji du type ("birthday" → "🎂")
- `tLbl(type)` — retourne le label traduit du type
- `daysTill(day, month)` — jours jusqu'au prochain anniversaire
- `ageBday(day, month, year)` — âge au prochain anniversaire
- `t(key)` — traduction i18n
- `esc(s)` — échappe HTML pour sécurité
- `AV` — tableau `['av1','av2','av3','av4']` (classes CSS couleurs avatars)
- `MN` — tableau 12 noms de mois en français

---

## Task 1: Fix bouton admin — texte invisible sur fond crème

**Files:**
- Modify: `index.html:329`

**Pourquoi :** Sur desktop ≥1024px, le `body` a un background hardcodé crème. En dark mode OS, `--txt` vaut `#F5EEE2` (blanc cassé) → texte invisible. Fix : forcer le texte en `#2D1B14` (brun sombre) indépendamment du thème.

- [ ] **Step 1: Modifier le bouton dans index.html**

Trouver à la ligne 329 :
```html
<button class="btn fw" onclick="showSec('home',0)" data-i18n="adminBrowseBtn">Voir l'app comme un utilisateur →</button>
```
Remplacer par :
```html
<button class="btn fw" onclick="showSec('home',0)" data-i18n="adminBrowseBtn" style="color:#2D1B14;border-color:#C8A850">Voir l'app comme un utilisateur →</button>
```

- [ ] **Step 2: Test manuel**

Ouvrir `mybloomday.app` sur desktop (≥1024px), aller dans Admin. Le bouton "Voir l'app comme un utilisateur →" doit avoir un texte brun sombre lisible, que le système soit en mode clair ou sombre.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "fix(admin): texte bouton visible en dark mode sur fond crème desktop"
```

---

## Task 2: Variable `sideCal` + navigation mois dans `renderSideCalendar`

**Files:**
- Modify: `js/render.js:553–635`

- [ ] **Step 1: Remplacer renderSideCalendar dans render.js**

Remplacer tout le bloc `function renderSideCalendar() { ... }` (lignes 555–635) ainsi que la ligne vide avant (553–554), en ajoutant la déclaration de `sideCal` juste avant la fonction :

```javascript
var sideCal = { year: new Date().getFullYear(), month: new Date().getMonth() };

function renderSideCalendar() {
  var el = document.getElementById('desktop-right-panel');
  if (!el) return;
  var m = mems();
  var now = new Date();
  var year = sideCal.year;
  var month = sideCal.month;
  var daysInMonth = new Date(year, month + 1, 0).getDate();
  var firstDay = new Date(year, month, 1).getDay();
  firstDay = firstDay === 0 ? 6 : firstDay - 1;

  var parts = [];

  // Header de navigation
  var header = document.createElement('div');
  header.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin-bottom:12px';

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
  titleEl.textContent = MN[month] + ' ' + year;

  var nextBtn = document.createElement('button');
  nextBtn.textContent = '›';
  nextBtn.style.cssText = 'background:var(--bg2);border:1px solid var(--brd);border-radius:6px;color:var(--txt);font-size:16px;padding:1px 8px;cursor:pointer;line-height:1';
  nextBtn.onclick = function() {
    sideCal.month++;
    if (sideCal.month > 11) { sideCal.month = 0; sideCal.year++; }
    renderSideCalendar();
  };

  header.appendChild(prevBtn);
  header.appendChild(titleEl);
  header.appendChild(nextBtn);
  parts.push(header);

  // Grille
  var grid = document.createElement('div');
  grid.style.cssText = 'display:grid;grid-template-columns:repeat(7,1fr);gap:3px;font-size:11px;text-align:center';
  ['L','M','M','J','V','S','D'].forEach(function(d) {
    var hd = document.createElement('div');
    hd.style.cssText = 'color:var(--txt2);padding:2px;font-size:10px';
    hd.textContent = d;
    grid.appendChild(hd);
  });
  for (var i = 0; i < firstDay; i++) {
    grid.appendChild(document.createElement('div'));
  }
  for (var day = 1; day <= daysInMonth; day++) {
    var isToday = day === now.getDate() && month === now.getMonth() && year === now.getFullYear();
    var dayMembers = m.filter(function(p) { return p.day === day && p.month === (month + 1); });
    var hasBday = dayMembers.length > 0;
    var cell = document.createElement('div');
    cell.textContent = String(day);
    cell.style.cssText = 'padding:5px 2px;border-radius:6px;cursor:' + (hasBday ? 'pointer' : 'default') + ';';
    if (isToday) cell.style.cssText += 'background:var(--b1);color:#2D1B14;font-weight:700;';
    else if (hasBday) cell.style.cssText += 'background:var(--b2l);color:var(--b2d);font-weight:700;';
    if (hasBday) {
      (function(d, members) {
        cell.onclick = function() { showDayDetails(d, month + 1, members); };
        cell.title = members.map(function(p) { return p.name; }).join(', ');
      })(day, dayMembers);
    }
    grid.appendChild(cell);
  }
  parts.push(grid);

  // Prochains anniversaires (30j)
  var upcoming = m.filter(function(p) {
    var dl = daysTill(p.day, p.month);
    return dl >= 0 && dl <= 30;
  }).sort(function(a, b) { return daysTill(a.day, a.month) - daysTill(b.day, b.month); }).slice(0, 5);

  if (upcoming.length) {
    var upTitle = document.createElement('div');
    upTitle.style.cssText = 'font-size:12px;font-weight:700;color:var(--txt);margin:16px 0 8px';
    upTitle.textContent = t('upcomingBdays');
    parts.push(upTitle);
    upcoming.forEach(function(p) {
      var row = document.createElement('div');
      row.style.cssText = 'display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--brd)';
      var dateEl = document.createElement('div');
      dateEl.style.cssText = 'min-width:28px;font-size:11px;font-weight:700;color:var(--b1d)';
      dateEl.textContent = p.day + '/' + p.month;
      var nameEl = document.createElement('div');
      nameEl.style.cssText = 'flex:1;font-size:12px;font-weight:600';
      nameEl.textContent = tIco(p.type) + ' ' + p.name;
      var dlEl = document.createElement('div');
      var dl = daysTill(p.day, p.month);
      dlEl.style.cssText = 'font-size:10px;color:var(--txt2)';
      dlEl.textContent = dl === 0 ? t('calendarToday') : 'J-' + dl;
      row.appendChild(dateEl);
      row.appendChild(nameEl);
      row.appendChild(dlEl);
      parts.push(row);
    });
  }

  while (el.firstChild) el.removeChild(el.firstChild);
  parts.forEach(function(node) { el.appendChild(node); });
}
```

- [ ] **Step 2: Vérifier la syntaxe JS**

```bash
node --check js/render.js
```
Résultat attendu : aucune sortie.

- [ ] **Step 3: Test manuel**

Sur desktop (≥1024px), aller sur l'Accueil. Le panneau droit affiche `‹ Mai 2026 ›`.
- `‹` → Avril 2026. `›` depuis Décembre → Janvier année suivante. `‹` depuis Janvier → Décembre année précédente.
- Aujourd'hui en doré dans la grille. Jours avec anniversaire en rouge/saumon.

- [ ] **Step 4: Commit**

```bash
git add js/render.js
git commit -m "feat(calendar): navigation mois dans le panneau droit desktop"
```

---

## Task 3: Réécriture de `showDayDetails` avec 3 boutons par personne

**Files:**
- Modify: `js/render.js:637–696`

- [ ] **Step 1: Remplacer showDayDetails dans render.js**

Remplacer tout le bloc `function showDayDetails(day, month, members) { ... }` par :

```javascript
function showDayDetails(day, month, members) {
  var el = document.getElementById('desktop-right-panel');
  if (!el) return;
  var monthName = MN[month - 1] || String(month);
  var allMems = mems();
  var parts = [];

  var backBtn = document.createElement('button');
  backBtn.textContent = '← ' + MN[sideCal.month] + ' ' + sideCal.year;
  backBtn.style.cssText = 'background:none;border:none;color:var(--b1d);font-size:12px;font-weight:700;cursor:pointer;padding:0 0 12px;display:block';
  backBtn.onclick = function() { renderSideCalendar(); };
  parts.push(backBtn);

  var titleEl = document.createElement('div');
  titleEl.style.cssText = 'font-size:16px;font-weight:800;color:var(--txt);margin-bottom:14px';
  titleEl.textContent = day + ' ' + monthName;
  parts.push(titleEl);

  members.forEach(function(p) {
    var idx = allMems.indexOf(p);
    var card = document.createElement('div');
    card.style.cssText = 'background:var(--card);border:1px solid var(--brd);border-radius:12px;padding:12px;margin-bottom:10px';

    var top = document.createElement('div');
    top.style.cssText = 'display:flex;align-items:center;gap:10px;margin-bottom:10px';

    var av = document.createElement('div');
    av.className = 'av ' + (idx >= 0 ? AV[idx % 4] : AV[0]);
    av.style.cssText = 'width:38px;height:38px;font-size:13px;flex-shrink:0';
    if (p.photo) {
      var img = document.createElement('img');
      img.src = p.photo;
      img.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:50%';
      av.appendChild(img);
    } else {
      av.textContent = ini(p.name);
    }

    var info = document.createElement('div');
    info.style.cssText = 'flex:1;min-width:0';

    var nm = document.createElement('div');
    nm.style.cssText = 'font-size:13px;font-weight:700;color:var(--txt)';
    nm.textContent = tIco(p.type) + ' ' + p.name;

    var sub = document.createElement('div');
    sub.style.cssText = 'font-size:11px;color:var(--txt2);margin-top:1px';
    var age = ageBday(p.day, p.month, p.year);
    sub.textContent = tLbl(p.type) + ' · ' + p.day + ' ' + MN[p.month - 1] + (p.year ? ' ' + p.year : '') + (age ? ' — ' + age + ' ' + t('yearsOld') : '');

    var dl = daysTill(p.day, p.month);
    var dlEl = document.createElement('div');
    dlEl.style.cssText = 'font-size:11px;color:var(--b1d);margin-top:2px;font-weight:700';
    dlEl.textContent = dl === 0 ? t('calendarToday') : t('inDays') + ' ' + dl + ' ' + (dl > 1 ? t('daysUnit') : t('dayUnit'));

    info.appendChild(nm);
    info.appendChild(sub);
    info.appendChild(dlEl);
    top.appendChild(av);
    top.appendChild(info);
    card.appendChild(top);

    var btns = document.createElement('div');
    btns.style.cssText = 'display:flex;gap:5px';

    var editBtn = document.createElement('button');
    editBtn.className = 'btn O sm';
    editBtn.style.cssText = 'flex:1;font-size:10px;padding:6px 4px';
    editBtn.textContent = '✏ ' + t('editMember');
    (function(pid) { editBtn.onclick = function() { showMemberEditPanel(pid, day, month); }; })(p.id);

    var msgBtn = document.createElement('button');
    msgBtn.className = 'btn G sm';
    msgBtn.style.cssText = 'flex:1;font-size:10px;padding:6px 4px';
    msgBtn.textContent = '✨ ' + t('msgBtn');
    (function(pid) { msgBtn.onclick = function() { genMsg(pid, 'side-msg-' + pid); }; })(p.id);

    var giftBtn = document.createElement('button');
    giftBtn.className = 'btn V sm';
    giftBtn.style.cssText = 'flex:1;font-size:10px;padding:6px 4px';
    giftBtn.textContent = '💡 ' + t('giftBtn');
    (function(pid) { giftBtn.onclick = function() { genGiftModal(pid); }; })(p.id);

    btns.appendChild(editBtn);
    btns.appendChild(msgBtn);
    btns.appendChild(giftBtn);
    card.appendChild(btns);

    var msgDiv = document.createElement('div');
    msgDiv.id = 'side-msg-' + p.id;
    card.appendChild(msgDiv);

    parts.push(card);
  });

  while (el.firstChild) el.removeChild(el.firstChild);
  parts.forEach(function(node) { el.appendChild(node); });
}
```

- [ ] **Step 2: Vérifier la syntaxe JS**

```bash
node --check js/render.js
```
Résultat attendu : aucune sortie.

- [ ] **Step 3: Test manuel**

Cliquer un jour rouge dans le calendrier. Détail s'affiche : bouton retour, titre `11 Mai`, carte membre avec 3 boutons.
- `‹ retour` → revient au calendrier.
- Bouton Message → message IA apparaît sous la carte.
- Bouton Idée → modale cadeaux s'ouvre.

- [ ] **Step 4: Commit**

```bash
git add js/render.js
git commit -m "feat(calendar): detail du jour avec boutons Modifier/Message/Idee dans le panneau droit"
```

---

## Task 4: Formulaire d'édition inline — `showMemberEditPanel` + `saveEditPanel`

**Files:**
- Modify: `js/render.js` (insertion avant `// ── PLUS ──`)

- [ ] **Step 1: Insérer les deux fonctions dans render.js juste avant `// ── PLUS ──`**

```javascript
function showMemberEditPanel(memberId, backDay, backMonth) {
  var el = document.getElementById('desktop-right-panel');
  if (!el) return;
  var p = mems().find(function(x) { return String(x.id) === String(memberId); });
  if (!p) return;
  var backMonthName = MN[backMonth - 1] || String(backMonth);

  while (el.firstChild) el.removeChild(el.firstChild);

  function mkLabel(text) {
    var l = document.createElement('label');
    l.style.cssText = 'font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--txt2);display:block;margin-bottom:4px;margin-top:10px';
    l.textContent = text;
    return l;
  }
  function mkInput(id, type, value, extra) {
    var inp = document.createElement('input');
    inp.id = id;
    inp.className = 'inp';
    inp.type = type || 'text';
    inp.value = value || '';
    if (extra) Object.assign(inp, extra);
    return inp;
  }
  function mkTextarea(id, value) {
    var ta = document.createElement('textarea');
    ta.id = id;
    ta.className = 'inp';
    ta.rows = 2;
    ta.style.cssText = 'min-height:50px';
    ta.value = value || '';
    return ta;
  }

  var backBtn = document.createElement('button');
  backBtn.style.cssText = 'background:none;border:none;color:var(--b1d);font-size:12px;font-weight:700;cursor:pointer;padding:0 0 12px;display:block';
  backBtn.textContent = '← ' + backDay + ' ' + backMonthName;
  backBtn.onclick = function() {
    showDayDetails(backDay, backMonth, mems().filter(function(x) { return x.day === backDay && x.month === backMonth; }));
  };
  el.appendChild(backBtn);

  var title = document.createElement('div');
  title.style.cssText = 'font-size:13px;font-weight:700;color:var(--txt);margin-bottom:4px';
  title.textContent = '✏ ' + t('editMember') + ' ' + p.name;
  el.appendChild(title);

  el.appendChild(mkLabel(t('namePlaceholder') || 'Nom'));
  el.appendChild(mkInput('sp-name', 'text', p.name));

  var dateRow = document.createElement('div');
  dateRow.style.cssText = 'display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-top:10px';
  [
    { label: t('dayLabel') || 'Jour', id: 'sp-day', val: String(p.day), maxlength: '2' },
    { label: t('monthLabel') || 'Mois', id: 'sp-month', val: String(p.month), maxlength: '2' },
    { label: t('yearLabel') || 'Annee', id: 'sp-year', val: String(p.year || ''), maxlength: '4' }
  ].forEach(function(f) {
    var w = document.createElement('div');
    var l = document.createElement('label');
    l.style.cssText = 'font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--txt2);display:block;margin-bottom:4px';
    l.textContent = f.label;
    var inp = document.createElement('input');
    inp.id = f.id;
    inp.className = 'inp';
    inp.setAttribute('inputmode', 'numeric');
    inp.setAttribute('maxlength', f.maxlength);
    inp.value = f.val;
    w.appendChild(l);
    w.appendChild(inp);
    dateRow.appendChild(w);
  });
  el.appendChild(dateRow);

  el.appendChild(mkLabel(t('labelPhone') || 'Telephone'));
  el.appendChild(mkInput('sp-phone', 'tel', p.phone || ''));

  el.appendChild(mkLabel(t('notesLabel') || 'Notes'));
  el.appendChild(mkTextarea('sp-note', p.note || ''));

  el.appendChild(mkLabel(t('customMsgLabel') || 'Message personnalise'));
  el.appendChild(mkTextarea('sp-custom-msg', p.customMsg || ''));

  var errDiv = document.createElement('div');
  errDiv.id = 'sp-err';
  errDiv.style.cssText = 'font-size:12px;color:var(--b2d);margin-top:8px;display:none';
  el.appendChild(errDiv);

  var saveBtn = document.createElement('button');
  saveBtn.className = 'btn P fw';
  saveBtn.style.cssText = 'margin-top:12px;margin-bottom:8px';
  saveBtn.textContent = '✓ ' + t('saveBtn');
  (function(mid, bd, bm) {
    saveBtn.onclick = function() { saveEditPanel(mid, bd, bm); };
  })(memberId, backDay, backMonth);
  el.appendChild(saveBtn);

  var cancelBtn = document.createElement('button');
  cancelBtn.className = 'btn fw';
  cancelBtn.textContent = t('cancelBtn');
  (function(bd, bm) {
    cancelBtn.onclick = function() {
      showDayDetails(bd, bm, mems().filter(function(x) { return x.day === bd && x.month === bm; }));
    };
  })(backDay, backMonth);
  el.appendChild(cancelBtn);
}

function saveEditPanel(memberId, backDay, backMonth) {
  var m = mems();
  var p = m.find(function(x) { return String(x.id) === String(memberId); });
  if (!p) return;

  var name = (document.getElementById('sp-name').value || '').trim();
  var day = parseInt(document.getElementById('sp-day').value) || 0;
  var month = parseInt(document.getElementById('sp-month').value) || 0;
  var yearVal = document.getElementById('sp-year').value;
  var phone = (document.getElementById('sp-phone').value || '').trim();
  var note = (document.getElementById('sp-note').value || '').trim();
  var customMsg = (document.getElementById('sp-custom-msg').value || '').trim();

  var errDiv = document.getElementById('sp-err');
  if (!name || !day || !month || day < 1 || day > 31 || month < 1 || month > 12) {
    if (errDiv) { errDiv.textContent = t('invalidData'); errDiv.style.display = 'block'; }
    return;
  }
  if (errDiv) errDiv.style.display = 'none';

  Object.assign(p, {
    name: name,
    day: day,
    month: month,
    year: yearVal ? parseInt(yearVal) : null,
    phone: phone,
    note: note,
    customMsg: customMsg || undefined
  });
  m.sort(function(a, b) { return a.month - b.month || a.day - b.day; });
  setMems(m);
  saveG();

  var sHome = document.getElementById('s-home');
  if (sHome && sHome.style.display !== 'none') rHome();

  renderSideCalendar();

  var el = document.getElementById('desktop-right-panel');
  if (el) {
    var flash = document.createElement('div');
    flash.style.cssText = 'background:var(--b3l);color:var(--b3d);border-radius:8px;padding:8px 12px;font-size:12px;font-weight:700;margin-bottom:10px';
    flash.textContent = '✓ ' + name + ' ' + t('saveBtn').toLowerCase();
    el.insertBefore(flash, el.firstChild);
    setTimeout(function() { if (flash.parentNode) flash.parentNode.removeChild(flash); }, 2000);
  }
}
```

- [ ] **Step 2: Vérifier la syntaxe JS**

```bash
node --check js/render.js
```
Résultat attendu : aucune sortie.

- [ ] **Step 3: Test manuel — formulaire édition**

Cliquer un jour avec anniversaire → cliquer "Modifier".
- Formulaire pré-rempli avec nom, jour/mois/année, téléphone, notes.
- Modifier le nom → "Sauvegarder" → flash vert 2s, retour calendrier, données mises à jour.
- Cliquer "Annuler" → retour détail du jour sans modification.
- Saisir jour "99" → message d'erreur rouge inline affiché, pas de sauvegarde.
- Naviguer dans la section Membres → confirme que le changement est bien persisté.

- [ ] **Step 4: Test de non-régression mobile**

Réduire la fenêtre sous 1024px. Le panneau droit disparaît. L'Accueil mobile affiche le bandeau "Cette semaine" (7 cases) sans modification.

- [ ] **Step 5: Commit**

```bash
git add js/render.js
git commit -m "feat(calendar): formulaire edition inline dans le panneau droit desktop"
```

---

## Recette finale

- [ ] Navigation `‹ ›` change le mois affiché
- [ ] Wrap Décembre→Janvier et Janvier→Décembre avec changement d'année
- [ ] Aujourd'hui toujours doré, même en naviguant sur d'autres mois
- [ ] Jours avec anniversaire cliquables (rouge/saumon)
- [ ] Détail jour : 3 boutons par personne
- [ ] Message IA s'affiche sous la carte sans quitter le panneau
- [ ] Formulaire pré-rempli avec les données existantes
- [ ] Sauvegarde met à jour store local + Supabase
- [ ] Flash vert 2s après sauvegarde
- [ ] Erreur de validation inline (pas d'alert)
- [ ] Bouton admin lisible (dark mode + light mode)
- [ ] Mobile inchangé
