// DisplayFlow — Service Worker para Cache Offline da TV
const CACHE_NAME = 'df-media-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/src/main.jsx',
  '/src/index.css',
  '/favicon.svg'
];

// Instalação do Service Worker e pré-cache de assets básicos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('Falha parcial no pré-cache do Service Worker:', err);
      });
    })
  );
  self.skipWaiting();
});

// Ativação e limpeza de versões antigas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Estratégia de Interceptação: Cache-First com Fallback de Rede para Mídia
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Intercepta imagens e arquivos estáticos (ImgBB, CDNs, URLs diretas)
  const isImageOrMedia =
    request.destination === 'image' ||
    /\.(jpg|jpeg|png|webp|gif|svg|mp4)$/i.test(url.pathname) ||
    url.hostname.includes('ibb.co') ||
    url.hostname.includes('imgbb.com');

  if (isImageOrMedia) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
          // Retorna do cache imediatamente e atualiza em segundo plano (Stale-While-Revalidate)
          fetch(request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
          }).catch(() => {/* Offline silente */});
          return cachedResponse;
        }

        // Se não tiver em cache, busca na rede e salva
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(() => {
          // Se falhou e não tem na cache, retorna erro limpo
          return new Response('Offline: mídia não disponível no momento', { status: 503 });
        });
      })
    );
    return;
  }

  // Requisições normais de navegação: Network com fallback em cache
  event.respondWith(
    fetch(request).catch(async () => {
      const cached = await caches.match(request);
      if (cached) return cached;
      if (request.mode === 'navigate') {
        return caches.match('/index.html');
      }
      return new Response('Sem conexão à internet', { status: 503 });
    })
  );
});
