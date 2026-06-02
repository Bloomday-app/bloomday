# Push Notifications — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implémenter les push notifications réelles pour les rappels d'anniversaire : PWA manifest + service worker, demande de permission avec pre-prompt, réglages globaux + par contact, et Edge Function Supabase qui envoie les notifications chaque matin.

**Architecture:** Le frontend enregistre un service worker (`sw.js`) et souscrit aux push via `PushManager`. Les subscriptions et réglages sont stockés dans Supabase. Une Edge Function tourne en cron quotidien (7h UTC), lit les anniversaires imminents de chaque utilisateur selon ses réglages, et envoie les notifications via Web Push (VAPID). Le pre-prompt Bloomday apparaît après l'ajout du premier contact pour maximiser le taux d'acceptation.

**Tech Stack:** Web Push API, VAPID, Service Worker API, Supabase Edge Functions (Deno), npm:web-push, Supabase pg_cron, Vanilla JS ES6+.

---

### Task 1 : manifest.json et icônes PWA

**Files:**
- Create: `manifest.json`
- Create: `img/icon-192.png` (placeholder)
- Create: `img/icon-512.png` (placeholder)

- [ ] **Étape 1 : Créer `manifest.json` à la racine**

```json
{
  "name": "Bloomday",
  "short_name": "Bloomday",
  "description": "Rappels d'anniversaires et fêtes pour vos proches",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#FFF8F0",
  "theme_color": "#D4A843",
  "icons": [
    { "src": "/img/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable" },
    { "src": "/img/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ]
}
```

- [ ] **Étape 2 : Créer les icônes PNG**

Générer `img/icon-192.png` et `img/icon-512.png` à partir du logo Bloomday existant dans `img/`. Si un outil graphique n'est pas disponible, utiliser un script node pour créer des placeholders carrés à la couleur Bloomday :

```bash
# Vérifier les fichiers logo existants
ls img/
```

Si `img/logo.png` ou similaire existe, le redimensionner. Sinon, créer des fichiers SVG → PNG via le logo existant. Les icônes doivent exister pour que le manifest soit valide.

- [ ] **Étape 3 : Lier le manifest dans `index.html`**

Dans `<head>` de `index.html`, ajouter après `<meta charset="UTF-8">` :

```html
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#D4A843">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="Bloomday">
```

- [ ] **Étape 4 : Commit**

```bash
git add manifest.json img/icon-192.png img/icon-512.png index.html
git commit -m "feat(pwa): add manifest.json and PWA meta tags"
```

---

### Task 2 : Service worker `sw.js`

**Files:**
- Create: `sw.js`

- [ ] **Étape 1 : Créer `sw.js` à la racine du projet**

```js
self.addEventListener('push', function(event) {
  if (!event.data) return;
  var data = event.data.json();
  var title = data.title || 'Bloomday';
  var options = {
    body: data.body || '',
    icon: '/img/icon-192.png',
    badge: '/img/icon-192.png',
    data: data.data || {},
    vibrate: [200, 100, 200],
    tag: data.tag || 'bloomday-reminder'
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  var contactId = event.notification.data && event.notification.data.contactId;
  var url = contactId ? '/?contact=' + contactId : '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if ('focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
```

- [ ] **Étape 2 : Enregistrer le service worker dans `index.html`**

Trouver le dernier `<script>` dans `index.html` et ajouter APRÈS le bloc des scripts existants, juste avant `</body>` (mais avant les bottom sheets qu'on vient d'ajouter) :

```html
<script>
if('serviceWorker' in navigator){
  window.addEventListener('load', function(){
    navigator.serviceWorker.register('/sw.js').catch(function(e){console.warn('SW registration failed',e);});
  });
}
</script>
```

- [ ] **Étape 3 : Vérifier le service worker dans le navigateur**

Déployer sur Netlify (ou ouvrir via `index.html` en HTTPS local), puis dans Chrome DevTools → Application → Service Workers : vérifier que `sw.js` est enregistré et actif.

- [ ] **Étape 4 : Commit**

```bash
git add sw.js index.html
git commit -m "feat(pwa): service worker for push notifications"
```

---

### Task 3 : Migration Supabase — table `push_subscriptions`

**Files:**
- Create: `netlify/migrations/20260603_push_subscriptions.sql`

- [ ] **Étape 1 : Créer le fichier SQL de migration**

