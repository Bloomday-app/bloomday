# Wave 3 — Spec design Bloomday

**Date :** 2026-05-20  
**Statut :** Approuvé par le fondateur  
**Périmètre :** 6 chantiers indépendants, déployés en une seule vague

---

## Vue d'ensemble

Wave 3 ajoute six fonctionnalités à mybloomday.app, priorisées dans cet ordre :

1. **Hero banner illustrée** — section visuelle sur la landing page
2. **Footer légal** — FAQ, CGU, RGPD, À propos en modales
3. **OG / aperçu réseaux sociaux** — correction URLs + image avec vrai logo
4. **Suggestions fleurs affiliées** — idées cadeaux avec liens partenaires
5. **Chatbot IA** — widget Gemini Flash sur landing + app
6. **Panel admin** — accès fondateur à toutes les données et à l'app

---

## Chantier 1 — OG / Aperçu réseaux sociaux

### Problème actuel
Les meta tags `og:url` et `og:image` pointent vers `bloomday-day.netlify.app` (ancienne URL). Quand on partage `mybloomday.app` sur WhatsApp, LinkedIn, X, le lien affiche un aperçu générique (fond blanc, icône planète) au lieu du vrai logo Bloomday.

### Solution
- Corriger `og:url` → `https://mybloomday.app`
- Corriger `og:image` → `https://mybloomday.app/img/og-cover.png`
- Corriger `twitter:image` → `https://mybloomday.app/img/og-cover.png`
- Régénérer `img/og-cover.png` : utiliser `img/logo.png` (vrai logo B violet 2000×2000px), fond beige/crème, texte `mybloomday.app` en bas à gauche, format 1200×630px

### Comportement
Le fond reste beige/crème pour l'instant — susceptible d'évoluer vers un fond violet dans une mise à jour future.

---

## Chantier 2 — Bannière hero illustrée

### Objectif
Remplacer le header actuel de `#land` (logo centré + titre) par une section hero split qui raconte visuellement l'histoire : *quelqu'un envoie un message Bloomday, le destinataire le reçoit et est touché*.

### Layout desktop (≥ 768px)
Split 50/50 horizontal :
- **Gauche :** titre h1 + sous-titre + badge CTA "🌸 7 jours gratuits"
- **Droite :** photo Unsplash (femme souriante tenant son téléphone) + mockup téléphone WhatsApp affichant un message Bloomday reçu

### Layout mobile (< 768px)
Stack vertical :
- **En haut :** photo Unsplash (`max-height: 240px`, `object-fit: cover`, `object-position: top`)
- **En bas :** titre h1 + sous-titre + bouton CTA

### Photo Unsplash
- Source : `unsplash.com`, licence gratuite (Unsplash License)
- Sujet : femme souriante regardant son téléphone, ambiance chaleureuse
- Téléchargée localement dans `img/hero-photo.jpg`
- Intégrée via `<img>` dans la section `.hero`

