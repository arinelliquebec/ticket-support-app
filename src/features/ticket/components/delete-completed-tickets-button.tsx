// src/features/ticket/components/delete-completed-tickets-button.tsx
// VERSÃO CORRIGIDA COM CAMPO DE INPUT VISÍVEL

"use client";

import { useState, useEffect, JSX } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LucideTrash2,
  LucideLoader2,
  LucideAlertTriangle,
  LucideCheckCircle,
  LucideInfo,
  LucideFileText,
  LucideMessageSquare,
  LucidePaperclip,
  LucideBuilding,
} from "lucide-react";
import { toast } from "sonner";
import {
  adminDeleteCompletedTickets,
  getCompletedTicketsStats,
  type DeleteCompletedTicketsResult,
  type CompletedTicketsStats,
} from "@/features/auth/actions/admin-delete-completed-tickets";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DeleteCompletedTicketsButtonProps {
  onSuccess?: () => void;
  className?: string;
}

interface StatsState {
  totalTickets: number;
  totalComments: number;
  totalAttachments: number;
  byFilial: Record<string, number>;
  tickets: Array<{
    id: string;
    title: string;
    createdAt: Date | string;
    filial: string | null;
    user: { username: string } | null;
    _count: {
      comments: number;
      attachments: number;
    };
  }>;
}