```sql
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, endpoint)
);

alter table public.push_subscriptions enable row level security;

create policy "users can manage own subscriptions"
  on public.push_subscriptions
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

- [ ] **Étape 2 : Exécuter dans Supabase Dashboard**

Aller dans Supabase Dashboard → SQL Editor → coller le contenu ci-dessus → Run.

- [ ] **Étape 3 : Vérifier la table**

Dans Supabase Dashboard → Table Editor : confirmer que `push_subscriptions` existe avec les colonnes `endpoint`, `p256dh`, `auth`.

- [ ] **Étape 4 : Commit**

```bash
git add netlify/migrations/20260603_push_subscriptions.sql
git commit -m "feat(notif): push_subscriptions table migration"
```

---

### Task 4 : Migration Supabase — `notification_settings` dans `profiles`

**Files:**
- Create: `netlify/migrations/20260603_notification_settings.sql`

- [ ] **Étape 1 : Créer le fichier SQL**

```sql
alter table public.profiles
  add column if not exists notification_settings jsonb default '{"enabled":false,"daysBefore":1,"time":"09:00","festivalsEnabled":false}'::jsonb;
```

- [ ] **Étape 2 : Exécuter dans Supabase Dashboard**

SQL Editor → coller → Run.

- [ ] **Étape 3 : Vérifier**

Dans Table Editor → `profiles` : confirmer que la colonne `notification_settings` existe avec la valeur par défaut.

- [ ] **Étape 4 : Commit**

```bash
git add netlify/migrations/20260603_notification_settings.sql
git commit -m "feat(notif): notification_settings column in profiles"
```

---

### Task 5 : Migration Supabase — colonnes `notif_days_before` et `notif_time` dans `members`

**Files:**
- Create: `netlify/migrations/20260603_members_notif_fields.sql`
- Modify: `js/db.js`

- [ ] **Étape 1 : Créer la migration SQL**

```sql
alter table public.members
  add column if not exists notif_days_before integer default null,
  add column if not exists notif_time text default null;
