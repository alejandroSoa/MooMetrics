// MooMetrics Service Worker - Advanced Caching
// This service worker provides advanced caching strategies for offline functionality

const CACHE_NAME = 'moo-metrics-v1';
const STATIC_CACHE = 'moo-static-v1';
const DYNAMIC_CACHE = 'moo-dynamic-v1';
const API_CACHE = 'moo-api-v1';

// Files to cache immediately (static resources)
const STATIC_FILES = [
  '/',
  '/index.html',
  '/main.js',
  '/styles.css',
  '/manifest.webmanifest',
  '/assets/images/send-button-icon.png',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png'
];

// API routes to cache
const API_ROUTES = [
  '/api/v1/stables',
  '/api/v1/channels',
  '/api/v1/messages',
  '/api/v1/cows'
];

// Install event - cache static files
self.addEventListener('install', event => {
  console.log('🔧 Service Worker: Installing');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('📦 Service Worker: Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('✅ Service Worker: Static files cached');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('❌ Service Worker: Failed to cache static files', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('🚀 Service Worker: Activating');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            // Delete old caches that don't match current version
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== API_CACHE) {
              console.log('🗑️ Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Service Worker: Activated and took control');
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle different types of requests with appropriate strategies
  
  // 1. Static files - Cache First
  if (STATIC_FILES.some(file => url.pathname.endsWith(file))) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }
  
  // 2. API requests - Network First with cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstWithCache(request, API_CACHE));
    return;
  }
  
  // 3. Navigation requests - Network First with cache fallback
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstWithCache(request, DYNAMIC_CACHE, '/index.html'));
    return;
  }
  
  // 4. Other resources - Cache First with network fallback
  event.respondWith(cacheFirstWithNetwork(request, DYNAMIC_CACHE));
});

// Caching Strategies

/**
 * Cache First Strategy
 * Good for static resources that don't change often
 */
async function cacheFirst(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('📁 Cache hit for:', request.url);
      return cachedResponse;
    }
    
    console.log('🌐 Cache miss, fetching from network:', request.url);
    const networkResponse = await fetch(request);
    
    if (networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('❌ Cache First failed for:', request.url, error);
    return new Response('Offline - Resource not available', { 
      status: 503, 
      statusText: 'Service Unavailable' 
    });
  }
}

/**
 * Network First with Cache Fallback
 * Good for API requests and dynamic content
 */
async function networkFirstWithCache(request, cacheName, fallbackUrl = null) {
  try {
    console.log('🌐 Network first for:', request.url);
    const networkResponse = await fetch(request);
    
    if (networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
      console.log('💾 Cached network response for:', request.url);
    }
    
    return networkResponse;
  } catch (error) {
    console.warn('🔄 Network failed, trying cache for:', request.url);
    
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('📁 Serving cached response for:', request.url);
      return cachedResponse;
    }
    
    // If we have a fallback URL (for navigation requests)
    if (fallbackUrl) {
      const fallbackResponse = await cache.match(fallbackUrl);
      if (fallbackResponse) {
        console.log('🏠 Serving fallback response:', fallbackUrl);
        return fallbackResponse;
      }
    }
    
    console.error('❌ No cache available for:', request.url);
    return new Response(
      JSON.stringify({
        error: 'Offline',
        message: 'You are offline and this resource is not cached',
        timestamp: new Date().toISOString()
      }), 
      { 
        status: 503, 
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * Cache First with Network Fallback
 * Good for resources that should be cached but might need updates
 */
async function cacheFirstWithNetwork(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('📁 Cache hit for:', request.url);
      
      // Background fetch to update cache
      fetch(request)
        .then(networkResponse => {
          if (networkResponse.status === 200) {
            cache.put(request, networkResponse.clone());
            console.log('🔄 Background cache update for:', request.url);
          }
        })
        .catch(() => {
          // Silently fail background updates
        });
        
      return cachedResponse;
    }
    
    console.log('🌐 Cache miss, fetching from network:', request.url);
    const networkResponse = await fetch(request);
    
    if (networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('❌ Cache first with network failed for:', request.url, error);
    return new Response('Offline - Resource not available', { 
      status: 503, 
      statusText: 'Service Unavailable' 
    });
  }
}

// Background sync for offline actions
self.addEventListener('sync', event => {
  console.log('🔄 Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync-messages') {
    event.waitUntil(syncOfflineMessages());
  }
});

/**
 * Sync offline messages when connection is restored
 */
async function syncOfflineMessages() {
  try {
    // Get offline messages from IndexedDB or localStorage
    const offlineMessages = await getOfflineMessages();
    
    for (const message of offlineMessages) {
      try {
        const response = await fetch(message.url, {
          method: message.method,
          headers: message.headers,
          body: message.body
        });
        
        if (response.ok) {
          await removeOfflineMessage(message.id);
          console.log('✅ Synced offline message:', message.id);
        }
      } catch (error) {
        console.error('❌ Failed to sync message:', message.id, error);
      }
    }
  } catch (error) {
    console.error('❌ Background sync failed:', error);
  }
}

/**
 * Get stored offline messages
 * This would normally use IndexedDB, but for simplicity using a placeholder
 */
async function getOfflineMessages() {
  // Placeholder - implement with IndexedDB for real offline message queue
  return [];
}

/**
 * Remove synced offline message
 */
async function removeOfflineMessage(messageId) {
  // Placeholder - implement with IndexedDB
  console.log('Removing offline message:', messageId);
}

// Push notifications (for future use)
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();
    console.log('📬 Push notification received:', data);
    
    const options = {
      body: data.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      vibrate: [200, 100, 200],
      data: data,
      actions: [
        {
          action: 'view',
          title: 'Ver',
          icon: '/icons/icon-72x72.png'
        },
        {
          action: 'close',
          title: 'Cerrar'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'MooMetrics', options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  console.log('🔔 Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Message handling from the app
self.addEventListener('message', event => {
  console.log('💬 Message received from app:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_CACHE_STATS') {
    getCacheStats().then(stats => {
      event.ports[0].postMessage(stats);
    });
  }
});

/**
 * Get cache statistics
 */
async function getCacheStats() {
  const cacheNames = await caches.keys();
  const stats = {
    caches: [],
    totalSize: 0
  };
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    
    let cacheSize = 0;
    for (const request of keys) {
      const response = await cache.match(request);
      if (response) {
        const text = await response.text();
        cacheSize += text.length;
      }
    }
    
    stats.caches.push({
      name: cacheName,
      entries: keys.length,
      size: cacheSize
    });
    
    stats.totalSize += cacheSize;
  }
  
  return stats;
}

console.log('🚀 MooMetrics Service Worker loaded successfully');