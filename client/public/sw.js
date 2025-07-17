const CACHE_NAME = 'yobot-pwa-v1.0.0';
const STATIC_CACHE_NAME = 'yobot-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'yobot-dynamic-v1.0.0';

// Static assets to cache
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
  'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2'
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /^\/api\/metrics$/,
  /^\/api\/bot$/,
  /^\/api\/conversations$/,
  /^\/api\/notifications$/,
  /^\/api\/crm$/
];

// Network-first strategy patterns
const NETWORK_FIRST_PATTERNS = [
  /^\/api\/notifications$/,
  /^\/api\/metrics$/
];

// Cache-first strategy patterns  
const CACHE_FIRST_PATTERNS = [
  /\.(js|css|woff2?|ttf|eot)$/,
  /\/static\//,
  /\/assets\//
];

// Push notification event handler
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received:', event);
  
  if (!event.data) return;
  
  try {
    const data = event.data.json();
    const { title, body, type, priority, actionUrl } = data;
    
    // Critical escalation notifications
    const isCritical = type === 'call_escalation' || priority === 'critical';
    
    const options = {
      body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      vibrate: isCritical ? [200, 100, 200, 100, 200] : [100, 50, 100],
      requireInteraction: isCritical, // Keep notification visible until user interacts
      persistent: isCritical,
      silent: false,
      tag: type,
      data: {
        url: actionUrl || '/mobile',
        type,
        priority
      },
      actions: isCritical ? [
        {
          action: 'take_call',
          title: '📞 Take Call',
          icon: '/icon-192.png'
        },
        {
          action: 'view_details',
          title: '👁️ View Details',
          icon: '/icon-192.png'
        }
      ] : [
        {
          action: 'view',
          title: 'View',
          icon: '/icon-192.png'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  } catch (error) {
    console.error('[SW] Error handling push notification:', error);
  }
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click:', event);
  
  event.notification.close();
  
  const { action } = event;
  const { url, type } = event.notification.data || {};
  
  let targetUrl = url || '/mobile';
  
  if (action === 'take_call') {
    targetUrl = '/mobile?action=take_call';
  } else if (action === 'view_details') {
    targetUrl = '/mobile?action=view_details';
  }
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Try to focus existing window
        for (const client of clientList) {
          if (client.url.includes('/mobile') && 'focus' in client) {
            client.postMessage({
              type: 'NOTIFICATION_CLICKED',
              action,
              notificationType: type
            });
            return client.focus();
          }
        }
        
        // Open new window if none exists
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});

self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Failed to cache static assets:', error);
      })
  );
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME && 
                cacheName !== CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Service worker activated');
        return self.clients.claim();
      })
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-HTTP requests
  if (!request.url.startsWith('http')) {
    return;
  }

  // Skip WebSocket connections
  if (request.url.includes('/ws')) {
    return;
  }

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle static assets
  if (CACHE_FIRST_PATTERNS.some(pattern => pattern.test(request.url))) {
    event.respondWith(handleCacheFirst(request));
    return;
  }

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(request));
    return;
  }

  // Default: Network first with cache fallback
  event.respondWith(handleNetworkFirst(request));
});

// Handle API requests with appropriate caching strategy
async function handleApiRequest(request) {
  const url = new URL(request.url);
  
  // Real-time data should always come from network first
  if (NETWORK_FIRST_PATTERNS.some(pattern => pattern.test(url.pathname))) {
    return handleNetworkFirst(request, DYNAMIC_CACHE_NAME);
  }

  // Other API requests: cache first with network fallback
  return handleCacheFirst(request, DYNAMIC_CACHE_NAME);
}

// Network first strategy with cache fallback
async function handleNetworkFirst(request, cacheName = DYNAMIC_CACHE_NAME) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/');
    }
    
    // Return error response for API requests
    return new Response(
      JSON.stringify({ 
        error: 'Offline', 
        message: 'Network unavailable and no cached data found' 
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Cache first strategy with network fallback
async function handleCacheFirst(request, cacheName = STATIC_CACHE_NAME) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache and network both failed:', request.url);
    
    // Return offline fallback
    if (request.mode === 'navigate') {
      return caches.match('/');
    }
    
    return new Response('Network Error', { status: 408 });
  }
}

// Handle navigation requests (SPA routing)
async function handleNavigation(request) {
  try {
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    console.log('[SW] Navigation request failed, serving cached app shell');
    const cachedResponse = await caches.match('/');
    return cachedResponse || new Response('Offline', { status: 503 });
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync-notifications') {
    event.waitUntil(syncNotifications());
  }
  
  if (event.tag === 'background-sync-metrics') {
    event.waitUntil(syncMetrics());
  }
});