```

- [ ] **Étape 2 : Exécuter dans Supabase Dashboard → SQL Editor**

- [ ] **Étape 3 : Mettre à jour `dbSaveGroups` dans `db.js`**

Dans la boucle qui construit `mRows`, ajouter dans le `.push({...})` :

```js
notif_days_before: m.notif_days_before != null ? m.notif_days_before : null,
notif_time: m.notif_time || null,
```

Et dans `dbLoadGroups`, dans le `.map(m => ({...}))`, ajouter :

```js
notif_days_before: m.notif_days_before != null ? m.notif_days_before : null,
notif_time: m.notif_time || null,
```

- [ ] **Étape 4 : Vérifier la syntaxe**

```bash
node --check js/db.js
```

- [ ] **Étape 5 : Commit**

```bash
git add netlify/migrations/20260603_members_notif_fields.sql js/db.js
git commit -m "feat(notif): add notif_days_before and notif_time to members table"
```

---

### Task 6b : Clés i18n pour les notifications

**Files:**
- Modify: `js/i18n.js`

- [ ] **Étape 1 : Ajouter les clés en français**

Trouver une ligne dans le bloc `fr:` (par exemple après `importFinish`) et ajouter :

```js
notifPromptTitle:'Ne manquez plus un anniversaire',notifPromptBody:'Activez les rappels pour recevoir une notification le jour J — ou avant si vous préférez.',notifActivate:'Activer les rappels',notifLater:'Plus tard',notifGranted:'Notifications activées !',notifDenied:'Vous pourrez activer les rappels depuis les réglages.',notifSettingsTitle:'Notifications',notifDefault:'Réglage par défaut',notifEnabled:'Activer les rappels',notifEnabledSub:'Recevoir une notification pour chaque anniversaire',notifDaysLabel:'Délai de rappel',notifDaysJ:'Jour J',notifDays1:'1 jour avant',notifDays3:'3 jours avant',notifDays7:'1 semaine avant',notifTimeLabel:'Heure du rappel',notifFestivals:'Rappels de fêtes',notifFestivalsSub:'Saint-Valentin, Fête des mères…',notifCustomLabel:'Rappel personnalisé',notifUseDefault:'Utiliser le réglage par défaut',notifSaved:'Réglages sauvegardés',
```

- [ ] **Étape 2 : Ajouter les clés en anglais**

```js
notifPromptTitle:'Never miss a birthday',notifPromptBody:'Enable reminders to get a notification on the day — or a few days before if you prefer.',notifActivate:'Enable reminders',notifLater:'Later',notifGranted:'Notifications enabled!',notifDenied:'You can enable reminders from settings.',notifSettingsTitle:'Notifications',notifDefault:'Default setting',notifEnabled:'Enable reminders',notifEnabledSub:'Receive a notification for each birthday',notifDaysLabel:'Reminder delay',notifDaysJ:'Day of',notifDays1:'1 day before',notifDays3:'3 days before',notifDays7:'1 week before',notifTimeLabel:'Reminder time',notifFestivals:'Holiday reminders',notifFestivalsSub:"Valentine's Day, Mother's Day…",notifCustomLabel:'Custom reminder',notifUseDefault:'Use default setting',notifSaved:'Settings saved',
```

- [ ] **Étape 3 : Ajouter les clés en espagnol**

```js
notifPromptTitle:'No te pierdas ningún cumpleaños',notifPromptBody:'Activa los recordatorios para recibir una notificación el día J — o antes si lo prefieres.',notifActivate:'Activar recordatorios',notifLater:'Más tarde',notifGranted:'¡Notificaciones activadas!',notifDenied:'Puedes activar los recordatorios desde la configuración.',notifSettingsTitle:'Notificaciones',notifDefault:'Configuración por defecto',notifEnabled:'Activar recordatorios',notifEnabledSub:'Recibir una notificación por cada cumpleaños',notifDaysLabel:'Tiempo de anticipación',notifDaysJ:'El día J',notifDays1:'1 día antes',notifDays3:'3 días antes',notifDays7:'1 semana antes',notifTimeLabel:'Hora del recordatorio',notifFestivals:'Recordatorios de festividades',notifFestivalsSub:'San Valentín, Día de la Madre…',notifCustomLabel:'Recordatorio personalizado',notifUseDefault:'Usar configuración por defecto',notifSaved:'Configuración guardada',
```

- [ ] **Étape 4 : Ajouter les clés en arabe**

```js
notifPromptTitle:'لا تفوت أي عيد ميلاد',notifPromptBody:'فعّل التذكيرات لتلقي إشعار في يوم الميلاد — أو قبله إذا كنت تفضل ذلك.',notifActivate:'تفعيل التذكيرات',notifLater:'لاحقاً',notifGranted:'تم تفعيل الإشعارات!',notifDenied:'يمكنك ت��عيل التذكيرات من الإعدادات.',notifSettingsTitle:'الإشعارات',notifDefault:'الإعداد الافترا��ي',notifEnabled:'تفع��ل التذكير��ت',notifEnabledSub:'تلقي إشعار لكل عيد ميلاد',notifDaysLabel:'مهلة التذكير',notifDaysJ:'يوم الحدث',notifDays1:'قبل يوم واحد',notifDays3:'قبل 3 أيام',notifDays7:'قبل أسبوع',notifTimeLabel:'وقت التذكير',notifFestivals:'تذكيرات المناسبات',notifFestivalsSub:'عيد الحب، عيد الأم…',notifCustomLabel:'تذكير مخصص',notifUseDefault:'استخدام الإعداد الافتراضي',notifSaved:'تم حفظ الإعدادات',
```

- [ ] **Étape 5 : Ajouter les clés en hindi**

```js
notifPromptTitle:'कोई जन्मदिन न चूकें',notifPromptBody:'याद दिलाने के लिए रिमाइंडर चालू करें — जन्मदिन के दिन या पहले सूचना पाएं।',notifActivate:'रिमाइंड��� चालू करें',notifLater:'बाद में',notifGranted:'सूचनाएं चालू हो गईं!',notifDenied:'आप से��िंग्स से रिमाइंडर चालू कर सकते हैं।',notifSettingsTitle:'सूचनाएं',notifDefault:'डिफ़ॉल्ट सेटिंग',notifEnabled:'रिमाइंडर चालू करें',notifEnabledSub:'हर जन्मदिन के लिए सूचना पाएं',notifDaysLabel:'रिमाइंडर समय',notifDaysJ:'उसी दिन',notifDays1:'1 दिन पहले',notifDays3:'3 दिन पहले',notifDays7:'1 हफ्ते पहले',notifTimeLabel:'रिमाइंडर का समय',notifFestivals:'त्योहार रिमाइं��र',notifFestivalsSub:'वेलेंटाइन डे, मातृ दिवस…',notifCustomLabel:'कस्टम रिमा���ंडर',notifUseDefault:'डिफ़ॉल्ट सेटिंग उपयोग करें',notifSaved:'सेटिंग्स सहेजी गईं',
```

- [ ] **Étape 6 : Ajouter les clés en chinois**

```js
notifPromptTitle:'不再错过任何生日',notifPromptBody:'开启提醒，在生日当天或提前几天收到通知。',notifActivate:'开启提醒',notifLater:'稍后',notifGranted:'通知已开启！',notifDenied:'您可以在设置中开启提醒。',notifSettingsTitle:'通知',notifDefault:'默认设置',notifEnabled:'开启提醒',notifEnabledSub:'为每个生日接收通知',notifDaysLabel:'提醒时间',notifDaysJ:'当天',notifDays1:'提前1天',notifDays3:'提前3天',notifDays7:'提前1周',notifTimeLabel:'提醒时间',notifFestivals:'节日提醒',notifFestivalsSub:'情人��、母亲节…',notifCustomLabel:'自定义��醒',notifUseDefault:'使用默认设置',notifSaved:'设置已保存',
```

- [ ] **Étape 7 : Ajouter les clés en portugais**

```js
notifPromptTitle:'Nunca perca um aniversário',notifPromptBody:'Ative os lembretes para receber uma notificação no dia — ou antes, se preferir.',notifActivate:'Ativar lembretes',notifLater:'Mais tarde',notifGranted:'Notificações ativadas!',notifDenied:'Você pode ativar os lembretes nas configurações.',notifSettingsTitle:'Notificações',notifDefault:'Configuração padrão',notifEnabled:'Ativar lembretes',notifEnabledSub:'Receber uma notificação para cada aniversário',notifDaysLabel:'Antecedência do lembrete',notifDaysJ:'No dia',notifDays1:'1 dia antes',notifDays3:'3 dias antes',notifDays7:'1 semana antes',notifTimeLabel:'Horário do lembrete',notifFestivals:'Lembretes de datas comemorativas',notifFestivalsSub:'Dia dos Namorados, Dia das Mães…',notifCustomLabel:'Lembrete personalizado',notifUseDefault:'Usar configuração padrão',notifSaved:'Configurações salvas',
```

- [ ] **Étape 8 : Vérifier la syntaxe**

```bash
node --check js/i18n.js
```

- [ ] **Étape 9 : Commit**

```bash
git add js/i18n.js
git commit -m "feat(notif): i18n keys for push notifications (7 languages)"
```

---

### Task 6 : Pre-prompt HTML et logique de déclenchement

**Files:**
- Modify: `index.html`
- Modify: `js/core.js`
- Modify: `js/features.js`

- [ ] **Étape 1 : Ajouter le bottom sheet pre-prompt dans `index.html`**

Ajouter avant `</body>` (après les bottom sheets de l'import) :

```html
<!-- ── NOTIFICATION PRE-PROMPT ── -->
<div id="notif-prompt-overlay" style="display:none;position:fixed;inset:0;background:rgba(45,27,20,.35);z-index:300"></div>
<div id="notif-prompt-sheet" style="display:none;position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:440px;background:var(--card);border-radius:20px 20px 0 0;z-index:301;padding:0 16px 36px;text-align:center">
  <div style="width:36px;height:3px;background:var(--brd2);border-radius:2px;margin:12px auto 20px"></div>
  <div style="font-size:32px;margin-bottom:10px">🔔</div>
  <div style="font-family:'Playfair Display',serif;font-size:18px;font-weight:800;color:var(--txt);margin-bottom:8px" data-i18n="notifPromptTitle">Ne manquez plus un anniversaire</div>
  <div style="font-size:13px;color:var(--txt2);line-height:1.6;margin-bottom:20px;padding:0 8px" data-i18n="notifPromptBody">Activez les rappels pour recevoir une notification le jour J.</div>
  <button onclick="activateNotifications()" style="width:100%;padding:14px;border:none;border-radius:12px;background:var(--grad);color:#fff;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit;margin-bottom:8px" data-i18n="notifActivate">Activer les rappels</button>
  <button onclick="dismissNotifPrompt()" style="width:100%;padding:10px;background:transparent;border:none;font-size:13px;color:var(--txt2);cursor:pointer;font-family:inherit" data-i18n="notifLater">Plus tard</button>
