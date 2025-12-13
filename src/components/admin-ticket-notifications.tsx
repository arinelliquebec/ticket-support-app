"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, X, Check, CheckCheck, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";
import { ticketPath } from "@/paths";
import { PriorityBadge } from "@/components/priority-badge";
import { TicketPriority } from "@/validations/ticket-schema";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useRealtimeNotifications } from "@/hooks/use-realtime-notifications";
import { useRouter } from "next/navigation";
import { sendNewTicketNotification } from "@/lib/push-notification-sender";

type UnviewedTicket = {
  id: string;
  title: string;
  priority: string;
  status: string;
  createdAt: Date;
  user?: {
    username: string;
  } | null;
  category?: {
    name: string;
    color: string;
  } | null;
};

interface AdminTicketNotificationsProps {
  initialCount: number;
  initialTickets: UnviewedTicket[];
}

export function AdminTicketNotifications({
  initialCount,
  initialTickets,
}: AdminTicketNotificationsProps) {
  const [count, setCount] = useState(initialCount);
  const [tickets, setTickets] = useState<UnviewedTicket[]>(initialTickets);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Real-time notifications via SSE
  const { isConnected, subscribe } = useRealtimeNotifications();

  // Log connection status
  useEffect(() => {
    console.log("[AdminTicketNotifications] Component mounted");
    console.log("[AdminTicketNotifications] SSE Connected:", isConnected);
  }, [isConnected]);

  // Handle real-time ticket creation
  const handleTicketCreated = useCallback(async (event: any) => {
    console.log("[Notifications] ========== NEW TICKET CREATED ==========");
    console.log("[Notifications] Event type:", event.type);
    console.log("[Notifications] Event data:", event.data);
    console.log(
      "[Notifications] Notification.permission:",
      Notification.permission
    );
    console.log(
      "[Notifications] Window.Notification exists:",
      "Notification" in window
    );
    console.log("[Notifications] =======================================");

    // Refresh count and list
    setCount((prev) => prev + 1);

    // Add to list if we have the ticket data
    if (event.data.ticket) {
      setTickets((prev) => [event.data.ticket, ...prev]);
    } else {
      // Fetch fresh list
      await fetchTickets();
    }

    // Show push notification if supported and permission granted
    if ("Notification" in window && Notification.permission === "granted") {
      console.log("[Notifications] Sending push notification...");

      // Use our custom push notification sender
      if (event.data.ticket) {
        console.log(
          "[Notifications] Ticket data available, using custom notification"
        );
        sendNewTicketNotification({
          id: event.data.ticket.id,
          title: event.data.ticket.title,
          priority: event.data.ticket.priority || "MEDIA",
          user: event.data.ticket.user?.username || "Desconhecido",
        });
      } else {
        // Fallback to simple notification
        console.log("[Notifications] Using fallback notification");
        try {
          const notification = new Notification("Novo Ticket Criado", {
            body: event.data.title || "Um novo ticket foi criado",
            tag: "new-ticket",
            requireInteraction: false,
          });
          console.log(
            "[Notifications] Fallback notification created successfully"
          );
        } catch (error) {
          console.error(
            "[Notifications] Error creating fallback notification:",
            error
          );
        }
      }
    } else {
      console.log(
        "[Notifications] Cannot send notification - permission:",
        Notification.permission
      );
    }
  }, []);

  // Handle real-time ticket updates
  const handleTicketUpdated = useCallback(async (event: any) => {
    console.log("[Notifications] Ticket updated:", event.data);

    // If ticket was viewed, remove from list
    if (event.data.viewedByAdmin) {
      setTickets((prev) => prev.filter((t) => t.id !== event.data.ticketId));
      setCount((prev) => Math.max(0, prev - 1));
    }
  }, []);

  // Subscribe to real-time events
  useEffect(() => {
    console.log("[AdminTicketNotifications] Setting up event subscriptions...");

    const unsubscribeCreated = subscribe("ticket:created", handleTicketCreated);
    const unsubscribeUpdated = subscribe("ticket:updated", handleTicketUpdated);

    // Subscribe to ALL events for debugging
    const unsubscribeAll = subscribe("*", (event) => {
      console.log("[Notifications] ========== ANY EVENT RECEIVED ==========");
      console.log("[Notifications] Event type:", event.type);
      console.log("[Notifications] Event data:", event.data);
      console.log(
        "[Notifications] Timestamp:",
        new Date(event.timestamp).toLocaleString()
      );
      console.log("[Notifications] ========================================");
    });

    console.log("[AdminTicketNotifications] ✅ Event subscriptions active");

    return () => {
      console.log("[AdminTicketNotifications] Cleaning up event subscriptions");
      unsubscribeCreated();
      unsubscribeUpdated();
      unsubscribeAll();
    };
  }, [subscribe, handleTicketCreated, handleTicketUpdated]);

  // Request notification permission on mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Fetch full list when popover opens
  useEffect(() => {
    if (isOpen && tickets.length === 0) {
      fetchTickets();
    }
  }, [isOpen]);

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/unviewed-tickets");
      if (response.ok) {
        const data = await response.json();
        setTickets(data.tickets);
        setCount(data.tickets.length);
      }
    } catch (error) {
      console.error("Error fetching unviewed tickets:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsViewed = async (ticketId: string) => {
    try {
      const response = await fetch("/api/admin/mark-ticket-viewed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId }),
      });

      if (response.ok) {
        // Remove ticket from list
        setTickets((prev) => prev.filter((t) => t.id !== ticketId));
        setCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error marking ticket as viewed:", error);
    }
  };

  const handleMarkAllAsViewed = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/mark-all-tickets-viewed", {
        method: "POST",
      });

      if (response.ok) {
        setTickets([]);
        setCount(0);
      }
    } catch (error) {
      console.error("Error marking all tickets as viewed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TooltipProvider>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              aria-label="Notificações de tickets"
            >
              <Bell className="h-5 w-5" />
              {count > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs animate-pulse"
                >
                  {count > 99 ? "99+" : count}
                </Badge>
              )}
            </Button>

            {/* Connection status indicator */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="absolute -bottom-1 -right-1">
                  {isConnected ? (
                    <Wifi className="h-3 w-3 text-green-500" />
                  ) : (
                    <WifiOff className="h-3 w-3 text-red-500" />
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                {isConnected ? "Tempo real ativo" : "Reconectando..."}
              </TooltipContent>
            </Tooltip>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-96 p-0" align="end">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Novos Tickets</h3>
              {count > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {count}
                </Badge>
              )}
            </div>
            {count > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsViewed}
                disabled={isLoading}
                className="h-8 gap-2"
              >
                <CheckCheck className="h-4 w-4" />
                Marcar todos
              </Button>
            )}
          </div>

          <ScrollArea className="h-[400px]">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : tickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Bell className="h-12 w-12 mb-3 opacity-20" />
                <p className="text-sm">Nenhum ticket novo</p>
              </div>
            ) : (
              <div className="divide-y">
                {tickets.map((ticket) => (
                  <Card
                    key={ticket.id}
                    className="border-0 rounded-none shadow-none hover:bg-accent/50 transition-colors"
                  >
                    <div className="p-3">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <Link
                          href={ticketPath(ticket.id)}
                          className="flex-1 hover:underline"
                          onClick={() => {
                            handleMarkAsViewed(ticket.id);
                            setIsOpen(false);
                          }}
                        >
                          <p className="font-medium text-sm line-clamp-2">
                            {ticket.title}
                          </p>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 shrink-0"
                          onClick={() => handleMarkAsViewed(ticket.id)}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap text-xs">
                        <PriorityBadge
                          priority={ticket.priority as TicketPriority}
                          size="sm"
                        />

                        {ticket.user && (
                          <span className="text-muted-foreground">
                            por {ticket.user.username}
                          </span>
                        )}

                        <span className="text-muted-foreground">
                          {format(new Date(ticket.createdAt), "dd/MM HH:mm", {
                            locale: ptBR,
                          })}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Connection status footer */}
          <div className="border-t p-2">
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              {isConnected ? (
                <>
                  <Wifi className="h-3 w-3 text-green-500" />
                  Atualizações em tempo real
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3 text-red-500" />
                  Reconectando...
                </>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </TooltipProvider>
  );
}
