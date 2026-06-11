# Event Card Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corriger le layout des cartes événements dans le dashboard pour que le message généré s'affiche en pleine largeur sous l'en-tête, et que la méta-info (date, type, âge) tienne sur une seule ligne tronquée.

**Architecture:** Deux blocs HTML dans `renderHome()` sont modifiés — section "À préparer" (~lignes 172-181) et section "7 prochains jours" (~lignes 192-200). La logique JS (`genMsg`, `_renderMsgActions`) n'est pas touchée. Seule la structure HTML des cartes change.

**Tech Stack:** Vanilla JS ES6+, CSS inline, `node --check` pour validation syntaxe.

---

## Fichiers impactés

| Fichier | Action | Lignes concernées |
|---|---|---|
| `js/render.js` | Modifier | ~172-181 (section "À préparer") |
| `js/render.js` | Modifier | ~192-200 (section "7 prochains jours") |

---

### Task 1 : Restructurer les cartes "À préparer"

**Fichiers :**
- Modifier : `js/render.js:172-181`

**Problème actuel :** La carte est un flex-row en 3 colonnes [avatar | info | div#prep]. Quand `genMsg()` injecte le message dans `#prep-{id}`, il reste coincé dans la 3ème colonne étroite. Le countdown "dans N jours" est sur une ligne séparée. Le nom et la méta peuvent déborder.

- [ ] **Step 1 : Repérer exactement le bloc à remplacer**

Ouvrir `js/render.js` et localiser ces 9 lignes (dans le `forEach` de `nextFew`) :

```javascript
        h+='<div class="card cb" style="display:flex;align-items:center;gap:12px">';
        h+='<div class="av '+AV[idx%4]+'" style="width:46px;height:46px;font-size:15px">'+(p.photo?'<img src="'+p.photo+'" alt="">':ini(p.name))+'</div>';
        h+='<div style="flex:1;min-width:0">';
        h+='<div style="font-size:15px;font-weight:700;color:var(--b1d)">'+tIco(p.type)+' '+esc(wname(p))+'</div>';
        h+='<div style="font-size:12px;color:var(--b1d);margin-top:2px">'+p.day+' '+MN[p.month-1]+(age?' · '+age+' '+t(isWed(p)?'yearsTogether':'yearsOld'):'')+'</div>';
        h+='<div style="font-size:11px;font-weight:700;color:var(--b1);margin-top:3px">'+t('inDays')+' '+d+' '+(d>1?t('daysUnit'):t('dayUnit'))+'</div>';
        h+='</div>';
        h+='<div id="prep-'+p.id+'"><button class="btn O sm" onclick="genMsg(\''+p.id+'\',\'prep-'+p.id+'\')">'+t('prepareBtn')+'</button></div>';
        h+='</div>';
```

- [ ] **Step 2 : Remplacer par la nouvelle structure**

Remplacer exactement ces 9 lignes par :

```javascript
        h+='<div class="card cb">';
        h+='<div style="display:flex;align-items:center;gap:10px">';
        h+='<div class="av '+AV[idx%4]+'" style="width:40px;height:40px;font-size:13px">'+(p.photo?'<img src="'+p.photo+'" alt="">':ini(p.name))+'</div>';
        h+='<div style="flex:1;min-width:0">';
        h+='<div style="font-size:14px;font-weight:700;color:var(--b1d);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+tIco(p.type)+' '+esc(wname(p))+'</div>';
        h+='<div style="font-size:11px;color:var(--b1d);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+p.day+' '+MN[p.month-1]+(age?' · '+age+' '+t(isWed(p)?'yearsTogether':'yearsOld'):'')+'</div>';
        h+='</div>';
        h+='<span style="font-size:10px;font-weight:700;color:var(--b1);background:var(--b1l);padding:3px 8px;border-radius:20px;white-space:nowrap;flex-shrink:0">'+t('inDays')+' '+d+' '+(d>1?t('daysUnit'):t('dayUnit'))+'</span>';
        h+='</div>';
        h+='<div id="prep-'+p.id+'" style="margin-top:10px"><button class="btn O fw" onclick="genMsg(\''+p.id+'\',\'prep-'+p.id+'\')">'+t('prepareBtn')+'</button></div>';
        h+='</div>';
```

Ce qui change :
- La card elle-même n'est plus un flex-row → plus de conflit avec le message injecté
- Un flex-row interne contient [avatar | nom+méta | badge-countdown]
- `white-space:nowrap; overflow:hidden; text-overflow:ellipsis` sur nom ET méta → une seule ligne tronquée
- Badge countdown (`flex-shrink:0`) déplacé dans le header row à droite
- `#prep-{id}` est maintenant en dehors du flex-row, pleine largeur → le message injecté par `genMsg()` prend toute la largeur

- [ ] **Step 3 : Vérifier la syntaxe JS**

```bash
node --check js/render.js
```

Résultat attendu : aucune sortie (pas d'erreur).

- [ ] **Step 4 : Commit**

```bash
git add js/render.js
git commit -m "fix(cards): restructure À-préparer cards — inline message panel full-width, single-line meta"
```

---

### Task 2 : Restructurer les cartes "7 prochains jours"

**Fichiers :**
- Modifier : `js/render.js:192-200`

**Problème actuel :** Le badge countdown `pbdg pbs` est collé dans le div du nom (inline dans le texte), le nom et la méta peuvent déborder. Les deux boutons (Préparer + Fleurs) sont dans le même `#up-{id}` — quand `genMsg()` injecte le message, le bouton Fleurs disparaît aussi.

- [ ] **Step 1 : Repérer exactement le bloc à remplacer**

Dans `js/render.js`, dans le `forEach` de `upcoming`, localiser ces 8 lignes :

```javascript
      h+='<div class="card cb">';
      h+='<div style="display:flex;align-items:center;gap:10px">';
      h+='<div class="av '+AV[idx%4]+'">'+(p.photo?'<img src="'+p.photo+'" alt="">':ini(p.name))+'</div>';
      h+='<div style="flex:1;min-width:0">';
      h+='<div style="font-size:14px;font-weight:700;color:var(--b1d)">'+tIco(p.type)+' '+esc(wname(p))+'<span class="pbdg pbs">'+t('inDays')+' '+d+'j</span></div>';
      h+='<div style="font-size:12px;color:var(--b1d)">'+tLbl(p.type)+' · '+p.day+' '+MN[p.month-1]+(age?' — '+age+' '+t(isWed(p)?'yearsTogether':'yearsOld'):'')+'</div>';
      h+='</div></div>';
      h+='<div id="up-'+p.id+'"><div class="brow" style="margin-top:8px"><button class="btn sm" onclick="genMsg(\''+p.id+'\',\'up-'+p.id+'\')">'+t('prepareBtn')+'</button><button class="btn sm O" style="margin-left:6px" onclick="showFlowerIdeas(\''+esc(p.name)+'\',\''+p.type+'\')">'+t('flowerIdeasBtn')+'</button></div></div>';
      h+='</div>';
```

- [ ] **Step 2 : Remplacer par la nouvelle structure**

Remplacer exactement ces 9 lignes par :

```javascript
      h+='<div class="card cb">';
      h+='<div style="display:flex;align-items:center;gap:10px">';
      h+='<div class="av '+AV[idx%4]+'">'+(p.photo?'<img src="'+p.photo+'" alt="">':ini(p.name))+'</div>';
      h+='<div style="flex:1;min-width:0">';
      h+='<div style="font-size:14px;font-weight:700;color:var(--b1d);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+tIco(p.type)+' '+esc(wname(p))+'</div>';
      h+='<div style="font-size:11px;color:var(--b1d);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+tLbl(p.type)+' · '+p.day+' '+MN[p.month-1]+(age?' — '+age+' '+t(isWed(p)?'yearsTogether':'yearsOld'):'')+'</div>';
      h+='</div>';
      h+='<span class="pbdg pbs" style="flex-shrink:0">'+t('inDays')+' '+d+'j</span>';
      h+='</div>';
      h+='<div id="up-'+p.id+'" style="margin-top:8px"><button class="btn sm" onclick="genMsg(\''+p.id+'\',\'up-'+p.id+'\')">'+t('prepareBtn')+'</button></div>';
      h+='<div style="margin-top:6px"><button class="btn sm O" onclick="showFlowerIdeas(\''+esc(p.name)+'\',\''+p.type+'\')">'+t('flowerIdeasBtn')+'</button></div>';
      h+='</div>';
```

Ce qui change :
- Badge countdown `pbdg pbs` sorti du div du nom → maintenant 3ème flex-item dans le header row, avec `flex-shrink:0`
- Nom ET méta : `white-space:nowrap; overflow:hidden; text-overflow:ellipsis`
- `#up-{id}` ne contient plus que le bouton Préparer → message injecté en pleine largeur
- Bouton Fleurs dans un div séparé sous `#up-{id}` → reste visible après génération du message

- [ ] **Step 3 : Vérifier la syntaxe JS**

```bash
node --check js/render.js
```

Résultat attendu : aucune sortie.

- [ ] **Step 4 : Commit**

```bash
git add js/render.js
git commit -m "fix(cards): restructure 7-jours cards — inline message panel, Fleurs button preserved, single-line meta"
```

---

### Task 3 : Vérification visuelle manuelle

**Fichiers :**
- Lire : `js/render.js` (vérification visuelle)

- [ ] **Step 1 : Ouvrir l'app et naviguer vers le dashboard**

Ouvrir `https://mybloomday.app` (ou `index.html` en local). Aller sur la page d'accueil (dashboard).

- [ ] **Step 2 : Vérifier la section "À préparer"**

Checklist :
- [ ] Chaque carte a le header [avatar | nom | badge "dans N j"] sur une seule ligne
- [ ] Le nom long (ex: "Worfl Steevens Desronvil (mariage avec...)") est tronqué avec `...`
- [ ] La méta (date · âge) est sur une ligne, tronquée si trop longue
- [ ] Le badge "dans N jours" est visible à droite, pas compressé
- [ ] Le bouton "Préparer" est pleine largeur sous le header
- [ ] Cliquer "Préparer" → le message généré apparaît en pleine largeur sous le header (plus de colonne étroite)
- [ ] Les boutons Copier / WhatsApp / 🌊 sont accessibles

- [ ] **Step 3 : Vérifier la section "7 prochains jours"**

Checklist :
- [ ] Header [avatar | nom | badge countdown] sur une ligne
- [ ] Nom et méta tronqués avec ellipsis
- [ ] Boutons Préparer ET Fleurs visibles par défaut
- [ ] Cliquer "Préparer" → message pleine largeur dans `#up-{id}`, bouton **Fleurs reste visible** en dessous
- [ ] Cliquer "Fleurs" → `showFlowerIdeas()` s'ouvre normalement

- [ ] **Step 4 : Commit final si tout est bon**

```bash
git add js/render.js
git commit -m "chore: verify event card redesign — all states confirmed working"
```

Si des ajustements CSS mineurs sont nécessaires (espacements, couleurs), les corriger avant ce commit.