</div>
```

- [ ] **Étape 2 : Ajouter le déclenchement dans `addMember()` dans `core.js`**

Dans `addMember()`, trouver la ligne `refresh();showSec('members',1);` et ajouter avant :

```js
  // Déclencher le pre-prompt notifications après le premier contact
  if(mems().length===1&&!localStorage.getItem('notif-prompt-shown')){
    setTimeout(showNotifPrompt,800);
  }
```

- [ ] **Étape 3 : Ajouter les fonctions de gestion du pre-prompt dans `js/features.js`**

Ajouter à la fin de `features.js` :

```js
function showNotifPrompt(){
  if(Notification.permission==='granted')return;
  var ov=document.getElementById('notif-prompt-overlay');
  var sh=document.getElementById('notif-prompt-sheet');
  if(ov)ov.style.display='block';
  if(sh)sh.style.display='block';
  applyI18n();
}
function dismissNotifPrompt(){
  var ov=document.getElementById('notif-prompt-overlay');
  var sh=document.getElementById('notif-prompt-sheet');
  if(ov)ov.style.display='none';
  if(sh)sh.style.display='none';
  localStorage.setItem('notif-prompt-shown','deferred');
}
async function activateNotifications(){
  dismissNotifPrompt();
  if(!('Notification' in window)||!('serviceWorker' in navigator)){
    showToast(t('notifDenied'));return;
  }
  var permission=await Notification.requestPermission();
  if(permission==='granted'){
    localStorage.setItem('notif-prompt-shown','granted');
    await subscribeToPush();
    showToast(t('notifGranted'));
    showSec('settings-notif',1);
  }else{
    localStorage.setItem('notif-prompt-shown','denied');
    showToast(t('notifDenied'));
  }
}
```

- [ ] **Étape 4 : Vérifier la syntaxe**

```bash
node --check js/core.js && node --check js/features.js
```

- [ ] **Étape 5 : Commit**

```bash
git add index.html js/core.js js/features.js
git commit -m "feat(notif): notification pre-prompt after first contact added"
```

---

### Task 7 : Abonnement Push et stockage Supabase

**Files:**
- Modify: `js/features.js`
- Modify: `js/db.js`

- [ ] **Étape 1 : Générer les clés VAPID**

Sur ton ordinateur (une seule fois) :

```bash
npx web-push generate-vapid-keys
```

Copier `Public Key` et `Private Key`. La Public Key va dans le code frontend. Les deux vont dans les secrets Supabase (Task 12).

- [ ] **Étape 2 : Ajouter `subscribeToPush()` dans `features.js`**

Remplacer la clé `VAPID_PUBLIC_KEY` par la clé publique générée à l'étape précédente :

```js
var VAPID_PUBLIC_KEY = 'REMPLACER_PAR_VOTRE_CLE_PUBLIQUE_VAPID';

