# Système de notifications admin — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remplacer le bandeau notification rudimentaire par un système complet : cloche avec badge, historique dropdown, modal critique, et panel admin avec ciblage + suggestions IA.

**Architecture:** Les notifications sont stockées dans Supabase (`admin_notifications` étendue). Les lectures sont trackées dans `user_notification_reads`. L'admin envoie depuis un panel enrichi dans `#s-admin`. Les utilisateurs voient la cloche dans la topbar (mobile) et la sidebar (desktop). Le push serveur utilise `web-push` + les subscriptions déjà stockées dans `push_subscriptions`.

**Tech Stack:** Vanilla JS ES6+, Supabase JS SDK, Netlify Functions (Node.js), web-push npm, CSS custom variables Bloomday.

---

## Fichiers impactés

| Fichier | Rôle |
|---|---|
| `supabase/migrations/20260605120000_notification_system.sql` | Étend `admin_notifications`, crée `user_notification_reads` |
| `package.json` | Ajoute `web-push` |
| `netlify/functions/admin.js` | Action `notify` étendue + envoi push serveur |
| `js/i18n.js` | Nouvelles clés (7 langues) |
| `index.html` | Cloche HTML, dropdown, modal critique, nouveau panel admin |
| `js/core.js` | `checkAdminNotifications()` réécrit, `openNotifDropdown()`, `markAllNotifsRead()`, `showCriticalNotif()`, `closeCriticalNotif()`, `updateBellBadge()`, `adminSendNotif()` étendu, `adminLoadSuggestions()` |
| `css/app.css` | Styles cloche + badge |

---

## Task 1 : Migration Supabase

**Files:**
- Create: `supabase/migrations/20260605120000_notification_system.sql`

- [ ] **Créer le fichier de migration**

```sql
-- supabase/migrations/20260605120000_notification_system.sql

-- 1. Étendre admin_notifications
ALTER TABLE admin_notifications
  ADD COLUMN IF NOT EXISTS title        text,
  ADD COLUMN IF NOT EXISTS type         text NOT NULL DEFAULT 'announce',
  ADD COLUMN IF NOT EXISTS target_type  text NOT NULL DEFAULT 'all',
  ADD COLUMN IF NOT EXISTS target_uid   uuid;

-- 2. Créer user_notification_reads
CREATE TABLE IF NOT EXISTS user_notification_reads (
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_id uuid NOT NULL REFERENCES admin_notifications(id) ON DELETE CASCADE,
  read_at         timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, notification_id)
);

ALTER TABLE user_notification_reads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reads_own_select" ON user_notification_reads
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "reads_own_insert" ON user_notification_reads
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

- [ ] **Appliquer la migration**

```bash
npx supabase db push
```

Résultat attendu : `Migration applied successfully` (ou équivalent Supabase CLI). Vérifier dans le dashboard Supabase que la table `user_notification_reads` existe et que `admin_notifications` a les nouvelles colonnes.

- [ ] **Commit**

```bash
git add supabase/migrations/20260605120000_notification_system.sql
git commit -m "feat(db): étendre admin_notifications et créer user_notification_reads"
```

---

## Task 2 : Installer web-push + configurer VAPID

**Files:**
- Modify: `package.json`
- Netlify env var : `VAPID_PRIVATE_KEY` à ajouter dans le dashboard Netlify

- [ ] **Installer web-push**

```bash
npm install web-push
```

Vérifier que `package.json` contient maintenant `"web-push": "^X.X.X"` dans `dependencies`.

- [ ] **Générer les clés VAPID si la clé privée n'existe pas encore**

```bash
node -e "const wp=require('web-push');const k=wp.generateVAPIDKeys();console.log('PUBLIC:',k.publicKey);console.log('PRIVATE:',k.privateKey);"
```

La clé publique doit correspondre à `VAPID_PUBLIC_KEY` dans `js/features.js` (`BCNh1fxQGxaCta7...`). Si la clé privée n'a jamais été générée, regénérer la paire complète et mettre à jour `VAPID_PUBLIC_KEY` dans `js/features.js`.

- [ ] **Ajouter `VAPID_PRIVATE_KEY` dans Netlify**

Dans le dashboard Netlify → Site settings → Environment variables : ajouter `VAPID_PRIVATE_KEY` avec la clé privée correspondant à `VAPID_PUBLIC_KEY`.

- [ ] **Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: ajouter web-push pour les notifications push serveur"
```

---

## Task 3 : Clés i18n (7 langues)

**Files:**
- Modify: `js/i18n.js`

- [ ] **Vérifier la structure actuelle des clés admin**

```bash
grep -n "adminNotifTitle\|adminNotifBtn\|adminNotifSent" js/i18n.js | head -20
```

- [ ] **Ajouter les nouvelles clés dans chaque langue**

Dans `js/i18n.js`, dans chaque objet langue (`fr`, `en`, `es`, `ar`, `hi`, `zh`, `pt`), ajouter après les clés `adminNotif*` existantes :

```javascript
// Cloche utilisateur
navNotif: 'Notifs',
notifPanelTitle: 'Notifications',
notifMarkAllRead: 'Tout marquer lu',
notifEmpty: 'Aucune notification pour le moment',
notifCriticalAck: "J'ai compris ✓",

// Admin composer
adminNotifDestinataires: 'Destinataires',
adminNotifAll: 'Tous les utilisateurs',
adminNotifFree: 'Plan Free',
adminNotifPremium: 'Plan Premium',
adminNotifSpecific: 'Personne spécifique…',
adminNotifTypeLabel: 'Type de message',
adminNotifAnnounce: '📣 Annonce',
adminNotifCritical: '⚠️ Urgent',
adminNotifTitlePlaceholder: 'Titre — ex : Nouvelle fonctionnalité 🎉',
adminNotifMsgPlaceholder: 'Ton message…',
adminNotifSendBtn: 'Envoyer la notification →',
adminNotifSuggestions: 'Suggestions du moment ✨',
adminNotifRefresh: '↻ Nouvelles idées',
adminNotifModify: '✏️ Modifier',
adminNotifEmailPlaceholder: 'Email de l\'utilisateur…',
adminNotifSugLoading: 'Génération en cours…',
adminNotifSugError: 'Impossible de générer des suggestions.',
```

