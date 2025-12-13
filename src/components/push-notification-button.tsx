"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import {
  LucideBell,
  LucideBellOff,
  LucideBellRing,
  LucideLoader2,
  LucideShield,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function PushNotificationButton() {
  const {
    permission,
    isSupported,
    isSubscribed,
    isLoading,
    requestPermission,
    unsubscribe,
    sendTestNotification,
  } = usePushNotifications();

  if (!isSupported) {
    return null; // Don't show button if push notifications aren't supported
  }

  const getStatusBadge = () => {
    if (isSubscribed && permission === "granted") {
      return (
        <Badge variant="default" className="gap-1">
          <LucideBell className="h-3 w-3" />
          Ativo
        </Badge>
      );
    }
    if (permission === "denied") {
      return (
        <Badge variant="outline" className="gap-1 border-red-500 text-red-500">
          <LucideBellOff className="h-3 w-3" />
          Bloqueado
        </Badge>
      );
    }
    return (
      <Badge
        variant="outline"
        className="gap-1 border-yellow-500 text-yellow-500"
      >
        <LucideBellRing className="h-3 w-3" />
        Inativo
      </Badge>
    );
  };

  const getIcon = () => {
    if (isLoading) {
      return <LucideLoader2 className="h-4 w-4 animate-spin" />;
    }
    if (isSubscribed && permission === "granted") {
      return <LucideBell className="h-4 w-4 text-green-600" />;
    }
    if (permission === "denied") {
      return <LucideBellOff className="h-4 w-4 text-red-600" />;
    }
    return <LucideBellRing className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="relative gap-2"
          disabled={isLoading}
        >
          {getIcon()}
          <span className="hidden sm:inline">Push</span>
          {isSubscribed && (
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm">Notificações Push</h4>
              {getStatusBadge()}
            </div>
            <p className="text-sm text-muted-foreground">
              Receba notificações mesmo com o navegador minimizado
            </p>
          </div>

          {/* Admin only badge */}
          <Alert>
            <LucideShield className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Recurso exclusivo para administradores
            </AlertDescription>
          </Alert>

          {/* Status and actions */}
          <div className="space-y-2">
            {permission === "default" && (
              <>
                <p className="text-sm text-muted-foreground">
                  Clique no botão abaixo para ativar as notificações push.
                </p>

                <Alert className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
                  <AlertDescription className="text-xs text-amber-800 dark:text-amber-200">
                    <strong>Chrome/Edge:</strong> Se o popup não aparecer,
                    clique no <strong>cadeado 🔒</strong> ao lado da URL e
                    altere "Notificações" para "Permitir".
                  </AlertDescription>
                </Alert>

                <Button
                  onClick={requestPermission}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <LucideLoader2 className="mr-2 h-4 w-4 animate-spin" />
                      Ativando...
                    </>
                  ) : (
                    <>
                      <LucideBell className="mr-2 h-4 w-4" />
                      Ativar Notificações
                    </>
                  )}
                </Button>
              </>
            )}

            {permission === "granted" && isSubscribed && (
              <>
                <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-950 rounded-md">
                  <LucideBell className="h-4 w-4 text-green-600" />
                  <p className="text-sm text-green-800 dark:text-green-200">
                    Notificações ativas e funcionando!
                  </p>
                </div>
                <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                  <AlertDescription className="text-xs text-blue-800 dark:text-blue-200">
                    💡 <strong>Clique em "Testar"</strong> abaixo e verifique se
                    a notificação aparece na sua área de notificações (canto
                    superior direito no Windows/Linux, canto superior direito no
                    Mac).
                  </AlertDescription>
                </Alert>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      console.log("Test button clicked!");
                      sendTestNotification();
                    }}
                    variant="default"
                    size="sm"
                    className="flex-1"
                    disabled={isLoading}
                  >
                    <LucideBellRing className="mr-2 h-4 w-4" />
                    Testar Agora
                  </Button>
                  <Button
                    onClick={unsubscribe}
                    variant="outline"
                    size="sm"
                    className="flex-1 text-red-600 hover:text-red-700"
                    disabled={isLoading}
                  >
                    <LucideBellOff className="mr-2 h-4 w-4" />
                    Desativar
                  </Button>
                </div>
              </>
            )}

            {permission === "denied" && (
              <>
                <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-950 rounded-md">
                  <LucideBellOff className="h-4 w-4 text-red-600" />
                  <p className="text-sm text-red-800 dark:text-red-200">
                    Notificações bloqueadas
                  </p>
                </div>

                <Alert className="bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
                  <AlertDescription className="text-xs text-red-800 dark:text-red-200 space-y-2">
                    <p>
                      <strong>🔓 Como desbloquear no Chrome/Edge:</strong>
                    </p>
                    <ol className="list-decimal list-inside space-y-1 ml-2">
                      <li>
                        Clique no <strong>cadeado 🔒</strong> ao lado da URL
                      </li>
                      <li>Clique em "Configurações do site"</li>
                      <li>
                        Em "Notificações", altere para{" "}
                        <strong>"Permitir"</strong>
                      </li>
                      <li>Recarregue a página (F5)</li>
                    </ol>
                  </AlertDescription>
                </Alert>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    // Abrir configurações do site no Chrome
                    window.open(
                      `chrome://settings/content/siteDetails?site=${window.location.origin}`,
                      "_blank"
                    );
                  }}
                >
                  Abrir Configurações do Chrome
                </Button>
              </>
            )}
          </div>

          {/* Info section */}
          <div className="pt-2 border-t space-y-1">
            <p className="text-xs text-muted-foreground">
              💡 <strong>Você será notificado sobre:</strong>
            </p>
            <ul className="text-xs text-muted-foreground space-y-0.5 pl-4">
              <li>• Novos tickets criados</li>
              <li>• Novos comentários</li>
              <li>• Tickets urgentes</li>
              <li>• Tickets próximos do prazo</li>
            </ul>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
