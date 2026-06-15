// Auto-update: activate immediately when a new SW version is detected
self.addEventListener('install', function(event) {
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(clients.claim());
});

self.addEventListener('push', function(event) {
  if (!event.data) return;
  var data;
  try { data = event.data.json(); } catch(e) { return; }
  var title = data.title || 'Bloomday';
  var options = {
    body: data.body || '',
    icon: '/img/android-chrome-192x192.png',
    badge: '/img/android-chrome-192x192.png',
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
        if ('navigate' in client) return client.navigate(url).then(function(c){ if(c&&'focus' in c) c.focus(); });
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
