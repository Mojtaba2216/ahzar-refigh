self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('push',e=>{let d={title:'احضار رفیق',body:'پیام جدید داری',url:'./'};try{d={...d,...e.data.json()}}catch{}e.waitUntil(self.registration.showNotification(d.title,{body:d.body,icon:'icon.svg',badge:'icon.svg',tag:'ahzar-refigh',renotify:true,requireInteraction:true,silent:false,vibrate:[250,120,250,120,500],data:{url:d.url}}))});
self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(cs=>{for(const c of cs){if('focus' in c)return c.focus()}return clients.openWindow(e.notification.data?.url||'./')}))});