Traductions pour chaque langue :

**`en`:**
```javascript
navNotif: 'Notifs',
notifPanelTitle: 'Notifications',
notifMarkAllRead: 'Mark all read',
notifEmpty: 'No notifications yet',
notifCriticalAck: 'Got it ✓',
adminNotifDestinataires: 'Recipients',
adminNotifAll: 'All users',
adminNotifFree: 'Free plan',
adminNotifPremium: 'Premium plan',
adminNotifSpecific: 'Specific person…',
adminNotifTypeLabel: 'Message type',
adminNotifAnnounce: '📣 Announcement',
adminNotifCritical: '⚠️ Urgent',
adminNotifTitlePlaceholder: 'Title — e.g. New feature 🎉',
adminNotifMsgPlaceholder: 'Your message…',
adminNotifSendBtn: 'Send notification →',
adminNotifSuggestions: 'Suggested messages ✨',
adminNotifRefresh: '↻ New ideas',
adminNotifModify: '✏️ Edit',
adminNotifEmailPlaceholder: 'User email…',
adminNotifSugLoading: 'Generating…',
adminNotifSugError: 'Unable to generate suggestions.',
```

**`es`:**
```javascript
navNotif: 'Notifs',
notifPanelTitle: 'Notificaciones',
notifMarkAllRead: 'Marcar todo leído',
notifEmpty: 'Sin notificaciones por ahora',
notifCriticalAck: 'Entendido ✓',
adminNotifDestinataires: 'Destinatarios',
adminNotifAll: 'Todos los usuarios',
adminNotifFree: 'Plan Free',
adminNotifPremium: 'Plan Premium',
adminNotifSpecific: 'Persona específica…',
adminNotifTypeLabel: 'Tipo de mensaje',
adminNotifAnnounce: '📣 Anuncio',
adminNotifCritical: '⚠️ Urgente',
adminNotifTitlePlaceholder: 'Título — ej: Nueva función 🎉',
adminNotifMsgPlaceholder: 'Tu mensaje…',
adminNotifSendBtn: 'Enviar notificación →',
adminNotifSuggestions: 'Sugerencias ✨',
adminNotifRefresh: '↻ Nuevas ideas',
adminNotifModify: '✏️ Editar',
adminNotifEmailPlaceholder: 'Email del usuario…',
adminNotifSugLoading: 'Generando…',
adminNotifSugError: 'No se pudieron generar sugerencias.',
```

**`ar`:**
```javascript
navNotif: 'إشعارات',
notifPanelTitle: 'الإشعارات',
notifMarkAllRead: 'تحديد الكل كمقروء',
notifEmpty: 'لا توجد إشعارات حتى الآن',
notifCriticalAck: 'فهمت ✓',
adminNotifDestinataires: 'المستلمون',
adminNotifAll: 'جميع المستخدمين',
adminNotifFree: 'الخطة المجانية',
adminNotifPremium: 'الخطة المميزة',
adminNotifSpecific: 'شخص محدد…',
adminNotifTypeLabel: 'نوع الرسالة',
adminNotifAnnounce: '📣 إعلان',
adminNotifCritical: '⚠️ عاجل',
adminNotifTitlePlaceholder: 'العنوان…',
adminNotifMsgPlaceholder: 'رسالتك…',
adminNotifSendBtn: 'إرسال الإشعار →',
adminNotifSuggestions: 'اقتراحات ✨',
adminNotifRefresh: '↻ أفكار جديدة',
adminNotifModify: '✏️ تعديل',
adminNotifEmailPlaceholder: 'بريد المستخدم…',
adminNotifSugLoading: 'جارٍ الإنشاء…',
adminNotifSugError: 'تعذّر إنشاء الاقتراحات.',
```

**`hi`:**
```javascript
navNotif: 'सूचनाएं',
notifPanelTitle: 'सूचनाएं',
notifMarkAllRead: 'सभी को पढ़ा हुआ चिह्नित करें',
notifEmpty: 'अभी कोई सूचना नहीं',
notifCriticalAck: 'समझ गया ✓',
adminNotifDestinataires: 'प्राप्तकर्ता',
adminNotifAll: 'सभी उपयोगकर्ता',
adminNotifFree: 'फ्री प्लान',
adminNotifPremium: 'प्रीमियम प्लान',
adminNotifSpecific: 'विशिष्ट व्यक्ति…',
adminNotifTypeLabel: 'संदेश का प्रकार',
adminNotifAnnounce: '📣 घोषणा',
adminNotifCritical: '⚠️ अत्यावश्यक',
adminNotifTitlePlaceholder: 'शीर्षक…',
adminNotifMsgPlaceholder: 'आपका संदेश…',
adminNotifSendBtn: 'सूचना भेजें →',
adminNotifSuggestions: 'सुझाव ✨',
adminNotifRefresh: '↻ नए विचार',
adminNotifModify: '✏️ संपादित करें',
adminNotifEmailPlaceholder: 'उपयोगकर्ता का ईमेल…',
adminNotifSugLoading: 'बना रहे हैं…',
adminNotifSugError: 'सुझाव उत्पन्न करने में असमर्थ।',
```