function urlBase64ToUint8Array(base64String){
  var padding='='.repeat((4-base64String.length%4)%4);
  var base64=(base64String+padding).replace(/-/g,'+').replace(/_/g,'/');
  var rawData=window.atob(base64);
  var outputArray=new Uint8Array(rawData.length);
  for(var i=0;i<rawData.length;++i)outputArray[i]=rawData.charCodeAt(i);
  return outputArray;
}

async function subscribeToPush(){
  try{
    var reg=await navigator.serviceWorker.ready;
    var existing=await reg.pushManager.getSubscription();
    if(existing)await existing.unsubscribe();
    var sub=await reg.pushManager.subscribe({
      userVisibleOnly:true,
      applicationServerKey:urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    });
    var subJson=sub.toJSON();
    await savePushSubscription(subJson.endpoint,subJson.keys.p256dh,subJson.keys.auth);
  }catch(e){
    console.warn('Push subscription failed',e);
  }
}
```

- [ ] **Étape 3 : Ajouter `savePushSubscription()` dans `db.js`**

```js
async function savePushSubscription(endpoint, p256dh, auth){
  var user=window._supabase.auth.getUser&&(await window._supabase.auth.getUser()).data.user;
  if(!user)return;
  await window._supabase.from('push_subscriptions').upsert({
    user_id:user.id,
    endpoint:endpoint,
    p256dh:p256dh,
    auth:auth,
    updated_at:new Date().toISOString()
  },{onConflict:'user_id,endpoint'});
}

async function saveNotificationSettings(settings){
  var user=window._supabase.auth.getUser&&(await window._supabase.auth.getUser()).data.user;
  if(!user)return;
  await window._supabase.from('profiles').update({notification_settings:settings}).eq('id',user.id);
}

async function loadNotificationSettings(){
  var user=window._supabase.auth.getUser&&(await window._supabase.auth.getUser()).data.user;
  if(!user)return null;
  var r=await window._supabase.from('profiles').select('notification_settings').eq('id',user.id).single();
  return r.data&&r.data.notification_settings||{enabled:false,daysBefore:1,time:'09:00',festivalsEnabled:false};
}
```

- [ ] **Étape 4 : Vérifier la syntaxe**

```bash
node --check js/features.js && node --check js/db.js
```

- [ ] **Étape 5 : Commit**

```bash
git add js/features.js js/db.js
git commit -m "feat(notif): push subscription and Supabase storage"
```

---

### Task 8 : Écran de réglages des notifications

**Files:**
- Modify: `index.html`
- Modify: `js/render.js`
- Modify: `js/features.js`

- [ ] **Étape 1 : Ajouter la section réglages dans `index.html`**

Localiser les autres sections `<div id="s-*">` et ajouter une nouvelle section pour les réglages notifications :

```html
<!-- Section: réglages notifications -->
<div id="s-settings-notif" class="scr" style="padding:0">
  <div class="topbar">
    <button class="tb-btn" onclick="showSec('members',1)">‹</button>
    <div><div class="tb-t" data-i18n="notifSettingsTitle">Notifications</div></div>
    <div style="width:60px"></div>
  </div>
  <div class="scroll">
    <div id="notif-settings-body" style="padding:4px 0"></div>
  </div>
