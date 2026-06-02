# Design — Import contacts téléphone & Push Notifications

**Date :** 2026-06-03  
**Statut :** Validé par l'utilisateur

---

## Périmètre

Deux features liées à l'expérience mobile :

1. **Import contacts téléphone** — amélioration du flow existant (Contact Picker API déjà en place) pour proposer import unitaire ou en masse avec guidance utilisateur.
2. **Push notifications** — infrastructure complète de rappels d'anniversaire : permission, réglages globaux + par contact, envoi serveur via Supabase Edge Function.

---

## Feature 1 — Import contacts téléphone

### Point d'entrée dynamique

Le bouton d'import s'adapte selon le nombre de contacts existants :

- **0 contact** : CTA proéminent centré sur la page principale, gradient Bloomday, texte "Importer mes contacts" bien visible.
- **≥ 1 contact** : petit bouton discret en haut de la liste (fond `--b4l`, texte `--b4d`), même libellé mais taille réduite.

Condition dans le code : `mems().length === 0`.

### Flow au tap — bottom sheet mix info + choix

Un bottom sheet s'ouvre (pas d'alert, pas de navigate) avec :

1. **Handle** de glissement en haut
2. **Titre** : "Importer un contact" (Playfair Display)
3. **Phrase de contexte** (texte naturel, pas de bannière) : "Vous pouvez sélectionner un contact précis ou en importer plusieurs d'un coup — vous compléterez les dates manquantes ensuite."
4. **Option A** (mise en valeur, fond `--b1l`, bordure `--b1`) : "Choisir un contact" — sélection unique, remplit le formulaire d'ajout
5. **Option B** (sobre, fond card) : "Importer plusieurs contacts" — sélection multiple, ouvre le récap post-import
6. **Bouton Annuler** (texte seul, `--txt2`)

### Option A — Contact unique

Comportement identique à l'actuel (`multiple: false`), mais déclenché depuis le bottom sheet. Ferme le sheet, pré-remplit `inp-name`, `inp-phone`, `inp-day`/`inp-month`/`inp-year` si la date de naissance est disponible dans le contact.

### Option B — Import en masse

`navigator.contacts.select(['name','tel','birthday'], { multiple: true })`

Après sélection, traitement de chaque contact :
- Si `birthday` présent et valide → créer le membre complet
- Si `birthday` absent ou invalide → créer le membre avec `day: null`, `month: null` (état "incomplet")

Les membres incomplets ne déclenchent pas de rappels jusqu'à complétion.

### Écran récap post-import

Affiché immédiatement après l'import en masse :

- **Banner d'information** (fond `--b1l`, bordure `--b1`) : "N contacts importés · X ont une date manquante — complétez-les pour recevoir leurs rappels."
- **Liste** de tous les contacts importés, chacun avec :
  - Avatar généré (dégradé Bloomday)
  - Nom
  - Statut : "✓ JJ mois" en `--b3` si complet, "Date manquante" en `--b2` si incomplet
  - Bouton "Compléter ›" (`--b1`) sur les lignes incomplètes — ouvre la fiche de ce contact en édition
- **Bouton "Terminer"** (gradient Bloomday) — revient à la liste principale

Les contacts incomplets apparaissent dans la liste principale avec un badge discret (point `--b2`) jusqu'à ce que la date soit ajoutée.

### Clé i18n à ajouter (7 langues)

`importChoiceTitle`, `importChoiceHint`, `importChoiceSingle`, `importChoiceMultiple`, `importRecapTitle`, `importRecapMissing`, `importComplete`, `importFinish`

### Contraintes techniques

- Feature détectée : `'contacts' in navigator && 'ContactsManager' in window` (déjà en place)
- Modifier `importFromContacts()` dans `core.js`
- Ajouter le bottom sheet en HTML dans `index.html` (pattern existant des modals)
- Membres incomplets : stocker `day: null`, `month: null` avec un flag `incomplete: true` — `null` est explicitement "absent", à distinguer de `0` qui serait une valeur invalide

---

## Feature 2 — Push Notifications

### Architecture technique

```
Frontend (PWA)
  └── sw.js (service worker) — reçoit les push events, affiche les notifications
  └── manifest.json — permet l'installation PWA

Supabase
  └── Table push_subscriptions (user_id, endpoint, p256dh, auth, created_at, updated_at)
  └── Colonne notification_settings dans profiles (JSON)
  └── Champs daysBefore + notifTime dans chaque membre (data.js + Supabase contacts)
  └── Edge Function "send-birthday-notifications" (cron quotidien 6h UTC)
      └── Lit les anniversaires du lendemain (ou J selon réglage)
      └── Envoie via Web Push API (VAPID)
      └── VAPID_PUBLIC_KEY + VAPID_PRIVATE_KEY en secrets Supabase
```

### Flow permission — déclenchement après le 1er contact ajouté

Après `addMember()` réussi, si `mems().length === 1` (premier contact) et que la permission notifications n'a jamais été demandée (`localStorage.getItem('notif-prompt-shown')` absent) :