### Mockup téléphone
- Dessiné en HTML/CSS pur (pas d'image externe)
- Simule une conversation WhatsApp avec un message Bloomday en bulle verte
- Emoji 🥹 du destinataire en réaction

---

## Chantier 3 — Chatbot IA (Gemini Flash)

### Architecture
```
Browser → Netlify Function (/.netlify/functions/chat) → Google Gemini Flash API → réponse
```

La clé API Google est stockée en variable d'environnement Netlify (`GEMINI_API_KEY`). Elle ne passe jamais côté client.

### Modèle
**Gemini 1.5 Flash** (Google) — tier gratuit : 15 requêtes/minute, 1 million tokens/jour. Zéro coût tant que l'usage reste dans ces limites.

### Persona
"Bloom" — assistant Bloomday. Ton chaleureux, bref, émoji discret. Connaît Bloomday en détail (produit, abonnements, fonctionnalités). Ne sort pas du périmètre Bloomday.

### System prompt (base)
```
Tu es Bloom, l'assistant de Bloomday. Tu aides les visiteurs à comprendre Bloomday et les utilisateurs à rédiger des messages, trouver des idées cadeaux et utiliser l'application. Sois chaleureux, concis, et utilise un émoji de temps en temps. Ne parle que de Bloomday et des sujets liés (anniversaires, cadeaux, messages, célébrations).
```

### Quotas
| Profil | Limite |
|--------|--------|
| Visiteur non connecté | 3 messages par session |
| Compte gratuit | 10 messages par mois |
| Compte premium | Illimité |

Les quotas sont vérifiés côté client (localStorage pour visiteurs, Supabase pour comptes). La Netlify Function n'a pas accès au quota — la responsabilité de blocage est côté client.

### UI
- Bouton flottant 💬 fixe en bas à droite (z-index élevé)
- Visible sur `#land` (landing) ET dans l'app connectée
- Ouvre un drawer/modal de chat : historique de session, champ de saisie, bouton envoyer
- L'historique ne persiste pas entre sessions (mémoire locale uniquement)
- Sur mobile : drawer plein-écran. Sur desktop : bulle de 360px wide.

---

## Chantier 4 — Footer légal

### Contenu
4 liens dans un footer en bas de la landing page (`#land`) :
- **FAQ** — questions fréquentes sur Bloomday
- **Conditions d'utilisation** — CGU simplifiées
- **Politique de confidentialité** — RGPD
- **À propos** — histoire de Bloomday, mission, fondateur

### Design
- Fond sombre (dégradé `#1A0533 → #2D1B69`), cohérent avec le reste de la landing
- Liens en texte simple souligné, sans emojis, couleur `rgba(255,255,255,.55)`
- Copyright en bas : `© 2026 Bloomday · mybloomday.app`

### Comportement des liens
Chaque lien ouvre une **modale/drawer** par-dessus la page (pas de changement d'URL) :
- Sur mobile : drawer qui monte depuis le bas (`transform: translateY`)
- Sur desktop : modale centrée avec overlay sombre
- Fermeture : bouton ✕ ou clic sur l'overlay
- Animation : `transition: transform 0.3s ease`

### Contenu des pages légales
Rédigé directement dans `index.html` en HTML statique, en français. Chaque section est masquée par défaut et révélée par JS (`showLegal(type)`).

---

## Chantier 5 — Suggestions fleurs (affiliés)

### Déclencheur
Depuis la fiche d'un événement (anniversaire, etc.) : bouton "Idées cadeaux" visible si la date est dans les 7 prochains jours.

### Flux
1. Utilisateur clique "Idées cadeaux" sur la fiche de Marie
2. Modale s'ouvre avec 2-3 bouquets suggérés
3. Chaque bouquet : emoji fleur + nom + fourchette de prix + bouton "Voir →"
4. "Voir →" ouvre le lien affilié dans un nouvel onglet (`target="_blank"`)

### Sélection des bouquets
Dans cette version : **statique**. Les suggestions sont hardcodées dans `js/features.js` selon le type d'événement :
- Anniversaire → roses, bouquet mixte, tournesols
- Mariage → pivoines, orchidées, bouquet blanc
- Autre → bouquet mixte, plante verte, bouquet de saison

L'IA sera intégrée dans une version future pour personnaliser selon les notes du contact.

### Liens affiliés
- Placeholder pour l'instant (`#` en attendant l'inscription aux programmes Interflora / 1001Fleurs)
- ⚠️ **Action requise avant mise en prod :** s'inscrire aux programmes d'affiliation Interflora et 1001Fleurs, récupérer les liens de tracking, les intégrer dans `js/features.js`

### Rémunération
Commission de 5 à 15% sur chaque vente réalisée via un clic Bloomday. Paiement mensuel par virement via la plateforme d'affiliation.

---

## Chantier 6 — Panel Admin

### Accès
Réservé exclusivement au compte fondateur : `zekingfinance@gmail.com`. Détection via `user.email` après authentification Supabase. Aucun autre compte ne peut accéder au panel.

### Point d'entrée
- Un onglet "Admin" dans la sidebar desktop (visible uniquement si `isAdmin === true`)
- Sur mobile : accessible via un bouton discret dans le menu profil

### Sections

#### Dashboard statistiques
- Nombre total d'utilisateurs inscrits
- Nombre d'utilisateurs actifs (connectés dans les 30 derniers jours)
- Nombre de comptes premium
- Taux de conversion gratuit → premium
- Nombre de messages générés (total)
- Revenus estimés (nb premium × prix plan)

#### Liste des utilisateurs
- Tableau paginé : email, date d'inscription, plan, dernière activité
- Recherche par email
- Clic sur un utilisateur → voir ses données

#### Détail utilisateur
- Ses contacts (nom, date anniversaire, groupe)
- Ses événements à venir
- Son plan actuel
- Son historique de connexion

#### Notification broadcast
- Champ texte + bouton "Envoyer à tous"
- Affiche une bannière dans l'app pour tous les utilisateurs connectés
- Stockée en Supabase (`admin_notifications` table), lue au chargement de l'app

#### Navigation dans l'app
- Bouton "Naviguer comme utilisateur" → masque le panel admin et affiche l'app normale
- L'admin voit l'app exactement comme n'importe quel utilisateur
- Bouton retour "Revenir au panel" fixe en haut de l'écran

### Données
Toutes les requêtes admin utilisent la **service role key** Supabase (stockée en variable d'environnement Netlify, jamais côté client) via une Netlify Function dédiée (`/.netlify/functions/admin`). La fonction vérifie le token JWT de l'utilisateur et valide qu'il correspond bien à l'email admin avant d'exécuter la requête.

---

## Contraintes techniques

- Stack : Vanilla JS ES6+, CSS custom, HTML5 — pas de bundler
- Aucune dépendance npm côté frontend
- Toutes les strings visibles passent par `t('clé')` ou `data-i18n`
- Nouvelles clés i18n ajoutées dans les 7 langues (fr, en, es, ar, hi, zh, pt)
- Après chaque modification JS : `node --check js/<fichier>.js`
- Déploiement automatique via `git push origin main` → Netlify

## Ordre d'implémentation recommandé

1. OG fix (5 min, impact immédiat)
2. Footer légal (CSS + contenu)
3. Hero banner (CSS + photo)
4. Panel admin (Netlify Function + UI)
5. Chatbot IA (Netlify Function + UI)
6. Suggestions fleurs (UI + liens placeholder)