**`zh`:**
```javascript
navNotif: '通知',
notifPanelTitle: '通知',
notifMarkAllRead: '全部标为已读',
notifEmpty: '暂无通知',
notifCriticalAck: '我知道了 ✓',
adminNotifDestinataires: '收件人',
adminNotifAll: '所有用户',
adminNotifFree: '免费计划',
adminNotifPremium: '高级计划',
adminNotifSpecific: '特定用户…',
adminNotifTypeLabel: '消息类型',
adminNotifAnnounce: '📣 公告',
adminNotifCritical: '⚠️ 紧急',
adminNotifTitlePlaceholder: '标题…',
adminNotifMsgPlaceholder: '您的消息…',
adminNotifSendBtn: '发送通知 →',
adminNotifSuggestions: '建议 ✨',
adminNotifRefresh: '↻ 新想法',
adminNotifModify: '✏️ 编辑',
adminNotifEmailPlaceholder: '用户邮箱…',
adminNotifSugLoading: '生成中…',
adminNotifSugError: '无法生成建议。',
```

**`pt`:**
```javascript
navNotif: 'Notifs',
notifPanelTitle: 'Notificações',
notifMarkAllRead: 'Marcar tudo como lido',
notifEmpty: 'Nenhuma notificação ainda',
notifCriticalAck: 'Entendido ✓',
adminNotifDestinataires: 'Destinatários',
adminNotifAll: 'Todos os usuários',
adminNotifFree: 'Plano Free',
adminNotifPremium: 'Plano Premium',
adminNotifSpecific: 'Pessoa específica…',
adminNotifTypeLabel: 'Tipo de mensagem',
adminNotifAnnounce: '📣 Anúncio',
adminNotifCritical: '⚠️ Urgente',
adminNotifTitlePlaceholder: 'Título — ex: Nova função 🎉',
adminNotifMsgPlaceholder: 'Sua mensagem…',
adminNotifSendBtn: 'Enviar notificação →',
adminNotifSuggestions: 'Sugestões ✨',
adminNotifRefresh: '↻ Novas ideias',
adminNotifModify: '✏️ Editar',
adminNotifEmailPlaceholder: 'Email do usuário…',
adminNotifSugLoading: 'Gerando…',
adminNotifSugError: 'Não foi possível gerar sugestões.',
```

- [ ] **Vérifier la syntaxe**

```bash
node --check js/i18n.js && echo "OK"
```

Résultat attendu : `OK`

- [ ] **Vérifier qu'aucune langue ne manque une clé**

```bash
/i18n-check
```

- [ ] **Commit**

```bash
git add js/i18n.js
git commit -m "feat(i18n): ajouter clés système de notifications (7 langues)"
```

---

## Task 4 : Cloche HTML — topbar mobile + sidebar desktop

**Files:**
- Modify: `index.html`

- [ ] **Ajouter la cloche dans `.tb-r` (topbar mobile)**

Localiser dans `index.html` (ligne ~269) :
```html
  <div class="tb-r">
    <div class="ptag" id="tbplan" onclick="openPlanModal()" style="display:none">Bloom ▾</div>
```

Ajouter le bouton cloche **à l'intérieur de `.tb-r`**, juste avant la fermeture `</div>` de `.tb-r` (avant le `</div>` de ligne ~274) :
```html
    <button id="tb-bell" onclick="openNotifDropdown()" style="display:none;position:relative;background:none;border:none;cursor:pointer;padding:4px;color:var(--txt2);line-height:1" aria-label="Notifications">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
      <span id="tb-bell-badge" style="display:none;position:absolute;top:0;right:0;width:9px;height:9px;background:#e74c3c;border-radius:50%;border:2px solid var(--card)"></span>
    </button>
```

- [ ] **Ajouter la cloche dans `.dsb-nav` (sidebar desktop)**

Localiser dans `index.html` (ligne ~236) le dernier bouton de nav dans `.dsb-nav` :
```html
    <button class="dsb-btn" id="dsb4" onclick="showSec('more',4)" title="Profil">
      ...
    </button>
  </nav>
```

Ajouter **avant `</nav>`** :
```html
    <button id="dsb-bell" class="dsb-btn" onclick="openNotifDropdown()" style="display:none;position:relative" title="Notifications">
      <svg viewBox="0 0 24 24" fill="none" width="18" height="18"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
      <span data-i18n="navNotif">Notifs</span>
      <span id="dsb-bell-badge" style="display:none;width:8px;height:8px;background:#e74c3c;border-radius:50%;margin-left:auto;flex-shrink:0;border:1.5px solid var(--dark)"></span>
    </button>
```

- [ ] **Vérifier manuellement**

Ouvrir `index.html` dans le navigateur → se connecter → vérifier que la cloche est invisible (car `display:none` — elle sera montrée par JS après login dans Task 8). Pas d'erreur console.

- [ ] **Commit**

```bash
git add index.html
git commit -m "feat(html): ajouter bouton cloche dans topbar mobile et sidebar desktop"
```

---

## Task 5 : Dropdown notification HTML

**Files:**
- Modify: `index.html`

- [ ] **Ajouter le dropdown après la fermeture de `.app-content`**

Localiser dans `index.html` (ligne ~365) :
```html
</div><!-- end app-content -->
```

Ajouter **après cette ligne** :
```html
<!-- Notification dropdown -->
<div id="notif-overlay" onclick="closeNotifDropdown()" style="display:none;position:fixed;inset:0;z-index:1500"></div>
<div id="notif-dropdown" style="display:none;position:fixed;z-index:1501;background:var(--card);border:1.5px solid var(--brd);border-radius:var(--rad);box-shadow:0 8px 32px rgba(45,27,20,.18);width:min(340px,calc(100vw - 32px));max-height:480px;overflow-y:auto">
  <div style="display:flex;justify-content:space-between;align-items:center;padding:14px 16px 10px;border-bottom:1px solid var(--brd);position:sticky;top:0;background:var(--card);z-index:1">
    <span style="font-family:'Playfair Display',serif;font-size:15px;font-weight:800;color:var(--txt)" data-i18n="notifPanelTitle">Notifications</span>
    <button onclick="markAllNotifsRead()" style="font-size:12px;color:var(--b1d);background:none;border:none;cursor:pointer;font-family:inherit;font-weight:600" data-i18n="notifMarkAllRead">Tout marquer lu</button>
  </div>
  <div id="notif-list" style="padding:4px 0"></div>
</div>
```