1. **Pre-prompt Bloomday** (bottom sheet) :
   - Icône cloche, titre "Ne manquez plus un anniversaire"
   - Texte : "Activez les rappels pour recevoir une notification le jour J — ou avant si vous préférez."
   - Bouton primaire "Activer les rappels" → déclenche `Notification.requestPermission()`
   - Bouton secondaire "Plus tard" → ferme, `localStorage.setItem('notif-prompt-shown', 'deferred')`

2. **Prompt navigateur natif** — déclenché uniquement si l'utilisateur a validé le pre-prompt.

3. **Sur grant** : afficher l'écran de réglages rapides (délai + heure), enregistrer la subscription push (`PushManager.subscribe()`), sauvegarder en Supabase.

4. **Sur refus** : message gracieux "Vous pourrez activer les rappels depuis les réglages.", `localStorage.setItem('notif-prompt-shown', 'denied')`.

### Réglages notifications

**Accès** : depuis le menu Réglages → "Notifications"

**Réglages globaux (défaut pour tous les contacts) :**
- Toggle "Activer les rappels" (on/off)
- Délai : chips sélectionnables — "Jour J" / "1 jour avant" / "3 jours avant" / "1 semaine" (défaut : 1 jour)
- Heure : sélecteur natif `<input type="time">` (défaut : 09:00)
- Toggle "Rappels de fêtes du calendrier" (Saint-Valentin, Fête des mères…)

Stockage : `notification_settings` dans `profiles` Supabase :
```json
{ "enabled": true, "daysBefore": 1, "time": "09:00", "festivalsEnabled": false }
```

**Réglage par contact :**
- Accessible depuis la fiche de chaque contact
- Section "Rappel personnalisé" avec les mêmes chips + sélecteur d'heure
- Option "Utiliser le réglage par défaut" (pré-sélectionné)

Stockage : champs `notif_days_before` (int, nullable) et `notif_time` (string, nullable) dans l'objet membre. `null` = utiliser le défaut global.

### Edge Function — logique d'envoi

Cron : `0 7 * * *` (7h UTC = 9h Paris — heure fixe pour la v1, timezone par utilisateur reportée en v2)

Algorithme :
1. Récupérer tous les utilisateurs avec `notification_settings.enabled = true` et une `push_subscription` valide.
2. Pour chaque utilisateur, calculer la date cible de chaque contact (date anniversaire − `daysBefore` jours, avec fallback sur le défaut global si `notif_days_before` est `null`).
3. Envoyer pour tous les contacts dont la date cible = aujourd'hui.
4. Payload push : `{ title: "🎂 Marie Leclerc", body: "Anniversaire dans 1 jour !", data: { contactId } }`
5. En cas d'erreur 410 (subscription expirée) → supprimer la ligne de `push_subscriptions`.

### Service worker

Fichier `sw.js` à la racine du projet :
- Écoute `push` event → `self.registration.showNotification(title, options)`
- Écoute `notificationclick` → ouvre l'app sur la fiche du contact (`data.contactId`)
- Pas de cache stratégie pour l'instant (hors scope)

### manifest.json

Minimal, requis pour l'installation PWA et les push :
```json
{
  "name": "Bloomday",
  "short_name": "Bloomday",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#FFF8F0",
  "theme_color": "#D4A843",
  "icons": [{ "src": "/img/icon-192.png", "sizes": "192x192", "type": "image/png" },
             { "src": "/img/icon-512.png", "sizes": "512x512", "type": "image/png" }]
}
```

Icônes à créer : 192×192 et 512×512 px depuis le logo existant.

### Clés i18n à ajouter (7 langues)

`notifPromptTitle`, `notifPromptBody`, `notifActivate`, `notifLater`, `notifGranted`, `notifDenied`, `notifSettingsTitle`, `notifDefault`, `notifDaysJ`, `notifDays1`, `notifDays3`, `notifDays7`, `notifTime`, `notifFestivals`, `notifCustom`, `notifUseDefault`

---

## Hors scope (décisions explicites)

- Notifications email : déjà partiellement en place, non modifié dans ce chantier
- Cache stratégie service worker : ajouté séparément si besoin
- Notifications pour les fêtes nationales : toggle prévu mais logique d'envoi reportée

---

## Fichiers impactés

| Fichier | Modification |
|---|---|
| `js/core.js` | `importFromContacts()` refactorisé, logique post-import, trigger pre-prompt |
| `js/render.js` | Bottom sheet import, écran récap, réglages notifications |
| `js/features.js` | Abonnement push, `PushManager.subscribe()`, sauvegarde subscription Supabase |
| `js/db.js` | Lecture/écriture `notification_settings` dans `profiles`, champs `notif_*` dans contacts |
| `js/i18n.js` | Nouvelles clés (7 langues) |
| `index.html` | HTML des bottom sheets, lien manifest, enregistrement SW |
| `sw.js` | Nouveau fichier — service worker |
| `manifest.json` | Nouveau fichier |
| `img/icon-192.png` | Nouveau fichier |
| `img/icon-512.png` | Nouveau fichier |
| Supabase migration | Table `push_subscriptions`, colonne `notification_settings` dans `profiles` |
| Supabase Edge Function | `send-birthday-notifications` (nouveau) |
