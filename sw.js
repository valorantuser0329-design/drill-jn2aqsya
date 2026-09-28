// オフライン用のプログラム（要件 F23、SEC9、詳細設計書 11.4）。ビルドが @@ で囲んだ部分を差し込み、dist/site/sw.js に書き出す。
// 扱うのは自分のサイトのファイルの GET だけ。外部のサイトへの通信には一切関わらない。
// 版: α0.4 内容: 3GLSiy3GhRdK
'use strict';

const CACHE = 'gkmd-α0.4-3GLSiy3GhRdK';
const FILES = ["./","index.html","manifest.webmanifest","icon-192.png","icon-512.png","apple-touch-icon.png"];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(FILES)));
  // すぐには切り替えず、ページから指示されるまで待つ（新しい版の知らせを出すため）
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('gkmd-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(
    caches.open(CACHE).then((cache) => {
      // アプリの入口（/ と index.html）へのページの要求だけを、保存したアプリで返す
      const entry = request.mode === 'navigate' && (url.pathname.endsWith('/') || url.pathname.endsWith('/index.html'));
      const key = entry ? './' : request;
      return cache.match(key, { ignoreSearch: true }).then((hit) => hit || fetch(request));
    }),
  );
});