</div>
```

- [ ] **Étape 2 : Ajouter `renderNotifSettings()` dans `render.js`**

```js
async function renderNotifSettings(){
  var settings=await loadNotificationSettings()||{enabled:false,daysBefore:1,time:'09:00',festivalsEnabled:false};
  var body=document.getElementById('notif-settings-body');
  if(!body)return;
  var daysOpts=[{v:0,l:t('notifDaysJ')},{v:1,l:t('notifDays1')},{v:3,l:t('notifDays3')},{v:7,l:t('notifDays7')}];
  var h='';
  h+='<div style="font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--txt2);margin-bottom:8px">'+t('notifDefault')+'</div>';
  // Toggle activer
  h+='<div style="background:var(--card);border:1px solid var(--brd);border-radius:12px;padding:12px 14px;margin-bottom:8px;display:flex;align-items:center;justify-content:space-between">';
  h+='<div><div style="font-size:14px;font-weight:600;color:var(--txt)">'+t('notifEnabled')+'</div><div style="font-size:12px;color:var(--txt2);margin-top:2px">'+t('notifEnabledSub')+'</div></div>';
  h+='<label style="position:relative;display:inline-block;width:44px;height:24px;flex-shrink:0"><input type="checkbox" id="notif-toggle" '+(settings.enabled?'checked':'')+'style="opacity:0;width:0;height:0" onchange="onNotifToggle(this.checked)"><span style="position:absolute;cursor:pointer;inset:0;border-radius:24px;background:'+(settings.enabled?'var(--b3)':'var(--brd2)')+';transition:.2s"><span style="position:absolute;width:18px;height:18px;left:'+(settings.enabled?'22':'3')+'px;bottom:3px;background:#fff;border-radius:50%;transition:.2s"></span></span></label>';
  h+='</div>';
  // Délai
  h+='<div style="font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--txt2);margin-bottom:8px;margin-top:16px">'+t('notifDaysLabel')+'</div>';
  h+='<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px">';
  daysOpts.forEach(function(o){
    h+='<button onclick="onNotifDaysChange('+o.v+')" style="padding:7px 14px;border-radius:20px;border:1.5px solid '+(settings.daysBefore===o.v?'var(--b1)':'var(--brd)')+';background:'+(settings.daysBefore===o.v?'var(--b1l)':'var(--card)')+';color:'+(settings.daysBefore===o.v?'var(--b1d)':'var(--txt2)')+';font-size:13px;font-weight:600;cursor:pointer;font-family:inherit">'+o.l+'</button>';
  });
  h+='</div>';
  // Heure
  h+='<div style="font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--txt2);margin-bottom:8px">'+t('notifTimeLabel')+'</div>';
  h+='<div style="background:var(--card);border:1px solid var(--brd);border-radius:12px;padding:12px 14px;margin-bottom:16px;display:flex;align-items:center;justify-content:space-between">';
  h+='<div style="font-size:14px;font-weight:600;color:var(--txt)">'+t('notifTimeLabel')+'</div>';
  h+='<input type="time" id="notif-time-input" value="'+settings.time+'" onchange="onNotifTimeChange(this.value)" style="border:1px solid var(--brd);border-radius:8px;padding:5px 10px;font-size:14px;color:var(--txt);background:var(--bg2);font-family:inherit">';
  h+='</div>';
  body.innerHTML=h;
}
```

- [ ] **Étape 3 : Ajouter les handlers dans `features.js`**

```js
var _notifSettings={enabled:false,daysBefore:1,time:'09:00',festivalsEnabled:false};