- [ ] **Vérifier la syntaxe HTML**

Ouvrir `index.html` dans le navigateur, vérifier pas d'erreur de parsing dans la console. Le dropdown est invisible (display:none).

- [ ] **Commit**

```bash
git add index.html
git commit -m "feat(html): ajouter dropdown de notifications"
```

---

## Task 6 : Modal critique HTML

**Files:**
- Modify: `index.html`

- [ ] **Ajouter le modal après le dropdown**

Ajouter dans `index.html` juste après le bloc `notif-dropdown` :
```html
<!-- Notification critique (modal) -->
<div id="notif-critical-ov" style="display:none;position:fixed;inset:0;background:rgba(45,27,20,.6);z-index:2100;align-items:center;justify-content:center;padding:20px">
  <div style="background:var(--card);border-radius:var(--rad);padding:28px 24px;max-width:380px;width:100%;text-align:center;box-shadow:0 8px 40px rgba(45,27,20,.25)">
    <div id="notif-critical-icon" style="font-size:40px;margin-bottom:12px">📣</div>
    <div id="notif-critical-title" style="font-family:'Playfair Display',serif;font-size:18px;font-weight:800;color:var(--txt);margin-bottom:10px"></div>
    <div id="notif-critical-body" style="font-size:14px;color:var(--txt2);line-height:1.6;margin-bottom:20px"></div>
    <button onclick="closeCriticalNotif()" style="width:100%;padding:14px;background:var(--grad);color:#fff;border:none;border-radius:var(--rad-sm);font-size:15px;font-weight:700;cursor:pointer;font-family:inherit" data-i18n="notifCriticalAck">J'ai compris ✓</button>
  </div>
</div>
```

- [ ] **Commit**

```bash
git add index.html
git commit -m "feat(html): ajouter modal pour notifications critiques"
```

---

## Task 7 : Refonte du panel admin notifications HTML

**Files:**
- Modify: `index.html`

- [ ] **Remplacer l'ancien bloc notification admin**

Localiser dans `index.html` (ligne ~356) :
```html
      <div class="sh" style="margin-top:20px;margin-bottom:8px" data-i18n="adminNotifTitle">Notification globale</div>
      <textarea id="admin-notif-text" class="inp" rows="3" style="width:100%;margin-bottom:8px" placeholder="Message à envoyer à tous…"></textarea>
      <button class="btn P fw" onclick="adminSendNotif()" data-i18n="adminNotifBtn">Envoyer à tous</button>
```

Remplacer par :
```html
      <div class="sh" style="margin-top:24px;margin-bottom:12px" data-i18n="adminNotifTitle">Notifications</div>

      <!-- Composer -->
      <div style="background:var(--card);border-radius:var(--rad);padding:16px;border:1px solid var(--brd);margin-bottom:16px">
        <div style="font-size:11px;font-weight:700;color:var(--txt3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px" data-i18n="adminNotifDestinataires">Destinataires</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px">
          <button class="admin-notif-pill on" data-target="all" onclick="adminNotifPickTarget(this)" data-i18n="adminNotifAll">Tous les utilisateurs</button>
          <button class="admin-notif-pill" data-target="free" onclick="adminNotifPickTarget(this)" data-i18n="adminNotifFree">Plan Free</button>
          <button class="admin-notif-pill" data-target="premium" onclick="adminNotifPickTarget(this)" data-i18n="adminNotifPremium">Plan Premium</button>
          <button class="admin-notif-pill" data-target="user" onclick="adminNotifPickTarget(this)" data-i18n="adminNotifSpecific">Personne spécifique…</button>
        </div>
        <div id="admin-notif-email-row" style="display:none;margin-bottom:10px">
          <input type="email" id="admin-notif-email" class="inp" style="width:100%" data-i18n-placeholder="adminNotifEmailPlaceholder" placeholder="Email de l'utilisateur…">
        </div>
        <div style="font-size:11px;font-weight:700;color:var(--txt3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px" data-i18n="adminNotifTypeLabel">Type de message</div>
        <div style="display:flex;gap:6px;margin-bottom:14px">
          <button class="admin-notif-type on" data-type="announce" onclick="adminNotifPickType(this)" data-i18n="adminNotifAnnounce">📣 Annonce</button>
          <button class="admin-notif-type" data-type="critical" onclick="adminNotifPickType(this)" data-i18n="adminNotifCritical">⚠️ Urgent</button>
        </div>
        <input type="text" id="admin-notif-title-inp" class="inp" style="width:100%;margin-bottom:8px" maxlength="80" data-i18n-placeholder="adminNotifTitlePlaceholder" placeholder="Titre — ex : Nouvelle fonctionnalité 🎉">
        <textarea id="admin-notif-text" class="inp" rows="3" style="width:100%;margin-bottom:12px" maxlength="500" data-i18n-placeholder="adminNotifMsgPlaceholder" placeholder="Ton message…"></textarea>
        <button class="btn P fw" onclick="adminSendNotif()" data-i18n="adminNotifSendBtn">Envoyer la notification →</button>
      </div>

      <!-- Suggestions IA -->
      <div style="background:var(--card);border-radius:var(--rad);padding:16px;border:1px solid var(--brd)">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <span style="font-size:11px;font-weight:700;color:var(--txt3);text-transform:uppercase;letter-spacing:.08em" data-i18n="adminNotifSuggestions">Suggestions du moment ✨</span>
          <button onclick="adminLoadSuggestions()" style="font-size:12px;color:var(--b1d);background:none;border:none;cursor:pointer;font-family:inherit;font-weight:600" data-i18n="adminNotifRefresh">↻ Nouvelles idées</button>
        </div>
        <div id="admin-notif-suggestions"></div>
      </div>
```

