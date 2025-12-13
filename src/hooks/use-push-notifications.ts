"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

export type PushPermissionState =
  | "default"
  | "granted"
  | "denied"
  | "unsupported";

interface UsePushNotificationsReturn {
  permission: PushPermissionState;
  isSupported: boolean;
  isSubscribed: boolean;
  isLoading: boolean;
  requestPermission: () => Promise<void>;
  subscribe: () => Promise<void>;
  unsubscribe: () => Promise<void>;
  sendTestNotification: () => Promise<void>;
}

export function usePushNotifications(): UsePushNotificationsReturn {
  const [permission, setPermission] = useState<PushPermissionState>("default");
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check if push notifications are supported
  useEffect(() => {
    if (typeof window !== "undefined") {
      const supported =
        "serviceWorker" in navigator &&
        "PushManager" in window &&
        "Notification" in window;
      setIsSupported(supported);

      if (supported && Notification.permission) {
        setPermission(Notification.permission as PushPermissionState);
      }
    }
  }, []);

  // Check subscription status
  useEffect(() => {
    if (!isSupported) return;

    const checkSubscription = async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
      } catch (error) {
        console.error("Error checking subscription:", error);
      }
    };

    checkSubscription();
  }, [isSupported, permission]);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    console.log("[Push] requestPermission called");
    console.log("[Push] isSupported:", isSupported);

    if (!isSupported) {
      toast.error("Push notifications não são suportadas neste navegador");
      return;
    }

    try {
      setIsLoading(true);
      console.log("[Push] Requesting permission...");

      const result = await Notification.requestPermission();
      console.log("[Push] Permission result:", result);

      setPermission(result as PushPermissionState);

      if (result === "granted") {
        console.log("[Push] Permission granted! Subscribing...");
        toast.success("Permissão concedida! Ativando notificações...");
        // Small delay to ensure permission is set in the browser
        setTimeout(() => {
          subscribe();
        }, 100);
      } else if (result === "denied") {
        console.log("[Push] Permission denied");
        toast.error(
          "Permissão negada. Você pode ativar nas configurações do navegador."
        );
      } else {
        console.log("[Push] Permission default (não decidido)");
        toast.info("Você não permitiu notificações. Tente novamente.");
      }
    } catch (error) {
      console.error("[Push] Error requesting permission:", error);
      toast.error("Erro ao solicitar permissão");
    } finally {
      setIsLoading(false);
    }
  }, [isSupported]);

  // Subscribe to push notifications
  const subscribe = useCallback(async () => {
    console.log("[Push] subscribe called");
    console.log("[Push] isSupported:", isSupported);
    console.log(
      "[Push] Notification.permission (DIRECT):",
      Notification.permission
    );

    // Always use Notification.permission directly - don't trust React state
    if (!isSupported || Notification.permission !== "granted") {
      console.log("[Push] ❌ Cannot subscribe");
      console.log("[Push] isSupported:", isSupported);
      console.log("[Push] Notification.permission:", Notification.permission);
      return;
    }

    console.log("[Push] ✅ All checks passed! Proceeding to subscribe...");

    try {
      setIsLoading(true);
      console.log("[Push] Subscribing...");

      // Register service worker if not already registered
      let registration = await navigator.serviceWorker.getRegistration();
      console.log("[Push] Current registration:", registration);

      if (!registration) {
        console.log("[Push] Registering service worker...");
        registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });
        console.log("[Push] Service Worker registered:", registration);
        // Wait for service worker to be ready
        await navigator.serviceWorker.ready;
        console.log("[Push] Service Worker ready");
      } else {
        console.log("[Push] Service Worker already registered");
      }

      // Mark as subscribed (using browser Notification API instead of Push API)
      // This allows us to send notifications without needing a backend server
      setIsSubscribed(true);
      toast.success("Notificações push ativadas com sucesso!");

      console.log("[Push] Browser notifications enabled successfully");
    } catch (error) {
      console.error("[Push] Error subscribing to push:", error);
      toast.error("Erro ao ativar notificações push");
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, permission]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async () => {
    if (!isSupported) return;

    try {
      setIsLoading(true);
      setIsSubscribed(false);
      toast.success("Notificações push desativadas");
      console.log("Browser notifications disabled");
    } catch (error) {
      console.error("Error unsubscribing:", error);
      toast.error("Erro ao desativar notificações push");
    } finally {
      setIsLoading(false);
    }
  }, [isSupported]);

  // Send a test notification (using the Notification API directly)
  const sendTestNotification = useCallback(async () => {
    console.log("sendTestNotification called");
    console.log("isSupported:", isSupported);
    console.log("permission:", permission);

    if (!isSupported) {
      toast.error("Notificações não são suportadas neste navegador");
      return;
    }

    if (permission !== "granted") {
      toast.error(
        "Permissão de notificações não concedida. Clique em 'Ativar Notificações' primeiro."
      );
      return;
    }

    try {
      console.log("Attempting to create notification...");

      // Send a test notification using the browser's Notification API
      const notification = new Notification("🔔 Teste de Notificação - TKT", {
        body: "Suas notificações push estão funcionando perfeitamente! 🎉",
        tag: "test-notification",
        requireInteraction: false,
        silent: false,
      });

      console.log("Notification created successfully");

      notification.onclick = () => {
        console.log("Notification clicked");
        window.focus();
        notification.close();
      };

      notification.onerror = (error) => {
        console.error("Notification error:", error);
      };

      toast.success(
        "Notificação de teste enviada! Verifique sua área de notificações."
      );
    } catch (error) {
      console.error("Error sending test notification:", error);
      toast.error(
        `Erro ao enviar notificação: ${
          error instanceof Error ? error.message : "Erro desconhecido"
        }`
      );
    }
  }, [isSupported, permission]);

  return {
    permission,
    isSupported,
    isSubscribed,
    isLoading,
    requestPermission,
    subscribe,
    unsubscribe,
    sendTestNotification,
  };
}