async function onNotifToggle(checked){
  _notifSettings.enabled=checked;
  if(checked&&Notification.permission!=='granted'){
    await activateNotifications();
  }
  await saveNotificationSettings(_notifSettings);
}
async function onNotifDaysChange(days){
  _notifSettings.daysBefore=days;
  await saveNotificationSettings(_notifSettings);
  renderNotifSettings();
}
async function onNotifTimeChange(time){
  _notifSettings.time=time;
  await saveNotificationSettings(_notifSettings);
  showToast(t('notifSaved'));
}
```

- [ ] **Étape 4 : Ajouter le lien depuis le menu Réglages existant**

Chercher dans `index.html` ou `render.js` où le menu "Réglages" ou "Settings" est rendu, et ajouter un bouton :

```html
<button onclick="showSec('settings-notif',1);renderNotifSettings()" style="..." data-i18n="notifSettingsTitle">Notifications</button>
```

- [ ] **Étape 5 : Vérifier la syntaxe**

```bash
node --check js/render.js && node --check js/features.js
```

- [ ] **Étape 6 : Commit**

```bash
git add index.html js/render.js js/features.js
git commit -m "feat(notif): notification settings screen"
```

---

### Task 9 : Réglages de notification par contact

**Files:**
- Modify: `js/render.js`
- Modify: `js/core.js`

- [ ] **Étape 1 : Ajouter la section "Rappel personnalisé" dans le formulaire d'édition de membre**

Dans `rMembers()`, dans le bloc `isEd` (formulaire d'édition inline), trouver le bouton `saveEdit` et ajouter AVANT :

```js
    <div style="margin-top:12px;border-top:1px solid var(--brd);padding-top:12px">
    <div style="font-size:12px;font-weight:700;color:var(--txt2);margin-bottom:8px">'+t('notifCustomLabel')+'</div>
    <label style="display:flex;align-items:center;gap:8px;margin-bottom:8px;cursor:pointer">
      <input type="checkbox" id="notif-use-default-${p.id}" ${!p.notif_days_before&&p.notif_days_before!==0?'checked':''} onchange="toggleContactNotifDefault('${p.id}',this.checked)" style="width:16px;height:16px">
      <span style="font-size:13px;color:var(--txt2)">'+t('notifUseDefault')+'</span>
    </label>
    <div id="notif-contact-custom-${p.id}" style="display:${p.notif_days_before!=null?'block':'none'}">
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px">
        ${[{v:0,l:t('notifDaysJ')},{v:1,l:t('notifDays1')},{v:3,l:t('notifDays3')},{v:7,l:t('notifDays7')}].map(o=>`<button onclick="setContactNotifDays('${p.id}',${o.v})" style="padding:5px 12px;border-radius:16px;border:1.5px solid ${p.notif_days_before===o.v?'var(--b1)':'var(--brd)'};background:${p.notif_days_before===o.v?'var(--b1l)':'var(--card)'};color:${p.notif_days_before===o.v?'var(--b1d)':'var(--txt2)'};font-size:12px;font-weight:600;cursor:pointer;font-family:inherit">${o.l}</button>`).join('')}
      </div>
    </div>
    </div>
```

- [ ] **Étape 2 : Ajouter les handlers dans `core.js`**

```js
function toggleContactNotifDefault(id,useDefault){
  var m=mems(),p=m.find(function(x){return String(x.id)===String(id);});
  if(!p)return;
  var customDiv=document.getElementById('notif-contact-custom-'+id);
  if(useDefault){
    p.notif_days_before=null;p.notif_time=null;
    if(customDiv)customDiv.style.display='none';
  }else{
    p.notif_days_before=1;
    if(customDiv)customDiv.style.display='block';
  }
  setMems(m);saveG();
}
function setContactNotifDays(id,days){
  var m=mems(),p=m.find(function(x){return String(x.id)===String(id);});
  if(!p)return;
  p.notif_days_before=days;
  setMems(m);saveG();rMembers();
}
```

- [ ] **Étape 3 : Vérifier la syntaxe**

```bash
node --check js/core.js && node --check js/render.js
```

- [ ] **Étape 4 : Commit**

```bash
git add js/core.js js/render.js
git commit -m "feat(notif): per-contact notification settings in edit form"
```

---

### Task 10 : Edge Function Supabase — envoi quotidien

**Files:**
- Create: `netlify/functions/send-birthday-notifications/index.ts`

Note: La convention Supabase Edge Functions utilise le dossier `supabase/functions/`. Si ce dossier n'existe pas, le créer.

- [ ] **Étape 1 : Créer le dossier et le fichier**

```bash
mkdir -p supabase/functions/send-birthday-notifications
```

- [ ] **Étape 2 : Créer `supabase/functions/send-birthday-notifications/index.ts`**

```typescript
import webpush from "npm:web-push@3.6.7";

const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY") || "";
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY") || "";
const VAPID_EMAIL = Deno.env.get("VAPID_EMAIL") || "contact@mybloomday.app";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