- [ ] **Ajouter les styles CSS pour les pills et types dans `css/app.css`**

Ajouter à la fin de `css/app.css` :
```css
/* ── ADMIN NOTIFICATION COMPOSER ── */
.admin-notif-pill{padding:6px 14px;border-radius:50px;font-size:13px;font-weight:600;cursor:pointer;border:1.5px solid var(--brd2);background:var(--bg);color:var(--txt2);font-family:'DM Sans',sans-serif;transition:all .15s}
.admin-notif-pill.on{background:var(--grad);color:#fff;border-color:transparent;box-shadow:0 2px 10px rgba(212,168,67,.25)}
.admin-notif-type{padding:7px 14px;border-radius:50px;font-size:13px;font-weight:600;cursor:pointer;border:1.5px solid var(--brd);background:var(--card);color:var(--txt2);font-family:'DM Sans',sans-serif;transition:all .15s}
.admin-notif-type.on[data-type="announce"]{background:var(--b1l);color:var(--b1d);border-color:var(--b1)}
.admin-notif-type.on[data-type="critical"]{background:var(--b2l);color:var(--b2d);border-color:var(--b2)}
```

- [ ] **Vérifier syntaxe CSS**

```bash
node --check js/core.js && echo "OK"
```

(pas de vérification CSS automatique — inspecter visuellement dans le navigateur)

- [ ] **Commit**

```bash
git add index.html css/app.css
git commit -m "feat(html): refonte panel admin notifications avec composer et suggestions"
```

---

## Task 8 : JS — checkAdminNotifications() + updateBellBadge() + modal critique

**Files:**
- Modify: `js/core.js`

- [ ] **Déclarer les variables globales**

Ajouter après la ligne `var _gcMenuGroupId = null;` (ligne ~348) dans `core.js` :
```javascript
var _adminNotifs = [];
var _adminNotifReads = new Set();
var _criticalNotifId = null;
var _adminSuggestions = [];
```

- [ ] **Réécrire `checkAdminNotifications()`**

Localiser dans `core.js` la fonction existante `checkAdminNotifications` (ligne ~757) et la remplacer intégralement par :
```javascript
async function checkAdminNotifications(){
  if(!window.currentUser)return;
  try{
    var uid=currentUser.uid;
    var r=await window._supabase.from('admin_notifications').select('*').eq('active',true).order('created_at',{ascending:false});
    if(!r.data||!r.data.length){updateBellBadge(0);return;}

    var rr=await window._supabase.from('user_notification_reads').select('notification_id').eq('user_id',uid);
    var readSet=new Set((rr.data||[]).map(function(x){return x.notification_id;}));
    _adminNotifReads=readSet;

    var userPlan=(window.stats&&window.stats.plan)||'free';
    var visible=r.data.filter(function(n){
      if(n.target_type==='all')return true;
      if(n.target_type==='free'&&userPlan==='free')return true;
      if(n.target_type==='premium'&&userPlan!=='free')return true;
      if(n.target_type==='user'&&n.target_uid===uid)return true;
      return false;
    });
    _adminNotifs=visible;

    var unread=visible.filter(function(n){return!readSet.has(n.id);});
    updateBellBadge(unread.length);

    var critical=unread.find(function(n){return n.type==='critical';});
    if(critical)showCriticalNotif(critical);
  }catch(e){}
}
```

- [ ] **Ajouter `updateBellBadge()`**

Ajouter juste après `checkAdminNotifications` :
```javascript
function updateBellBadge(count){
  var tbBell=document.getElementById('tb-bell');
  var dsbBell=document.getElementById('dsb-bell');
  var tbBadge=document.getElementById('tb-bell-badge');
  var dsbBadge=document.getElementById('dsb-bell-badge');
  if(tbBell)tbBell.style.display=window.currentUser?'flex':'none';
  if(dsbBell)dsbBell.style.display=window.currentUser?'flex':'none';
  if(tbBadge)tbBadge.style.display=count>0?'block':'none';
  if(dsbBadge)dsbBadge.style.display=count>0?'block':'none';
}
```

- [ ] **Ajouter `showCriticalNotif()` et `closeCriticalNotif()`**

Ajouter juste après `updateBellBadge` :
```javascript
function showCriticalNotif(notif){
  _criticalNotifId=notif.id;
  var ov=document.getElementById('notif-critical-ov');
  var titleEl=document.getElementById('notif-critical-title');
  var bodyEl=document.getElementById('notif-critical-body');
  if(!ov)return;
  if(titleEl)titleEl.textContent=notif.title||'';
  if(bodyEl)bodyEl.textContent=notif.message||'';
  ov.style.display='flex';
}
async function closeCriticalNotif(){
  var ov=document.getElementById('notif-critical-ov');
  if(ov)ov.style.display='none';
  if(_criticalNotifId&&window.currentUser){
    try{
      await window._supabase.from('user_notification_reads').upsert({user_id:currentUser.uid,notification_id:_criticalNotifId},{onConflict:'user_id,notification_id'});
      _adminNotifReads.add(_criticalNotifId);
    }catch(e){}
    _criticalNotifId=null;
    updateBellBadge(_adminNotifs.filter(function(n){return!_adminNotifReads.has(n.id);}).length);
  }
}
```

