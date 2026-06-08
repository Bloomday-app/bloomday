---
name: team-form-member-name-phone
description: Permettre au membre de corriger son prénom/nom et d'ajouter son numéro de téléphone (indicatif pays séparé) dans le formulaire team-form
metadata:
  type: spec
---

# Spec — Correction nom + téléphone dans le formulaire membre

## Contexte

Quand un manager crée une équipe sur `team-form`, il saisit le prénom et le nom de chaque membre. Des fautes de frappe sont possibles. De plus, le numéro de téléphone n'est pas collecté à ce stade, alors qu'il sera nécessaire pour l'envoi de messages directs (SMS) dans une prochaine itération.

## Objectif

Permettre au membre, lorsqu'il remplit son formulaire, de :
1. Corriger son prénom et son nom de famille (pré-remplis avec les valeurs saisies par le manager)
2. Renseigner son numéro de téléphone avec un sélecteur d'indicatif pays (drapeau + code)

## Modèle de données

### Nouvelles colonnes dans `survey_members`

```sql
ALTER TABLE survey_members ADD COLUMN IF NOT EXISTS phone_code text;   -- ex: "+33"
ALTER TABLE survey_members ADD COLUMN IF NOT EXISTS phone_number text; -- ex: "612345678"
```

Les deux colonnes sont optionnelles (nullable). Le numéro de téléphone n'est pas obligatoire.

Migration : `supabase/migrations/20260608180000_tf_add_phone.sql`

### RPC `tf_submit_member_form` — nouveaux paramètres

Ajout de 4 paramètres :
- `p_first_name text` — prénom corrigé par le membre
- `p_last_name text` — nom corrigé par le membre
- `p_phone_code text` — indicatif pays (ex: `+33`), nullable
- `p_phone_number text` — numéro local (ex: `612345678`), nullable

L'UPDATE inclura désormais : `first_name = p_first_name`, `last_name = p_last_name`, `phone_code = p_phone_code`, `phone_number = p_phone_number`.

La migration de la RPC est incluse dans `20260608180000_tf_add_phone.sql`.

## Interface du formulaire membre

### Nouvelle section "Vos informations" en tête de formulaire

Insérée **avant** la date de naissance dans `tfRenderMemberForm()` :

```
┌─────────────────────────────────────────┐
│  Vos informations                       │
│                                         │
│  Prénom *                               │
│  [ Sarah___________________________ ]   │
│                                         │
│  Nom *                                  │
│  [ Dupont__________________________ ]   │
│                                         │
│  Téléphone (optionnel)                  │
│  [ 🇫🇷 +33 ▾ ] [ 6 12 34 56 78_____ ]  │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│  Date de naissance *                    │
│  [ Jour ] [ Mois ▾ ] [ Année ]          │
│  ... suite formulaire actuel ...        │
└─────────────────────────────────────────┘
```

### Champs

| ID HTML | Type | Pré-rempli | Obligatoire |
|---|---|---|---|
| `tf-inp-edit-first` | `input[type=text]` | `m.first_name` | Oui |
| `tf-inp-edit-last` | `input[type=text]` | `m.last_name` | Oui |
| `tf-phone-code` | `select` | `+33` (France par défaut) | Non |
| `tf-phone-number` | `input[type=tel]` | vide | Non |

### Sélecteur pays (indicatif téléphonique)

Un `<select id="tf-phone-code">` avec les pays les plus courants pour la base d'utilisateurs Bloomday (Europe, Afrique francophone, Amérique). Format des options : `🇫🇷 +33 — France`.

Liste indicative (non exhaustive) :
- 🇫🇷 +33 — France (défaut)
- 🇧🇪 +32 — Belgique
- 🇨🇭 +41 — Suisse
- 🇨🇦 +1 — Canada
- 🇬🇧 +44 — Royaume-Uni
- 🇩🇪 +49 — Allemagne
- 🇪🇸 +34 — Espagne
- 🇮🇹 +39 — Italie
- 🇵🇹 +351 — Portugal
- 🇲🇦 +212 — Maroc
- 🇩🇿 +213 — Algérie
- 🇹🇳 +216 — Tunisie
- 🇸🇳 +221 — Sénégal
- 🇨🇮 +225 — Côte d'Ivoire
- 🇨🇲 +237 — Cameroun
- 🇧🇷 +55 — Brésil
- 🇺🇸 +1 — États-Unis
- 🇲🇽 +52 — Mexique
- 🇮🇳 +91 — Inde
- 🇨🇳 +86 — Chine
- 🇯🇵 +81 — Japon

## Logique de soumission (`tfSubmitMember`)

### Validation ajoutée

```
firstName = trim(tf-inp-edit-first.value)
lastName  = trim(tf-inp-edit-last.value)
phoneCode   = tf-phone-code.value  (ex: "+33")
phoneNumber = trim(tf-phone-number.value)

Si firstName vide → alert(tfT('errorRequired'))
Si lastName vide  → alert(tfT('errorRequired'))
Si phoneNumber non vide ET phoneCode absent → alert(tfT('errorRequired'))
```

### Appel RPC étendu

```js
supabase.rpc('tf_submit_member_form', {
  p_member_token:  TF.memberToken,
  p_first_name:    firstName,
  p_last_name:     lastName,
  p_phone_code:    phoneNumber ? phoneCode : null,
  p_phone_number:  phoneNumber || null,
  p_birth_day:     birthDay,
  // ... paramètres existants inchangés
})
```

Après soumission réussie, `TF.currentMember.first_name` et `TF.currentMember.last_name` sont mis à jour en mémoire pour l'affichage de l'écran de confirmation.

## Import vers Bloomday

Dans les fonctions `tfImportMemberToBloomday` et `tfImportAllToBloomday`, le champ `phone` du contact devient :

```js
phone: ((m.phone_code || '') + (m.phone_number || '')).trim()
```

## i18n

Nouvelles clés à ajouter dans `team-form-i18n.js` (7 langues) :

| Clé | fr | en |
|---|---|---|
| `yourInfo` | "Vos informations" | "Your information" |
| `firstName` | "Prénom" | "First name" |
| `lastName` | "Nom" | "Last name" |
| `phone` | "Téléphone" | "Phone" |
| `phoneOptional` | "Téléphone (optionnel)" | "Phone (optional)" |

## Fichiers modifiés

| Fichier | Nature de la modification |
|---|---|
| `supabase/migrations/20260608180000_tf_add_phone.sql` | Nouvelle migration (colonnes + RPC) |
| `js/team-form-i18n.js` | Nouvelles clés i18n (7 langues) |
| `js/team-form.js` | `tfRenderMemberForm()` + `tfSubmitMember()` + import |

## Ce qui ne change pas

- Le formulaire d'administration (création d'équipe) reste identique
- Le dashboard admin reste identique
- La RPC `tf_get_member_form` n'a pas besoin d'être modifiée (`phone_code` et `phone_number` sont retournés automatiquement via `row_to_json` si les colonnes existent)
- La condition `AND completed = false` est maintenue pour empêcher la double soumission
