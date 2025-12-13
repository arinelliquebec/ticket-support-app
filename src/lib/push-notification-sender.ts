"use client";

/**
 * Client-side utility to send push notifications
 * This is triggered by real-time events from the event bus
 */

export interface PushNotificationData {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  url?: string;
  requireInteraction?: boolean;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

/**
 * Send a browser notification using the Notification API
 * This works when the user has granted permission
 */
export async function sendBrowserNotification(
  data: PushNotificationData
): Promise<void> {
  console.log("[Push Sender] sendBrowserNotification called with:", data);

  // Check if notifications are supported
  if (!("Notification" in window)) {
    console.warn("[Push Sender] Browser does not support notifications");
    return;
  }

  // Check permission
  console.log("[Push Sender] Current permission:", Notification.permission);
  if (Notification.permission !== "granted") {
    console.warn(
      "[Push Sender] Notification permission not granted - current:",
      Notification.permission
    );
    return;
  }

  try {
    // Prefer Service Worker notifications (persistent and more reliable)
    if ("serviceWorker" in navigator) {
      let registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        try {
          console.log("[Push Sender] No SW registration - registering /sw.js");
          registration = await navigator.serviceWorker.register("/sw.js", {
            scope: "/",
          });
          await navigator.serviceWorker.ready;
          console.log("[Push Sender] SW registered and ready");
        } catch (e) {
          console.warn(
            "[Push Sender] Failed to register SW, will fallback to Notification API",
            e
          );
        }
      }

      if (registration) {
        try {
          console.log(
            "[Push Sender] Showing notification via ServiceWorkerRegistration.showNotification"
          );
          await registration.showNotification(data.title, {
            body: data.body,
            icon: data.icon,
            badge: data.badge,
            tag: data.tag || "notification",
            requireInteraction: data.requireInteraction || false,
            data: { url: data.url },
            actions: data.actions,
          });
          return;
        } catch (swError) {
          console.warn(
            "[Push Sender] showNotification failed, falling back to Notification API",
            swError
          );
        }
      } else {
        console.log(
          "[Push Sender] No SW registration available, using Notification API"
        );
      }
    }

    console.log("[Push Sender] Creating notification via Notification API...");

    const notification = new Notification(data.title, {
      body: data.body,
      icon: data.icon,
      badge: data.badge,
      tag: data.tag || "notification",
      requireInteraction: data.requireInteraction || false,
      data: { url: data.url },
    });

    console.log("[Push Sender] ✅ Notification created successfully!");

    notification.onclick = (event) => {
      console.log("[Push Sender] Notification clicked");
      event.preventDefault();
      window.focus();
      if (data.url) {
        window.location.href = data.url;
      }
      notification.close();
    };

    // Auto-close after 10 seconds if not requiring interaction
    if (!data.requireInteraction) {
      setTimeout(() => notification.close(), 10000);
    }
  } catch (error) {
    console.error("[Push Sender] ❌ Error sending notification:", error);
  }
}

/**
 * Helper functions for specific notification types
 */

export function sendNewTicketNotification(ticketData: {
  id: string;
  title: string;
  priority: string;
  user: string;
}) {
  console.log(
    "[Push Sender] sendNewTicketNotification called with:",
    ticketData
  );

  console.log("[Push Sender] Calling sendBrowserNotification...");

  sendBrowserNotification({
    title: `🆕 Novo Ticket Criado`,
    body: `${ticketData.title} - Por ${ticketData.user}`,
    tag: `ticket-${ticketData.id}`,
    url: `/tickets/${ticketData.id}`,
    requireInteraction: false,
  });
}

export function sendNewCommentNotification(commentData: {
  ticketId: string;
  ticketTitle: string;
  author: string;
  preview: string;
}) {
  sendBrowserNotification({
    title: `💬 Novo Comentário`,
    body: `${commentData.author}: ${commentData.preview}`,
    tag: `comment-${commentData.ticketId}`,
    url: `/tickets/${commentData.ticketId}`,
  });
}

export function sendTicketStatusChangeNotification(statusData: {
  ticketId: string;
  ticketTitle: string;
  newStatus: string;
  changedBy: string;
}) {
  const statusEmoji =
    statusData.newStatus === "CONCLUIDO"
      ? "✅"
      : statusData.newStatus === "EM_ANDAMENTO"
      ? "🔄"
      : "📋";

  sendBrowserNotification({
    title: `${statusEmoji} Status Atualizado`,
    body: `${statusData.ticketTitle} agora está ${statusData.newStatus}`,
    tag: `status-${statusData.ticketId}`,
    url: `/tickets/${statusData.ticketId}`,
  });
}
