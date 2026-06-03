# Team Survey — Design Spec
Date: 2026-06-03

## Objectif

Permettre à un manager de créer un formulaire d'équipe pour collecter les informations personnelles (nom, prénom, date de naissance, genre, situation maritale) de chaque membre, puis d'importer ces données directement dans Bloomday.

---

## Architecture

### Hébergement

Une seule page HTML `team-form.html` hébergée sur `mybloomday.app` aux côtés de l'application Bloomday. La session Supabase est partagée (même domaine), ce qui permet la sync directe si le manager est connecté.

### Modes détectés via paramètres URL

| URL | Mode |
|-----|------|
| `team-form.html` | Création d'équipe (manager) |
| `team-form.html?admin=TOKEN` | Dashboard manager |
| `team-form.html?member=TOKEN` | Formulaire membre |

---

## Base de données (Supabase)

### Table `surveys`

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | uuid, PK | Identifiant unique |
| `token` | text, unique | Token admin (accès dashboard) |
| `team_name` | text | Nom de l'équipe |
| `relation_labels` | jsonb | Options de relation personnalisables |
| `invite_message` | text | Message d'invitation personnalisé |
| `manager_name` | text | Nom du manager (pour le message) |
| `created_at` | timestamp | Date de création |

### Table `survey_members`

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | uuid, PK | Identifiant unique |
| `survey_id` | uuid, FK → surveys | Équipe parente |
| `token` | text, unique | Token membre (accès fiche individuelle) |
| `first_name` | text | Prénom |
| `last_name` | text | Nom |
| `email` | text, nullable | Email (pour invitation) |
| `birth_day` | int, nullable | Jour de naissance (1-31) |
| `birth_month` | int, nullable | Mois de naissance (1-12) |
| `birth_year` | int, nullable | Année de naissance |
| `gender` | text, nullable | 'M' ou 'F' |
| `relation` | text, nullable | Valeur choisie parmi relation_labels |
| `married` | boolean | Est marié(e) |
| `spouse_name` | text, nullable | Prénom + Nom du/de la conjoint(e) |
| `wedding_day` | int, nullable | Jour anniversaire mariage (1-31) |
| `wedding_month` | int, nullable | Mois anniversaire mariage (1-12) |
| `wedding_year` | int, nullable | Année du mariage |
| `completed` | boolean | Fiche complétée par le membre |
| `completed_at` | timestamp, nullable | Date de complétion |

### Row Level Security (RLS)

- `surveys` : lecture par token admin uniquement
- `survey_members` : lecture par token membre ou token admin de l'équipe parente
- Insertions publiques autorisées (anon key) — pas d'auth requise pour remplir sa fiche

---

## Champ "Relation" — Personnalisable

### Valeurs par défaut

- Collègue
- Manager
- Directeur / Directrice
- Stagiaire
- Ami(e)
- Autre

### Comportement

Le manager peut depuis le dashboard :
- Renommer chaque option
- Ajouter de nouvelles options
- Supprimer des options inutilisées

Ces labels sont stockés dans `surveys.relation_labels` (tableau JSON de strings). Toute modification se répercute immédiatement sur les formulaires membres en cours.

---

## Flows

### Flow 1 — Création d'équipe (manager)

1. Manager ouvre `team-form.html`
2. Saisit le nom de l'équipe et son propre prénom
3. Configure les options de relation (peut utiliser les valeurs par défaut)
4. Personnalise le message d'invitation (champ pré-rempli avec texte par défaut)
5. Ajoute les membres un par un :
   - Prénom, Nom (obligatoires)
   - Email (optionnel — nécessaire pour invitation par email)
   - Relation (sélection parmi les options configurées)
6. Valide → système génère :
   - Un token admin unique (URL dashboard)
   - Un token membre unique par personne (URL fiche individuelle)
7. Redirige vers le dashboard manager

### Flow 2 — Dashboard manager

- Vue d'ensemble de l'équipe avec statut par membre (✅ Complété / ⏳ En attente)
- Pour chaque membre, 4 options de partage :
  - **Email** — envoi via Netlify function `send-email` existante
  - **WhatsApp** — ouvre `wa.me` avec message pré-rédigé + lien
  - **SMS** — ouvre `sms:` avec message pré-rédigé + lien
  - **Copier** — copie lien + message dans le presse-papiers
