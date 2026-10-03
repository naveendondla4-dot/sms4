const CACHE='naveen-student-manager-v1';
const ASSETS=['./','./index.html','./dashboard.html','./add_student.html','./edit_students.html','./analytics.html','./leaderboard.html','./register.html','./style.css','./script.js','./manifest.webmanifest','./images/app-icon.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(caches.match(e.request).then(c=>c||fetch(e.request).then(r=>{const x=r.clone();caches.open(CACHE).then(c=>c.put(e.request,x));return r}).catch(()=>caches.match('./index.html'))))});