- [ ] **Vérifier la syntaxe**

```bash
node --check js/core.js && echo "OK"
```

- [ ] **Tester manuellement**

1. Ouvrir l'app, se connecter
2. Vérifier dans Supabase dashboard qu'il existe une notification active dans `admin_notifications`
3. Vérifier que la cloche apparaît dans la topbar (mobile) ou sidebar (desktop)
4. Si une notification existe non lue → badge rouge visible

- [ ] **Commit**

```bash
git add js/core.js
git commit -m "feat(js): checkAdminNotifications réécrit avec badge cloche et modal critique"
```

---

## Task 9 : JS — openNotifDropdown() + renderNotifList() + markAllNotifsRead()

**Files:**
- Modify: `js/core.js`

- [ ] **Ajouter `formatNotifAge()` helper**

Ajouter dans `core.js` après `closeCriticalNotif` :
```javascript
function formatNotifAge(isoDate){
  var diff=Date.now()-new Date(isoDate).getTime();
  var min=Math.floor(diff/60000);
  var h=Math.floor(min/60);
  var d=Math.floor(h/24);
  if(d>=7)return new Date(isoDate).toLocaleDateString();
  if(d>=1)return t('daysAgo')?t('daysAgo').replace('%n',d):'Il y a '+d+'j';
  if(h>=1)return 'Il y a '+h+'h';
  if(min>=1)return 'Il y a '+min+' min';
  return 'À l\'instant';
}
```

- [ ] **Ajouter `openNotifDropdown()`, `closeNotifDropdown()`, `renderNotifList()`**

Ajouter après `formatNotifAge` :
```javascript
function openNotifDropdown(){
  var dropdown=document.getElementById('notif-dropdown');
  var overlay=document.getElementById('notif-overlay');
  if(!dropdown||!overlay)return;
  var bell=document.getElementById('tb-bell')||document.getElementById('dsb-bell');
  if(bell){
    var rect=bell.getBoundingClientRect();
    var rightOffset=window.innerWidth-rect.right;
    dropdown.style.top=(rect.bottom+8)+'px';
    dropdown.style.right=Math.max(8,rightOffset)+'px';
    dropdown.style.left='auto';
  }
  renderNotifList();
  overlay.style.display='block';
  dropdown.style.display='block';
  markAllNotifsRead();
}
function closeNotifDropdown(){
  var d=document.getElementById('notif-dropdown');
  var o=document.getElementById('notif-overlay');
  if(d)d.style.display='none';
  if(o)o.style.display='none';
}
function renderNotifList(){
  var el=document.getElementById('notif-list');
  if(!el)return;
  if(!_adminNotifs.length){
    el.innerHTML='<div style="padding:24px 16px;text-align:center;color:var(--txt3);font-size:13px">'+t('notifEmpty')+'</div>';
    return;
  }
  el.innerHTML=_adminNotifs.map(function(n,i){
    var isRead=_adminNotifReads.has(n.id);
    var age=formatNotifAge(n.created_at);
    var sep=i<_adminNotifs.length-1?'<div style="height:1px;background:var(--brd);margin:0 16px"></div>':'';
    return '<div style="display:flex;gap:10px;align-items:flex-start;padding:12px 16px;'+(isRead?'opacity:.65':'background:var(--b1l)')+'">'+
      '<span style="font-size:18px;margin-top:1px">📣</span>'+
      '<div style="flex:1;min-width:0">'+
      '<div style="font-size:13px;font-weight:'+(isRead?'600':'700')+';color:var(--txt);margin-bottom:2px">'+esc(n.title||'')+'</div>'+
      '<div style="font-size:12px;color:var(--txt2);line-height:1.45;word-break:break-word">'+esc(n.message)+'</div>'+
      '<div style="font-size:11px;color:var(--txt3);margin-top:4px">'+age+'</div>'+
      '</div>'+
      (!isRead?'<span style="width:8px;height:8px;background:var(--b1);border-radius:50%;flex-shrink:0;margin-top:5px"></span>':'')+
      '</div>'+sep;
  }).join('');
}
async function markAllNotifsRead(){
  if(!window.currentUser||!_adminNotifs.length)return;
  var uid=currentUser.uid;
  var unread=_adminNotifs.filter(function(n){return!_adminNotifReads.has(n.id);});
  if(!unread.length)return;
  try{
    await window._supabase.from('user_notification_reads').upsert(
      unread.map(function(n){return{user_id:uid,notification_id:n.id};}),
      {onConflict:'user_id,notification_id'}
    );
    unread.forEach(function(n){_adminNotifReads.add(n.id);});
    updateBellBadge(0);
  }catch(e){}
}
```

- [ ] **Vérifier la syntaxe**

```bash
node --check js/core.js && echo "OK"
```

- [ ] **Tester manuellement**

1. Cliquer sur la cloche → dropdown s'ouvre avec la liste
2. Les non-lues ont fond clair + point orange
3. Cliquer à côté → dropdown se ferme
4. Après ouverture → badge disparaît (tout marqué lu)
5. Recharger → notifications restent "lues" (Supabase)

- [ ] **Commit**

```bash
git add js/core.js
git commit -m "feat(js): dropdown notifications avec historique et marquage lecture"
```

---

## Task 10 : JS — adminSendNotif() étendu + adminNotifPickTarget() + adminLoadSuggestions()

**Files:**
- Modify: `js/core.js`

- [ ] **Ajouter `adminNotifPickTarget()` et `adminNotifPickType()`**