// Sync notifications when back online
async function syncNotifications() {
  try {
    console.log('[SW] Syncing notifications...');
    
    // Fetch latest notifications
    const response = await fetch('/api/notifications');
    if (response.ok) {
      const notifications = await response.json();
      
      // Cache the updated notifications
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put('/api/notifications', response.clone());
      
      console.log('[SW] Notifications synced successfully');
    }
  } catch (error) {
    console.error('[SW] Failed to sync notifications:', error);
  }
}

// Sync metrics when back online
async function syncMetrics() {
  try {
    console.log('[SW] Syncing metrics...');
    
    const response = await fetch('/api/metrics');
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put('/api/metrics', response.clone());
      
      console.log('[SW] Metrics synced successfully');
    }
  } catch (error) {
    console.error('[SW] Failed to sync metrics:', error);
  }
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  let notificationData = {
    title: 'YoBot® Notification',
    body: 'You have a new update',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'yobot-notification',
    requireInteraction: false,
    data: {}
  };
  
  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = { ...notificationData, ...data };
    } catch (error) {
      console.error('[SW] Failed to parse push data:', error);
      notificationData.body = event.data.text() || notificationData.body;
    }
  }
  
  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      requireInteraction: notificationData.requireInteraction,
      data: notificationData.data,
      actions: [
        {
          action: 'view',
          title: 'View Details'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ]
    })
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'dismiss') {
    return;
  }
  
  // Open or focus the app
  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Open new window if no existing window found
        if (clients.openWindow) {
          const targetUrl = event.notification.data?.url || '/';
          return clients.openWindow(targetUrl);
        }
      })
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed:', event.notification.tag);
  
  // Track notification dismissal analytics
  event.waitUntil(
    fetch('/api/analytics/notification-dismissed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tag: event.notification.tag,
        timestamp: Date.now()
      })
    }).catch(() => {
      // Ignore analytics errors
    })
  );
});

// Periodic background sync for keeping data fresh
self.addEventListener('periodicsync', (event) => {
  console.log('[SW] Periodic sync triggered:', event.tag);
  
  if (event.tag === 'background-fetch-updates') {
    event.waitUntil(fetchUpdates());
  }
});

// Fetch updates during periodic sync
async function fetchUpdates() {
  try {
    console.log('[SW] Fetching periodic updates...');
    
    // Update critical data
    const [metricsResponse, notificationsResponse] = await Promise.all([
      fetch('/api/metrics'),
      fetch('/api/notifications')
    ]);
    
    if (metricsResponse.ok && notificationsResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      
      await Promise.all([
        cache.put('/api/metrics', metricsResponse.clone()),
        cache.put('/api/notifications', notificationsResponse.clone())
      ]);
      
      console.log('[SW] Periodic updates completed');
    }
  } catch (error) {
    console.error('[SW] Periodic update failed:', error);
  }
}

// Message handling for communication with main thread
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_UPDATE') {
    event.waitUntil(updateCache(event.data.url));
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(clearCache());
  }
});

// Update specific cache entry
async function updateCache(url) {
  try {
    const response = await fetch(url);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      await cache.put(url, response);
      console.log('[SW] Cache updated for:', url);
    }
  } catch (error) {
    console.error('[SW] Failed to update cache for:', url, error);
  }
}

// Clear all caches
async function clearCache() {
  try {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(cacheName => caches.delete(cacheName))
    );
    console.log('[SW] All caches cleared');
  } catch (error) {
    console.error('[SW] Failed to clear caches:', error);
  }
}

// Error handling
self.addEventListener('error', (event) => {
  console.error('[SW] Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('[SW] Unhandled promise rejection:', event.reason);
});

console.log('[SW] Service Worker script loaded');
