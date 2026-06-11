---
name: event-card-redesign
description: Redesign des cartes événements dans le dashboard — layout C1 (panneau inline), meta sur une seule ligne, nom tronqué, message pleine largeur
metadata:
  type: project
---

# Redesign des cartes événements — Dashboard

## Contexte

Les cartes des sections "À préparer" et "7 prochains jours" souffrent d'un problème de layout : quand l'utilisateur clique "Préparer", le message généré s'injecte dans un div flex à droite du nom, créant une colonne étroite illisible. De plus, les noms longs (ex : anniversaire de mariage avec deux prénoms) et la méta-info multi-ligne rendent les cartes visuellement incohérentes.

## Problème actuel

**Section "À préparer" (lignes ~169-178 de `js/render.js`) :**
```html
<div class="card cb" style="display:flex;align-items:center;gap:12px">
  [avatar]
  [flex:1 → nom + date + âge + jours sur lignes séparées]
  [div#prep-id → bouton → puis message injecté en colonne droite étroite]
</div>
```
Le `div#prep-id` est un 3ème flex-item dans la ligne horizontale — le message s'y injecte écrasé.

## Design validé — Option C1

### Structure des cartes

**Section "À préparer" — nouvelle structure :**
```html
<div class="card cb">
  <!-- Header : flex-row fixe -->
  <div style="display:flex;align-items:center;gap:10px">
    [avatar 40×40]
    <div style="flex:1;min-width:0">
      <!-- Nom tronqué ellipsis -->
      <div style="...;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
        {icône} {nom}
      </div>
      <!-- Méta sur UNE seule ligne, overflow:hidden -->
      <div style="...;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
        {date} · {type} · {âge} ans
      </div>
    </div>
    <!-- Badge countdown, flex-shrink:0 -->
    <span style="...;flex-shrink:0">dans {N} j</span>
  </div>
  <!-- Bouton pleine largeur -->
  <div id="prep-{id}">
    <button class="btn O fw" style="margin-top:10px">✨ Préparer le message</button>
  </div>
</div>
```

**Section "7 prochains jours" — même principe :**
```html
<div class="card cb">
  <div style="display:flex;align-items:center;gap:10px">
    [avatar]
    <div style="flex:1;min-width:0">
      <div style="...;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{icône} {nom}</div>
      <div style="...;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{type} · {date} · {âge} ans</div>
    </div>
    <span style="...;flex-shrink:0">dans {N} j</span>
  </div>
  <!-- Zone message (cible de genMsg) — séparée du bouton Fleurs -->
  <div id="up-{id}" style="margin-top:10px">
    <button class="btn sm" onclick="genMsg(...)">Préparer</button>
  </div>
  <!-- Bouton Fleurs : hors de #up-{id}, reste visible après génération -->
  <div style="margin-top:6px">
    <button class="btn sm O" onclick="showFlowerIdeas(...)">Fleurs</button>
  </div>
</div>
```

**Important :** `#up-{id}` ne contient plus que le bouton Préparer. Le bouton Fleurs est dans un div séparé, hors de portée de `genMsg()`, donc il reste visible après la génération du message.

### Règles clés

1. **Méta sur une ligne** : `white-space:nowrap; overflow:hidden; text-overflow:ellipsis` — la date, le type et l'âge tiennent sur une seule ligne quelle que soit la longueur.

2. **Nom tronqué** : même règle CSS sur le div du nom.

3. **Badge "dans N jours"** : `flex-shrink:0` pour ne jamais être compressé — toujours visible à droite.

4. **Panneau message inline (C1)** : le `div#prep-{id}` est en dehors du flex-row, en pleine largeur sous le header. Quand `genMsg()` injecte le message, il remplace ce div en pleine largeur.

5. **Section "7 jours" après génération** : le bouton Préparer disparaît (remplacé par le message dans `#up-{id}`), le bouton Fleurs est dans un div séparé — il reste toujours visible.

### Panneau message injecté

Inchangé fonctionnellement — `genMsg()` injecte dans `#prep-{id}` ou `#up-{id}` qui sont maintenant en pleine largeur. Le HTML injecté par `genMsg()` / `_renderMsgActions()` n'est pas modifié.

### Ce qui ne change pas

- La section "aujourd'hui" (`h-msg-{id}`) — elle a déjà une structure correcte.
- La logique JS (`genMsg`, `_renderMsgActions`, `genGiftModal`, etc.) — aucune modification.
- Les classes CSS existantes (`card`, `cb`, `btn`, `brow`, etc.).
- Les clés i18n — `prepareBtn` et `flowerIdeasBtn` restent inchangées.

## Fichiers impactés

- `js/render.js` — lignes ~165-198 (sections "À préparer" et "7 prochains jours")

## Périmètre

Uniquement les deux sections concernées dans `renderHome()`. Pas de refactor des autres sections ni des autres pages.
