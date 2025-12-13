// Service Worker for Push Notifications
// This enables notifications even when the app is closed

const CACHE_NAME = "tkt-app-v5";

// Install event
self.addEventListener("install", (event) => {
  console.log("Service Worker: Installed");
  self.skipWaiting();
});

// Activate event
self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activated");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log("Service Worker: Clearing Old Cache");
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Push event - receives push notifications
self.addEventListener("push", (event) => {
  console.log("Service Worker: Push Received", event);

  let notificationData = {
    title: "Nova Notificação",
    body: "Você tem uma nova notificação",
    icon: "/icon-192x192.png",
    badge: "/badge-72x72.png",
    tag: "notification",
    requireInteraction: false,
  };

  // Parse notification data if available
  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        title: data.title || notificationData.title,
        body: data.body || data.message || notificationData.body,
        icon: data.icon || notificationData.icon,
        badge: data.badge || notificationData.badge,
        tag: data.tag || notificationData.tag,
        data: data.data || {},
        requireInteraction: data.requireInteraction || false,
        actions: data.actions || [],
      };
    } catch (error) {
      console.error("Error parsing push data:", error);
      notificationData.body = event.data.text();
    }
  }

  const promiseChain = self.registration.showNotification(
    notificationData.title,
    {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      data: notificationData.data,
      requireInteraction: notificationData.requireInteraction,
      actions: notificationData.actions,
      vibrate: [200, 100, 200],
    }
  );

  event.waitUntil(promiseChain);
});

// Notification click event
self.addEventListener("notificationclick", (event) => {
  console.log("Service Worker: Notification Clicked", event);

  event.notification.close();

  // Handle action buttons
  if (event.action) {
    console.log("Action clicked:", event.action);
    // Handle specific actions here if needed
  }

  // Open the app or focus existing window
  const urlToOpen = event.notification.data?.url || "/admin";

  event.waitUntil(
    clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then((clientList) => {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url.includes(urlToOpen) && "focus" in client) {
            return client.focus();
          }
        }
        // If no window found, open a new one
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Message event - communicate with the app
self.addEventListener("message", (event) => {
  console.log("Service Worker: Message Received", event.data);

  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
