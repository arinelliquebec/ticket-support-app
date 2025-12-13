"use client";

import { useState, useEffect, useCallback } from "react";
import { MessageSquare, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { ticketPath } from "@/paths";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useRealtimeNotifications } from "@/hooks/use-realtime-notifications";
import { sendNewCommentNotification } from "@/lib/push-notification-sender";

type CommentNotification = {
  ticketId: string;
  commentId: string;
  comment: {
    content: string;
    user: {
      username: string;
    };
    createdAt: Date;
  };
  timestamp: number;
};

export function UserNotifications() {
  const [notifications, setNotifications] = useState<CommentNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { isConnected, subscribe } = useRealtimeNotifications();

  // Handle new comment notifications
  const handleCommentCreated = useCallback((event: any) => {
    console.log("[User Notifications] New comment:", event.data);
    
    const notification: CommentNotification = {
      ticketId: event.data.ticketId,
      commentId: event.data.commentId,
      comment: event.data.comment,
      timestamp: event.timestamp,
    };

    setNotifications((prev) => [notification, ...prev].slice(0, 20)); // Keep max 20

    // Show push notification
    if ("Notification" in window && Notification.permission === "granted") {
      sendNewCommentNotification({
        ticketId: event.data.ticketId,
        ticketTitle: event.data.comment.ticket?.title || "Seu Ticket",
        author: event.data.comment.user.username,
        preview: event.data.comment.content.substring(0, 100),
      });
    }
  }, []);

  // Subscribe to comment events
  useEffect(() => {
    const unsubscribe = subscribe("comment:created", handleCommentCreated);
    return () => unsubscribe();
  }, [subscribe, handleCommentCreated]);

  // Request notification permission on mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const handleDismiss = (timestamp: number) => {
    setNotifications((prev) => prev.filter((n) => n.timestamp !== timestamp));
  };

  const unreadCount = notifications.length;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Notificações"
        >
          <MessageSquare className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs animate-pulse"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Notificações</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary">{unreadCount}</Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setNotifications([])}
              className="h-8"
            >
              Limpar
            </Button>
          )}
        </div>

        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mb-3 opacity-20" />
              <p className="text-sm">Nenhuma notificação</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <Card
                  key={notification.timestamp}
                  className="border-0 rounded-none shadow-none hover:bg-accent/50 transition-colors"
                >
                  <div className="p-3 pr-8 relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 absolute top-2 right-2"
                      onClick={() => handleDismiss(notification.timestamp)}
                    >
                      <X className="h-3 w-3" />
                    </Button>

                    <Link
                      href={ticketPath(notification.ticketId)}
                      className="block hover:underline"
                      onClick={() => {
                        handleDismiss(notification.timestamp);
                        setIsOpen(false);
                      }}
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-medium">
                          {notification.comment.user.username} comentou
                        </p>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {notification.comment.content}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(
                            new Date(notification.comment.createdAt),
                            "dd/MM HH:mm",
                            { locale: ptBR }
                          )}
                        </p>
                      </div>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