- Bouton **QR Code** par membre (génération client-side, imprimable)
- Bouton **"Importer dans Bloomday"** (actif quand ≥1 membre complété)
- Bouton **"Exporter CSV"** (fallback si non connecté à Bloomday)
- Bouton **Renvoyer l'invitation** pour les membres non complétés

### Flow 3 — Formulaire membre

1. Membre ouvre son lien personnalisé (`?member=TOKEN`)
2. Page pré-remplie avec son prénom/nom et la relation définie par le manager
3. Remplit les champs manquants :
   - Date de naissance (jour, mois, année)
   - Genre (Homme / Femme)
   - Marié(e) ? (toggle)
   - Si oui : prénom + nom du/de la conjoint(e) + date du mariage
4. Soumet → confirmation visuelle ("Merci [Prénom] !")
5. Le dashboard manager se met à jour en temps réel (Supabase realtime)

---

## Message d'invitation

### Texte par défaut (personnalisable par le manager)

> "Bonjour [Prénom] ! [Manager] t'invite à compléter ton profil pour l'équipe [Nom équipe]. Ça prend 2 minutes et ça permettra de ne jamais rater vos moments importants 🎂 👉 [LIEN]"

Les variables `[Prénom]`, `[Manager]`, `[Nom équipe]` et `[LIEN]` sont remplacées automatiquement à l'envoi.

---

## QR Codes

- Générés côté client avec la librairie `qrcode.min.js` (intégrée, pas de CDN externe)
- Un QR par membre, encode l'URL `?member=TOKEN`
- Vue "Imprimer tous les QR codes" : génère une page A4 avec tous les QR + prénom/nom
- Utile pour les réunions en présentiel

---

## Export CSV (compatible Bloomday)

Format attendu par `impCSV` dans `core.js` : `name,day,month[,year][,phone]`

Pour chaque membre complété, le CSV génère :
- **1 ligne anniversaire de naissance** : `"Prénom Nom",birth_day,birth_month,birth_year`
- **1 ligne anniversaire de mariage** (si marié) : `"Prénom Nom (mariage avec Conjoint)",wedding_day,wedding_month,wedding_year`

Note : le champ `relation` n'existe pas dans le format CSV Bloomday — il sera perdu lors d'un import CSV. La relation n'est préservée que via la sync directe (stockée dans le champ `note`).

---

## Sync directe Bloomday

Si le manager est connecté à Bloomday (session Supabase active sur `mybloomday.app`) :
- Le bouton "Importer dans Bloomday" est actif
- Le système récupère le `user_id` depuis la session Supabase
- Il crée (ou réutilise) un groupe Bloomday portant le nom de l'équipe
- Il écrit dans la table `members` de ce groupe
- Les événements créés : type `birthday` pour l'anniversaire de naissance + type `birthday` pour l'anniversaire de mariage (même table, entrée séparée)
- La relation est stockée dans le champ `note` du membre au format `"Relation: Collègue"`
- Un toast de confirmation s'affiche avec le nombre de contacts importés

Si le manager n'est pas connecté : seul l'export CSV est disponible.

---

## UI / Design

- Design cohérent avec Bloomday (variables CSS `--b2`, `--txt`, `--bg`, etc.)
- Mobile-first (formulaires membres remplis majoritairement sur téléphone)
- Wizard 3 étapes pour la création : Équipe → Membres → Partage
- Dashboard avec cards membres + indicateurs de progression (ex: "3/7 complétés")
- Animation de confirmation sur la fiche membre ("Merci [Prénom] ! 🎉")
- Formulaire membre sans menu, sans navigation — focus total sur la saisie

---

## Contraintes techniques

- Vanilla JS ES6+ (pas de bundler, cohérent avec la stack Bloomday)
- Pas de dépendances npm côté frontend — seule exception : `qrcode.min.js` embarqué
- Supabase client (`js/supabase-client.js`) réutilisé directement
- Toutes les strings visibles passent par un mini-dictionnaire i18n local (fr/en minimum)
- `node --check` requis après tout changement JS

---

## Hors scope

- Authentification des membres (pas de login requis pour remplir sa fiche)
- Notifications push pour les rappels (email suffisant)
- Historique des équipes passées (une seule équipe active par token)
- Édition de la fiche membre après soumission (contacter le manager pour corriger)
