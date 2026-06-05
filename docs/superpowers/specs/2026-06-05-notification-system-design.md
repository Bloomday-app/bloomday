# Système de notifications admin — Bloomday

**Date :** 2026-06-05
**Statut :** Approuvé

---

## Contexte

Bloomday a besoin d'un système permettant à l'admin d'envoyer des notifications aux utilisateurs (annonces, jalons, astuces, messages urgents). L'infrastructure partielle existe : une table `admin_notifications` et une fonction `checkAdminNotifications()` qui affiche un bandeau. Ce design étend et remplace ce système minimal.

---

## 1. Côté utilisateur

### 1.1 Icône cloche

- **Mobile :** bouton cloche ajouté dans `.tb-r` (topbar existante), à droite du badge plan `#tbplan`. Aucun autre élément topbar n'est modifié.
- **Desktop :** bouton cloche ajouté dans `.dsb-nav` (sidebar existante), même CSS que les autres `.dsb-btn`. Position : après le bouton Profil, avant le sélecteur de langue.
- **Badge rouge :** point rouge `9px` superposé en haut à droite de la cloche. Affiché si `count(notifications non lues) > 0`. Masqué sinon.

### 1.2 Dropdown historique (notifications normales)

Déclenché par clic sur la cloche. Overlay positionné sous la cloche (mobile) ou dans le panel principal (desktop).

Contenu :
- En-tête : "Notifications" + bouton "Tout marquer lu"
- Liste scrollable, ordre antéchronologique
- Notification non lue : fond `--b1l`, point orange à droite, texte plein
- Notification lue : opacité 0.6, pas de point
- Chaque notification : icône emoji + titre (bold) + corps (2 lignes max) + horodatage relatif ("il y a 2h", "il y a 3 jours")
- Fermeture : clic en dehors du dropdown

### 1.3 Modal critique (notifications urgentes)

Déclenché automatiquement à l'ouverture de l'app si une notification non lue de type `critical` existe.

- Modal centré, fond semi-transparent
- Icône grande + titre (Playfair Display) + corps
- Bouton "J'ai compris" → marque comme lue + ferme le modal
- L'utilisateur ne peut pas ignorer sans cliquer

### 1.4 Livraison

- **Push activé :** notification web push envoyée via le service worker existant (`js/features.js` → `pushManager`). **Note MVP :** le push part à tous les abonnés sans distinction de plan — le ciblage Free/Premium/Personne s'applique uniquement à l'affichage in-app (la notification apparaît dans le dropdown/modal uniquement pour les utilisateurs ciblés).
- **Push non activé :** badge cloche + dropdown à la prochaine ouverture de l'app

### 1.5 État "lu"

- Stocké en Supabase : table `user_notification_reads(user_id, notification_id, read_at)`
- Lu = l'utilisateur a ouvert le dropdown (pour les annonces) ou cliqué "J'ai compris" (pour les critiques)
- Chargé à l'init de l'app, mis à jour en temps réel

---

## 2. Côté admin

### 2.1 Emplacement

Section existante `#s-admin` dans `index.html`. Le contenu actuel (stats, liste utilisateurs, textarea simple) est conservé. Le nouveau bloc "Notifications" remplace uniquement la textarea `#admin-notif-text` et son bouton.

### 2.2 Composer

Champs :
| Champ | Options |
|---|---|
| Destinataires | Tous / Plan Free / Plan Premium / Personne spécifique (input email) |
| Type | Annonce (dropdown normal) / Urgent (modal forcé) |
| Titre | Input texte, max 80 chars |
| Message | Textarea, max 500 chars |

Bouton "Envoyer la notification →" : gradient `--grad`, désactivé si titre ou message vide.

### 2.3 Suggestions IA

- 3 suggestions générées via `/.netlify/functions/chat` (Claude API existante)
- Contexte envoyé : nombre d'utilisateurs, mois actuel, dernières features déployées
- Catégories : Jalon (tag or), Saison (tag vert), Astuce (tag saumon)
- Chaque suggestion : titre + corps + bouton "Modifier" (charge dans le composer) + bouton "Envoyer →" (envoie directement à tous)
- Bouton "↻ Nouvelles idées" : régénère les 3 suggestions

---

## 3. Modèle de données

### 3.1 Table `admin_notifications` — colonnes ajoutées

```sql
ALTER TABLE admin_notifications
  ADD COLUMN title        text,
  ADD COLUMN type         text NOT NULL DEFAULT 'announce', -- 'announce' | 'critical'
  ADD COLUMN target_type  text NOT NULL DEFAULT 'all',     -- 'all' | 'free' | 'premium' | 'user'
  ADD COLUMN target_uid   uuid;                            -- non-null si target_type = 'user'
```

Colonnes existantes conservées : `id`, `message`, `active`, `created_at`.

### 3.2 Nouvelle table `user_notification_reads`

```sql
CREATE TABLE user_notification_reads (
  user_id         uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_id uuid REFERENCES admin_notifications(id) ON DELETE CASCADE,
  read_at         timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, notification_id)
);
```

RLS : un utilisateur ne peut lire/écrire que ses propres lignes.

### 3.3 Fonction admin mise à jour

La fonction Netlify `admin.js`, action `notify`, accepte maintenant :
```json
{
  "action": "notify",
  "title": "string",
  "message": "string",
  "type": "announce | critical",
  "target_type": "all | free | premium | user",
  "target_uid": "uuid | null"
}
```

---

## 4. Flux de données

```
Admin envoie → netlify/functions/admin (action: notify)
  → INSERT admin_notifications
  → [si push] déclenche web push via VAPID vers les abonnés ciblés

User ouvre l'app → checkAdminNotifications()
  → SELECT admin_notifications WHERE active=true AND (target = user)
  → LEFT JOIN user_notification_reads → filtre non-lues
  → Si critique non lue → modal
  → Sinon → badge cloche si count > 0
```

---

## 5. Périmètre (hors scope)

- Réponse utilisateur vers l'admin (le support existant gère ça)
- Notifications récurrentes / schedulées
- Rich media dans les notifications (images, CTA avec lien)
- Analytics de lecture (taux d'ouverture, etc.)

---

## 6. Fichiers impactés

| Fichier | Changement |
|---|---|
| `index.html` | Ajout cloche dans `.tb-r` et `.dsb-nav` ; dropdown HTML ; modal critique HTML ; refonte bloc admin notif |
| `js/core.js` | `checkAdminNotifications()` étendu ; `openNotifDropdown()` ; `markNotifRead()` ; `adminSendNotif()` étendu |
| `js/i18n.js` | Nouvelles clés pour la cloche et les notifications |
| `netlify/functions/admin.js` | Action `notify` étendue avec ciblage et type |
| `supabase/migrations/` | Migration `user_notification_reads` + ALTER `admin_notifications` |