export function DeleteCompletedTicketsButton({
  onSuccess,
  className = "",
}: DeleteCompletedTicketsButtonProps): JSX.Element {
  // Estados do componente
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isLoadingStats, setIsLoadingStats] = useState<boolean>(false);
  const [stats, setStats] = useState<StatsState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmText, setConfirmText] = useState<string>("");
  const [deleteProgress, setDeleteProgress] = useState<number>(0);
  const [deleteResult, setDeleteResult] =
    useState<DeleteCompletedTicketsResult | null>(null);

  // Effect para carregar estatísticas quando o diálogo é aberto
  useEffect(() => {
    if (isOpen && !stats && !isLoadingStats) {
      void loadStats();
    }
  }, [isOpen, stats, isLoadingStats]);

  const loadStats = async (): Promise<void> => {
    setIsLoadingStats(true);
    setError(null);

    try {
      const result: CompletedTicketsStats = await getCompletedTicketsStats();

      if (result.success && result.stats) {
        setStats(result.stats);
      } else {
        setError(result.error || "Erro ao carregar estatísticas");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";
      setError(`Erro ao carregar estatísticas: ${errorMessage}`);
      console.error("[DeleteCompletedTicketsButton] Error loading stats:", err);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleDelete = async (): Promise<void> => {
    setIsDeleting(true);
    setError(null);
    setDeleteProgress(0);

    // Animação de progresso
    const progressInterval = setInterval(() => {
      setDeleteProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 200);

    try {
      const result: DeleteCompletedTicketsResult =
        await adminDeleteCompletedTickets();

      clearInterval(progressInterval);
      setDeleteProgress(100);

      if (result.success) {
        setDeleteResult(result);

        toast.success(
          `${
            result.deletedCount || 0
          } ticket(s) concluído(s) deletado(s) com sucesso!`,
          {
            description: result.details
              ? `${result.details.commentsDeleted} comentários e ${result.details.attachmentsDeleted} anexos também foram removidos.`
              : undefined,
            duration: 5000,
          }
        );

        setTimeout(() => {
          setIsOpen(false);
          onSuccess?.();

          setTimeout(() => {
            setConfirmText("");
            setDeleteResult(null);
            setDeleteProgress(0);
            setStats(null);
          }, 300);
        }, 2000);
      } else {
        setError(result.error || "Erro ao deletar tickets");
        toast.error("Erro ao deletar tickets", {
          description: result.error,
          duration: 5000,
        });
      }
    } catch (err) {
      clearInterval(progressInterval);
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";
      setError(`Erro inesperado: ${errorMessage}`);
      console.error("[DeleteCompletedTicketsButton] Delete error:", err);
      toast.error("Erro inesperado ao deletar tickets");
    } finally {
      setIsDeleting(false);
    }
  };

  const isConfirmValid: boolean = confirmText.toLowerCase() === "deletar tudo";
  const hasTickets: boolean = (stats?.totalTickets ?? 0) > 0;

  const formatDate = (date: Date | string): string => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return format(dateObj, "dd/MM/yyyy", { locale: ptBR });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className={`text-destructive hover:bg-destructive/10 ${className}`}
        >
          <LucideTrash2 className="h-4 w-4 mr-2" />
          Deletar Tickets Concluídos
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <LucideTrash2 className="h-5 w-5 text-destructive" />
            Deletar Todos os Tickets Concluídos
          </DialogTitle>
          <DialogDescription>
            Esta ação é <strong>irreversível</strong> e removerá permanentemente
            todos os tickets com status "CONCLUÍDO" do sistema, incluindo seus
            comentários e anexos.
          </DialogDescription>
        </DialogHeader>

        {/* Conteúdo scrollável */}
        <div className="flex-1 overflow-y-auto px-1">
          {isLoadingStats ? (
            <div className="flex items-center justify-center py-8">
              <LucideLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error && !deleteResult ? (
            <Alert variant="destructive">
              <LucideAlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : stats && !deleteResult ? (
            <div className="space-y-4">
              {/* Cards de resumo */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Tickets
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-destructive">
                      {stats.totalTickets}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Comentários
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats.totalComments}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Anexos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats.totalAttachments}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Distribuição por filial */}
              {Object.keys(stats.byFilial).length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">
                      Distribuição por Filial
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(stats.byFilial).map(([filial, count]) => (
                        <Badge key={filial} variant="secondary">
                          <LucideBuilding className="h-3 w-3 mr-1" />
                          {filial}: {count}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Lista preview de tickets */}
              {stats.tickets.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">
                      Tickets que serão deletados
                      {stats.tickets.length > 5 &&
                        ` (mostrando 5 de ${stats.tickets.length})`}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-40 w-full rounded-md border p-2">
                      <div className="space-y-2">
                        {stats.tickets.slice(0, 5).map((ticket) => (
                          <div
                            key={ticket.id}
                            className="flex items-center justify-between text-sm p-2 rounded bg-muted/50"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">
                                {ticket.title}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {ticket.user?.username || "Usuário removido"} •{" "}
                                {formatDate(ticket.createdAt)}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs ml-2 flex-shrink-0">
                              {ticket._count.comments > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  <LucideMessageSquare className="h-3 w-3 mr-1" />
                                  {ticket._count.comments}
                                </Badge>
                              )}
                              {ticket._count.attachments > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  <LucidePaperclip className="h-3 w-3 mr-1" />
                                  {ticket._count.attachments}
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}

              {!hasTickets && (
                <Alert>
                  <LucideInfo className="h-4 w-4" />
                  <AlertDescription>
                    Não há tickets concluídos para deletar no momento.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          ) : deleteResult ? (
            // Resultado da exclusão
            <div className="space-y-4 py-4">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                  <LucideCheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-semibold">Exclusão Concluída!</h3>
                <p className="text-muted-foreground mt-2">
                  {deleteResult.deletedCount} ticket(s) foram deletados com
                  sucesso.
                </p>
                {deleteResult.details && (
                  <div className="mt-4 text-sm text-muted-foreground space-y-1">
                    <div>
                      {deleteResult.details.commentsDeleted} comentários
                      removidos
                    </div>
                    <div>
                      {deleteResult.details.attachmentsDeleted} anexos removidos
                    </div>
                    {deleteResult.details.executionTimeMs && (
                      <div className="text-xs mt-2">
                        Tempo de execução:{" "}
                        {deleteResult.details.executionTimeMs.toFixed(2)}ms
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {/* Barra de progresso durante exclusão */}
          {isDeleting && (
            <div className="space-y-2 py-4">
              <Progress value={deleteProgress} className="h-2" />
              <p className="text-sm text-center text-muted-foreground">
                Deletando tickets... {Math.round(deleteProgress)}%
              </p>
            </div>
          )}
        </div>

        {/* SEÇÃO DE CONFIRMAÇÃO - SEMPRE VISÍVEL QUANDO HÁ TICKETS */}
        {hasTickets && !deleteResult && !isLoadingStats && (
          <div className="border-t pt-4 space-y-4 bg-background">
            <Alert className="border-destructive/50 bg-destructive/5">
              <LucideAlertTriangle className="h-4 w-4 text-destructive" />
              <AlertDescription>
                Para confirmar esta ação, digite <strong>"deletar tudo"</strong>{" "}
                no campo abaixo:
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="confirm-delete" className="text-sm font-medium">
                Confirmação de Exclusão
              </Label>
              <Input
                id="confirm-delete"
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder='Digite "deletar tudo" para confirmar'
                className="w-full"
                disabled={isDeleting}
                autoComplete="off"
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Esta ação não pode ser desfeita. Todos os dados serão
                permanentemente removidos.
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="border-t pt-4 mt-4">
          <Button
            variant="outline"
            onClick={() => {
              setIsOpen(false);
              setConfirmText("");
              setDeleteResult(null);
              setStats(null);
              setError(null);
            }}
            disabled={isDeleting}
          >
            {deleteResult ? "Fechar" : "Cancelar"}
          </Button>

          {!deleteResult && hasTickets && !isLoadingStats && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={!isConfirmValid || isDeleting}
            >
              {isDeleting ? (
                <>
                  <LucideLoader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deletando...
                </>
              ) : (
                <>
                  <LucideTrash2 className="h-4 w-4 mr-2" />
                  Deletar Tudo
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DeleteCompletedTicketsButton;