Ajouter dans `core.js` après `markAllNotifsRead` :
```javascript
function adminNotifPickTarget(btn){
  document.querySelectorAll('.admin-notif-pill').forEach(function(b){b.classList.remove('on');});
  btn.classList.add('on');
  var emailRow=document.getElementById('admin-notif-email-row');
  if(emailRow)emailRow.style.display=btn.dataset.target==='user'?'block':'none';
}
function adminNotifPickType(btn){
  document.querySelectorAll('.admin-notif-type').forEach(function(b){b.classList.remove('on');});
  btn.classList.add('on');
}
```

- [ ] **Réécrire `adminSendNotif()`**

Localiser la fonction `adminSendNotif` existante dans `core.js` (ligne ~747) et la remplacer par :
```javascript
async function adminSendNotif(){
  var titleEl=document.getElementById('admin-notif-title-inp');
  var msgEl=document.getElementById('admin-notif-text');
  var title=(titleEl&&titleEl.value||'').trim();
  var msg=(msgEl&&msgEl.value||'').trim();
  if(!title||!msg){showToast(t('errorRequired')||'Titre et message requis');return;}

  var targetBtn=document.querySelector('.admin-notif-pill.on');
  var typeBtn=document.querySelector('.admin-notif-type.on');
  var targetType=(targetBtn&&targetBtn.dataset.target)||'all';
  var type=(typeBtn&&typeBtn.dataset.type)||'announce';

  var targetEmail=null;
  if(targetType==='user'){
    var emailEl=document.getElementById('admin-notif-email');
    targetEmail=(emailEl&&emailEl.value||'').trim();
    if(!targetEmail){showToast(t('errorRequired')||'Email requis');return;}
  }

  var sess=await window._supabase.auth.getSession();
  var token=sess&&sess.data&&sess.data.session&&sess.data.session.access_token;
  if(!token)return;

  var r=await fetch('/.netlify/functions/admin',{
    method:'POST',
    headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},
    body:JSON.stringify({action:'notify',title:title,message:msg,type:type,target_type:targetType,target_email:targetEmail})
  });
  var d=await r.json();
  if(d.ok){
    if(titleEl)titleEl.value='';
    if(msgEl)msgEl.value='';
    showToast(t('adminNotifSent')||'Notification envoyée !');
  }else{
    showToast(d.error||'Erreur');
  }
}
```

- [ ] **Ajouter `adminLoadSuggestions()`**

Ajouter juste après `adminSendNotif` :
```javascript
async function adminLoadSuggestions(){
  var el=document.getElementById('admin-notif-suggestions');
  if(!el)return;
  el.innerHTML='<div style="padding:12px;color:var(--txt2);font-size:13px" data-i18n="adminNotifSugLoading">Génération en cours…</div>';

  var totalEl=document.getElementById('stat-total');
  var userCount=totalEl?totalEl.textContent:'?';
  var month=new Date().toLocaleString('fr',{month:'long'});

  var prompt='Tu es assistant pour Bloomday, une app d\'anniversaires. Génère exactement 3 suggestions de notifications push pour les utilisateurs. Contexte : '+userCount+' utilisateurs, nous sommes en '+month+'. Format JSON strict : [{"tag":"jalon|saison|astuce","title":"...","body":"..."},{"tag":"...","title":"...","body":"..."},{"tag":"...","title":"...","body":"..."}]. Les messages doivent être chaleureux, personnels, max 120 chars pour body. Réponds uniquement avec le JSON.';

  try{
    var r=await fetch('/.netlify/functions/chat',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({message:prompt,history:[]})
    });
    var d=await r.json();
    var raw=d.reply||'';
    var match=raw.match(/\[[\s\S]*\]/);
    if(!match)throw new Error('bad json');
    var sugs=JSON.parse(match[0]);
    renderAdminSuggestions(sugs,el);
  }catch(e){
    el.innerHTML='<div style="padding:12px;color:var(--txt2);font-size:13px">'+t('adminNotifSugError')+'</div>';
  }
}
function renderAdminSuggestions(sugs,el){
  _adminSuggestions=sugs;
  var tagColors={jalon:'var(--b1l)|var(--b1d)',saison:'var(--b3l)|var(--b3)',astuce:'var(--b2l)|#8B2A1A'};
  el.innerHTML=sugs.map(function(s,i){
    var colors=(tagColors[s.tag]||'var(--bg2)|var(--txt2)').split('|');
    return '<div style="border:1.5px solid var(--brd);border-radius:var(--rad-sm);padding:14px 16px;margin-bottom:10px">'+
      '<div style="display:flex;gap:8px;align-items:flex-start;margin-bottom:6px">'+
      '<div style="font-size:14px;font-weight:700;color:var(--txt);flex:1;line-height:1.35">'+esc(s.title)+'</div>'+
      '<span style="font-size:10px;font-weight:700;padding:2px 9px;border-radius:10px;background:'+colors[0]+';color:'+colors[1]+';white-space:nowrap">'+esc(s.tag)+'</span>'+
      '</div>'+
      '<div style="font-size:13px;color:var(--txt2);line-height:1.5;margin-bottom:10px">'+esc(s.body)+'</div>'+
      '<div style="display:flex;gap:7px">'+
      '<button onclick="adminSugEdit('+i+')" style="flex:1;padding:8px;border:1.5px solid var(--brd2);border-radius:9px;font-size:12px;font-weight:600;color:var(--txt2);background:transparent;font-family:\'DM Sans\',sans-serif;cursor:pointer" data-i18n="adminNotifModify">✏️ Modifier</button>'+
      '<button onclick="adminSugSend('+i+')" style="flex:1;padding:8px;background:var(--grad);border:none;border-radius:9px;font-size:12px;font-weight:700;color:#fff;font-family:\'DM Sans\',sans-serif;cursor:pointer" data-i18n="adminNotifSendBtn">Envoyer →</button>'+
      '</div>'+
      '</div>';
  }).join('');
}
function adminSugEdit(i){
  var s=_adminSuggestions[i];
  if(!s)return;
  var titleEl=document.getElementById('admin-notif-title-inp');
  var msgEl=document.getElementById('admin-notif-text');
  if(titleEl)titleEl.value=s.title||'';
  if(msgEl)msgEl.value=s.body||'';
  titleEl.scrollIntoView({behavior:'smooth',block:'center'});
}
async function adminSugSend(i){
  var s=_adminSuggestions[i];
  if(!s)return;
  var sess=await window._supabase.auth.getSession();
  var token=sess&&sess.data&&sess.data.session&&sess.data.session.access_token;
  if(!token)return;
  var r=await fetch('/.netlify/functions/admin',{
    method:'POST',
    headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},
    body:JSON.stringify({action:'notify',title:s.title,message:s.body,type:'announce',target_type:'all',target_email:null})
  });
  var d=await r.json();
  if(d.ok)showToast(t('adminNotifSent')||'Notification envoyée !');
  else showToast(d.error||'Erreur');
}
```