webpush.setVapidDetails(`mailto:${VAPID_EMAIL}`, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

function getTodayDayMonth() {
  const now = new Date();
  return { day: now.getUTCDate(), month: now.getUTCMonth() + 1 };
}

function getBirthdayTargetDate(daysBefore: number): { day: number; month: number } {
  const target = new Date();
  target.setUTCDate(target.getUTCDate() + daysBefore);
  return { day: target.getUTCDate(), month: target.getUTCMonth() + 1 };
}

async function supabaseQuery(path: string, body?: unknown) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method: body ? "POST" : "GET",
    headers: {
      "apikey": SUPABASE_SERVICE_KEY,
      "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}`,
      "Content-Type": "application/json",
      "Prefer": "return=representation"
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

Deno.serve(async (_req) => {
  try {
    // 1. Récupérer toutes les subscriptions actives avec leurs réglages
    const subs = await supabaseQuery(
      "push_subscriptions?select=user_id,endpoint,p256dh,auth"
    );
    if (!Array.isArray(subs) || !subs.length) {
      return new Response(JSON.stringify({ sent: 0 }), { status: 200 });
    }

    // 2. Pour chaque utilisateur, récupérer profil + contacts
    let sent = 0;
    for (const sub of subs) {
      try {
        const profiles = await supabaseQuery(
          `profiles?id=eq.${sub.user_id}&select=notification_settings,id`
        );
        const profile = Array.isArray(profiles) && profiles[0];
        if (!profile) continue;
        const ns = profile.notification_settings || {};
        if (!ns.enabled) continue;
        const defaultDaysBefore = ns.daysBefore ?? 1;

        // 3. Récupérer les contacts de l'utilisateur via la table members
        const members = await supabaseQuery(
          `members?user_id=eq.${sub.user_id}&select=id,name,day,month,incomplete,notif_days_before`
        );
        if (!Array.isArray(members)) continue;

        // 4. Trouver les contacts à notifier aujourd'hui
        const typedMembers = members as Array<{id: string|number; name: string; day: number; month: number; incomplete?: boolean; notif_days_before?: number|null}>;
        for (const member of typedMembers) {
          if (member.incomplete || !member.day || !member.month) continue;
          const daysBefore = member.notif_days_before ?? defaultDaysBefore;
          const target = getBirthdayTargetDate(daysBefore);
          if (member.day === target.day && member.month === target.month) {
            const daysLabel = daysBefore === 0 ? "aujourd'hui" : `dans ${daysBefore} jour${daysBefore > 1 ? "s" : ""}`;
            const payload = JSON.stringify({
              title: `🎂 ${member.name}`,
              body: `Anniversaire ${daysLabel} !`,
              tag: `birthday-${member.id}`,
              data: { contactId: String(member.id) }
            });
            try {
              await webpush.sendNotification(
                { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
                payload
              );
              sent++;
            } catch (e: unknown) {
              // Subscription expirée — supprimer
              if (e && typeof e === "object" && "statusCode" in e && (e as {statusCode: number}).statusCode === 410) {
                await fetch(`${SUPABASE_URL}/rest/v1/push_subscriptions?user_id=eq.${sub.user_id}&endpoint=eq.${encodeURIComponent(sub.endpoint)}`, {
                  method: "DELETE",
                  headers: { "apikey": SUPABASE_SERVICE_KEY, "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}` }
                });
              }
            }
          }
        }
      } catch (e) {
        console.warn("Error processing subscription", sub.user_id, e);
      }
    }

    return new Response(JSON.stringify({ sent }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
});
```

- [ ] **Étape 3 : Commit**

```bash
git add supabase/functions/send-birthday-notifications/index.ts
git commit -m "feat(notif): Supabase Edge Function for daily birthday notifications"
```

---

### Task 11 : Configuration VAPID et déploiement Edge Function

**Files:**
- No code changes — configuration Supabase

- [ ] **Étape 1 : Configurer les secrets Supabase**

Dans Supabase Dashboard → Edge Functions → Secrets :

Ajouter :
- `VAPID_PUBLIC_KEY` = la clé publique générée en Task 7
- `VAPID_PRIVATE_KEY` = la clé privée générée en Task 7
- `VAPID_EMAIL` = `contact@mybloomday.app`

- [ ] **Étape 2 : Déployer la Edge Function**

```bash
# Si Supabase CLI installé :
supabase functions deploy send-birthday-notifications

# Vérifier que la fonction est listée :
supabase functions list
```

- [ ] **Étape 3 : Configurer le cron dans Supabase**

Dans Supabase Dashboard ��� Edge Functions → `send-birthday-notifications` → Schedule :

Cron expression : `0 7 * * *` (chaque jour à 7h UTC = 9h Paris)

Ou via SQL Editor :
```sql
select cron.schedule(
  'send-birthday-notifications',
  '0 7 * * *',
  $$
  select net.http_post(
    url:='https://<project-ref>.supabase.co/functions/v1/send-birthday-notifications',
    headers:='{"Authorization": "Bearer <anon-key>"}'::jsonb
  )
  $$
);
```

- [ ] **Étape 4 : Tester l'Edge Function manuellement**

```bash
supabase functions invoke send-birthday-notifications
```

Résultat attendu : `{"sent": N}` avec N ≥ 0.

- [ ] **Étape 5 : Commit final et déploiement**

```bash
git add .
git commit -m "feat(notif): complete push notification system - manifest, SW, settings, Edge Function"
```

Puis déployer sur Netlify :

```bash
git push origin main
```

---

### Vérification finale

- [ ] Sur mobile Android Chrome : ouvrir l'app, ajouter un premier contact → le pre-prompt s'affiche
- [ ] Accepter les notifications → la subscription est visible dans Supabase `push_subscriptions`
- [ ] Vérifier dans Réglages → Notifications que les réglages globaux se sauvegardent
- [ ] Invoquer l'Edge Function manuellement → les notifications arrivent sur le téléphone
- [ ] Sur iOS : tester l'installation PWA (Partager → Ajouter à l'écran d'accueil) puis la réception de push