- [ ] **Charger les suggestions à l'ouverture de la section admin**

Localiser dans `core.js` la fonction `rAdmin()` (ligne ~680) et ajouter à la fin :
```javascript
// charger suggestions IA
adminLoadSuggestions();
```

- [ ] **Vérifier la syntaxe**

```bash
node --check js/core.js && echo "OK"
```

- [ ] **Tester manuellement**

1. Aller dans le panel admin
2. Les suggestions IA apparaissent (peut prendre 2-3s)
3. Cliquer "Modifier" sur une suggestion → titre et message se pré-remplissent dans le composer
4. Choisir un ciblage et un type, envoyer → toast "Notification envoyée"
5. En tant qu'utilisateur normal → badge cloche + notification dans le dropdown

- [ ] **Commit**

```bash
git add js/core.js
git commit -m "feat(js): adminSendNotif étendu avec ciblage + suggestions IA Bloomday"
```

---

## Task 11 : Netlify Function — action notify étendue + push serveur

**Files:**
- Modify: `netlify/functions/admin.js`

- [ ] **Ajouter `web-push` et étendre l'action `notify`**

Ajouter en haut de `netlify/functions/admin.js`, après les `require` existants :
```javascript
const webpush = require('web-push');

webpush.setVapidDetails(
  'mailto:contact@mybloomday.app',
  'BCNh1fxQGxaCta7mIdYNO7YSjA3iRG5w6gpayFgMgr0gx8o_voP_jTy4nYMY4e2S9_yq32Z12KYRVYn5pXj-VqA',
  process.env.VAPID_PRIVATE_KEY || ''
);
```

Localiser le bloc `if (action === 'notify')` existant (ligne ~67) et le remplacer par :
```javascript
  if (action === 'notify') {
    const title = typeof body.title === 'string' ? body.title.slice(0, 80) : '';
    const message = typeof body.message === 'string' ? body.message.slice(0, 500) : '';
    const type = ['announce', 'critical'].includes(body.type) ? body.type : 'announce';
    const targetType = ['all', 'free', 'premium', 'user'].includes(body.target_type) ? body.target_type : 'all';
    let targetUid = null;
    if (targetType === 'user' && body.target_email) {
      const { data: { users }, error: ue } = await supabase.auth.admin.listUsers();
      const found = (users || []).find(u => u.email === body.target_email);
      if (!found) return err(404, 'User not found');
      targetUid = found.id;
    }

    if (!message) return err(400, 'Missing message');

    const { data: notif, error } = await supabase
      .from('admin_notifications')
      .insert({ title, message, type, target_type: targetType, target_uid: targetUid, active: true })
      .select('id')
      .single();
    if (error) return err(500, error.message);

    // Envoi push (MVP : tous les abonnés, ciblage in-app uniquement)
    if (process.env.VAPID_PRIVATE_KEY) {
      try {
        const { data: subs } = await supabase
          .from('push_subscriptions')
          .select('endpoint, p256dh, auth');
        const payload = JSON.stringify({ title: title || 'Bloomday', body: message });
        await Promise.allSettled((subs || []).map(sub =>
          webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            payload
          )
        ));
      } catch (pushErr) {
        console.warn('Push sending error:', pushErr.message);
      }
    }

    return { statusCode: 200, headers: CORS, body: JSON.stringify({ ok: true }) };
  }
```

- [ ] **Vérifier la syntaxe Node.js**

```bash
node --check netlify/functions/admin.js && echo "OK"
```

- [ ] **Tester en local avec `netlify dev`**

```bash
npm run netlify
```

Puis depuis l'app (connecté en admin) → envoyer une notification → vérifier dans Supabase que la ligne est insérée avec les bons champs `title`, `type`, `target_type`.

- [ ] **Commit**

```bash
git add netlify/functions/admin.js
git commit -m "feat(api): action notify étendue avec ciblage, type et push serveur web-push"
```

---

## Task 12 : Déploiement et vérification finale

- [ ] **Déployer**

```bash
git push origin main
```

Attendre le déploiement Netlify (~90s), puis :
```bash
curl -s -o /dev/null -w "%{http_code}" https://mybloomday.app
```
Résultat attendu : `200`

- [ ] **Test de bout en bout**

1. Ouvrir https://mybloomday.app en tant qu'admin
2. Aller dans Admin → panel Notifications
3. Vérifier que les suggestions IA se chargent
4. Envoyer une notification "Tous" type "Annonce"
5. Ouvrir une session utilisateur normale (autre navigateur/incognito)
6. Vérifier que le badge rouge apparaît sur la cloche
7. Cliquer la cloche → dropdown avec la notification
8. Vérifier que le badge disparaît après lecture
9. Recharger → notification toujours dans l'historique (lue, grisée)
10. Tester une notification "Urgent" → modal forcé à l'ouverture
