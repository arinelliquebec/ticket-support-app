// src/app/admin/page.tsx - Exemplo de integração correta

"use client";

import { useState, useEffect } from "react";
import { Heading } from "@/components/heading";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  LucideTicket,
  LucideFilter,
  LucideSearch,
  LucideEdit,
  LucideTrash,
  LucideCheckCircle,
  LucidePencil,
  LucideFileText,
  LucideArrowUpRight,
  LucideRefreshCw,
  LucideLoader2,
  LucideBuilding,
  LucideChevronLeft,
  LucideChevronRight,
  LucideBarChart3,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { TICKET_STATUS_LABELS } from "@/features/ticket/constants";
import { ticketPath } from "@/paths";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useCheckRole } from "@/features/auth/hooks/use-check-role";
import { updateTicketStatus } from "@/features/ticket/actions/update-ticket-status";
import { adminDeleteTicket } from "@/features/auth/actions/admin-delete-ticket";
import { toast } from "sonner";
import { CategoryBadge } from "@/features/category/components/category-badge";

// IMPORTAÇÃO CORRETA - Use named import
import { DeleteCompletedTicketsButton } from "@/features/ticket/components/delete-completed-tickets-button";

// Definir filial options
const filialOptions = [
  { value: "Matriz RJ", label: "Matriz Rio de Janeiro" },
  { value: "Filial SP", label: "Filial São Paulo" },
  { value: "Filial CP", label: "Filial Campinas" },
  { value: "Filial RP", label: "Filial Ribeirão Preto" },
  { value: "Filial SC", label: "Filial Joinville" },
  { value: "Filial PR", label: "Filial Curitiba" },
  { value: "Filial ES", label: "Filial Vitória" },
  { value: "Filial DF", label: "Filial Brasília" },
  { value: "Filial PE", label: "Filial Recife" },
  { value: "Filial AM", label: "Filial Manaus" },
  { value: "Filial PIR", label: "Filial Piraúba" },
  { value: "Filial BH", label: "Filial Belo Horizonte" },
  { value: "Filial BA", label: "Filial Salvador" },
  { value: "Filial OL", label: "Filial Orlando" },
  { value: "Filial NY", label: "Filial Nova York" },
];

// Tipo para ticket admin
type AdminTicket = {
  id: string;
  title: string;
  content: string;
  status: "ABERTO" | "EM_ANDAMENTO" | "CONCLUÍDO";
  deadline: string;
  filial: string | null;
  createdAt: string;
  updatedAt: string;
  userId: string | null;
  categoryId?: string | null;
  user?: {
    username: string;
    email?: string;
  } | null;
  category?: {
    id: string;
    name: string;
    color: string;
  } | null;
  _count?: {
    attachments: number;
    comments: number;
  };
};

const AdminTicketsPage = () => {
  // Verificar permissões admin
  const { loading, hasPermission } = useCheckRole("ADMIN", "/access-denied");
  const router = useRouter();
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

  const [tickets, setTickets] = useState<AdminTicket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<AdminTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [filialFilter, setFilialFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Estados para navegação horizontal da tabela
  const [scrollPosition, setScrollPosition] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [tableContainerRef, setTableContainerRef] =
    useState<HTMLDivElement | null>(null);

  // Fetch tickets na montagem do componente
  useEffect(() => {
    fetchTickets();
  }, []);

  // Fetch current user email
  useEffect(() => {
    const fetchUserEmail = async () => {
      try {
        const response = await fetch("/api/check-admin");
        if (response.ok) {
          const data = await response.json();
          setCurrentUserEmail(data.user?.email || null);
        }
      } catch (error) {
        console.error("Error fetching user email:", error);
      }
    };
    fetchUserEmail();
  }, []);

  // Aplicar filtros quando search, status, filial ou ordenação mudar
  useEffect(() => {
    applyFilters();
  }, [search, statusFilter, filialFilter, tickets, sortBy, sortOrder]);

  // Verificar se pode fazer scroll horizontal
  useEffect(() => {
    const checkScrollability = () => {
      if (tableContainerRef) {
        const { scrollLeft, scrollWidth, clientWidth } = tableContainerRef;
        const hasHorizontalScroll = scrollWidth > clientWidth;

        setCanScrollLeft(scrollLeft > 0);
        setCanScrollRight(
          hasHorizontalScroll && scrollLeft < scrollWidth - clientWidth - 1
        );
        setScrollPosition(scrollLeft);
      }
    };

    if (tableContainerRef) {
      // Verificar imediatamente
      checkScrollability();

      // Verificar após um pequeno delay para garantir que o DOM foi renderizado
      setTimeout(checkScrollability, 100);
      setTimeout(checkScrollability, 500);

      tableContainerRef.addEventListener("scroll", checkScrollability);
      window.addEventListener("resize", checkScrollability);

      return () => {
        tableContainerRef.removeEventListener("scroll", checkScrollability);
        window.removeEventListener("resize", checkScrollability);
      };
    }
  }, [tableContainerRef, filteredTickets]);

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/admin-tickets");

      if (!response.ok) {
        throw new Error("Falha ao carregar tickets");
      }

      const data = await response.json();
      setTickets(data);

      // Forçar verificação de scroll após definir os dados
      setTimeout(() => {
        if (tableContainerRef) {
          const { scrollLeft, scrollWidth, clientWidth } = tableContainerRef;
          const hasHorizontalScroll = scrollWidth > clientWidth;
          setCanScrollLeft(scrollLeft > 0);
          setCanScrollRight(hasHorizontalScroll);
        }
      }, 300);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Falha ao carregar tickets"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    setIsRefreshing(true);
    await fetchTickets();
    setIsRefreshing(false);

    // Forçar verificação de scroll após carregar dados
    setTimeout(() => {
      if (tableContainerRef) {
        const { scrollLeft, scrollWidth, clientWidth } = tableContainerRef;
        const hasHorizontalScroll = scrollWidth > clientWidth;
        setCanScrollLeft(scrollLeft > 0);
        setCanScrollRight(
          hasHorizontalScroll && scrollLeft < scrollWidth - clientWidth - 1
        );
      }
    }, 200);
  };

  const applyFilters = () => {
    let result = [...tickets];

    // Aplicar filtro de busca
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (ticket) =>
          ticket.title.toLowerCase().includes(searchLower) ||
          ticket.content.toLowerCase().includes(searchLower) ||
          ticket.user?.username.toLowerCase().includes(searchLower) ||
          (ticket.user?.email &&
            ticket.user.email.toLowerCase().includes(searchLower))
      );
    }

    // Aplicar filtro de status
    if (statusFilter && statusFilter !== "all") {
      result = result.filter((ticket) => ticket.status === statusFilter);
    }

    // Aplicar filtro de filial
    if (filialFilter && filialFilter !== "all") {
      result = result.filter((ticket) => ticket.filial === filialFilter);
    }

    // Aplicar ordenação
    result.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case "createdAt":
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case "updatedAt":
          aValue = new Date(a.updatedAt).getTime();
          bValue = new Date(b.updatedAt).getTime();
          break;
        case "deadline":
          aValue = new Date(a.deadline).getTime();
          bValue = new Date(b.deadline).getTime();
          break;
        case "title":
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        default:
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });

    setFilteredTickets(result);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
  };

  const handleFilialFilterChange = (value: string) => {
    setFilialFilter(value);
  };

  // Funções para navegação horizontal
  const scrollLeft = () => {
    if (tableContainerRef) {
      const scrollAmount = 300;
      tableContainerRef.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (tableContainerRef) {
      const scrollAmount = 300;
      tableContainerRef.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const scrollToStart = () => {
    if (tableContainerRef) {
      tableContainerRef.scrollTo({ left: 0, behavior: "smooth" });
    }
  };

  const scrollToEnd = () => {
    if (tableContainerRef) {
      tableContainerRef.scrollTo({
        left: tableContainerRef.scrollWidth,
        behavior: "smooth",
      });
    }
  };

  // Suporte para navegação por teclado (← → Home End)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return; // Não interferir com inputs
      }

      if (e.key === "ArrowLeft" && canScrollLeft) {
        e.preventDefault();
        scrollLeft();
      } else if (e.key === "ArrowRight" && canScrollRight) {
        e.preventDefault();
        scrollRight();
      } else if (e.key === "Home" && canScrollLeft) {
        e.preventDefault();
        scrollToStart();
      } else if (e.key === "End" && canScrollRight) {
        e.preventDefault();
        scrollToEnd();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canScrollLeft, canScrollRight]);

  const handleUpdateStatus = async (
    ticketId: string,
    newStatus: "ABERTO" | "EM_ANDAMENTO" | "CONCLUÍDO"
  ) => {
    try {
      const result = await updateTicketStatus(ticketId, newStatus);

      if (result.status === "SUCCESS") {
        setTickets((prev) =>
          prev.map((ticket) =>
            ticket.id === ticketId ? { ...ticket, status: newStatus } : ticket
          )
        );

        toast.success(
          `Status do ticket atualizado para ${TICKET_STATUS_LABELS[newStatus]}`
        );
      } else {
        toast.error(result.message || "Falha ao atualizar o status");
      }
    } catch (error) {
      toast.error("Um erro ocorreu ao atualizar o status do ticket");
    }
  };

  const openDeleteDialog = (ticketId: string) => {
    setTicketToDelete(ticketId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteTicket = async () => {
    if (!ticketToDelete) return;

    try {
      setIsDeleting(true);

      const result = await adminDeleteTicket(ticketToDelete);

      if (result.success) {
        setTickets((prev) =>
          prev.filter((ticket) => ticket.id !== ticketToDelete)
        );

        toast.success(result.message || "Ticket excluído com sucesso");
      } else {
        toast.error(result.error || "Falha ao excluir o ticket");
      }

      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast.error("Erro ao excluir o ticket");
    } finally {
      setIsDeleting(false);
      setTicketToDelete(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ABERTO":
        return (
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
            <LucideFileText className="h-3.5 w-3.5 mr-1" />
            {TICKET_STATUS_LABELS.ABERTO}
          </Badge>
        );
      case "EM_ANDAMENTO":
        return (
          <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
            <LucidePencil className="h-3.5 w-3.5 mr-1" />
            {TICKET_STATUS_LABELS.EM_ANDAMENTO}
          </Badge>
        );
      case "CONCLUÍDO":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
            <LucideCheckCircle className="h-3.5 w-3.5 mr-1" />
            {TICKET_STATUS_LABELS.CONCLUÍDO}
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <LucideLoader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!hasPermission) {
    return null;
  }

  return (
    <div className="flex-1 flex flex-col gap-y-8 max-w-7xl mx-auto w-full px-4 pb-12">
      <div className="bg-gradient-to-r from-primary/5 to-transparent -mx-4 -mt-4 px-4 pt-4 pb-6 border-b border-muted/10">
        <Heading
          title="Gerenciamento de Tickets"
          description="Ver e gerenciar todos os tickets de suporte"
          icon={<LucideTicket className="h-8 w-8 text-primary" />}
        />
      </div>

      {/* Seção de Ações Administrativas */}
      <div className="p-4 bg-secondary/10 rounded-lg border border-muted/30">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="font-semibold text-lg">Ações Administrativas</h3>
            <p className="text-sm text-muted-foreground">
              Gerencie tickets em massa e execute operações administrativas
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Botões exclusivos para Tio Valdo (arinpar@gmail.com) */}
            {currentUserEmail === "arinpar@gmail.com" && (
              <>
                {/* Link para Relatório Avançado - Exclusivo */}
                <Button asChild variant="outline" className="shadow-sm gap-2">
                  <Link href="/admin/metrics">
                    <LucideBarChart3 className="h-4 w-4" />
                    Relatório Avançado
                  </Link>
                </Button>

                {/* Link para Dashboard KPIs em Tempo Real - Exclusivo */}
                <Button
                  asChild
                  variant="default"
                  className="shadow-sm gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  <Link href="/dashboard/realtime">
                    <LucideBarChart3 className="h-4 w-4 animate-pulse" />
                    KPIs em Tempo Real
                    <Badge className="ml-2 bg-white/20 text-white">
                      Premium
                    </Badge>
                  </Link>
                </Button>
              </>
            )}

            {/* COMPONENTE INTEGRADO CORRETAMENTE */}
            <DeleteCompletedTicketsButton
              onSuccess={() => {
                // Recarrega dados após exclusão bem-sucedida
                refreshData();
                toast.success("Lista de tickets atualizada");
              }}
              className="shadow-sm"
            />

            {/* Outros botões administrativos podem ser adicionados aqui */}
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-auto sm:min-w-[300px]">
            <LucideSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar tickets..."
              className="pl-10 rounded-lg border-muted/30 focus-visible:ring-primary/50"
              value={search}
              onChange={handleSearchChange}
            />
          </div>

          <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              <SelectItem value="ABERTO">Aberto</SelectItem>
              <SelectItem value="EM_ANDAMENTO">Em Andamento</SelectItem>
              <SelectItem value="CONCLUÍDO">Concluído</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filialFilter} onValueChange={handleFilialFilterChange}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Selecionar por filial" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Filiais</SelectItem>
              {filialOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Ordenação por campo */}
          <Select value={sortBy} onValueChange={(value) => setSortBy(value)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">Data de Criação</SelectItem>
              <SelectItem value="updatedAt">Data de Atualização</SelectItem>
              <SelectItem value="deadline">Prazo</SelectItem>
              <SelectItem value="title">Título</SelectItem>
            </SelectContent>
          </Select>

          {/* Ordem ascendente/descendente */}
          <Select
            value={sortOrder}
            onValueChange={(value: "asc" | "desc") => setSortOrder(value)}
          >
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="Ordem" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Mais Recente</SelectItem>
              <SelectItem value="asc">Mais Antigo</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            onClick={refreshData}
            disabled={isRefreshing}
          >
            <LucideRefreshCw
              className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </div>

      {/* Navegação horizontal sticky */}
      {filteredTickets.length > 0 && (
        <div className="sticky top-16 z-40 mb-4">
          <div className="bg-background/95 backdrop-blur-md border-2 border-primary/30 rounded-lg shadow-lg px-4 py-3">
            <div className="flex items-center justify-center gap-3">
              {/* Botão Início */}
              <Button
                variant="ghost"
                size="sm"
                onClick={scrollToStart}
                className="hover:bg-primary hover:text-primary-foreground transition-all"
                title="Ir para o início (Home)"
              >
                <span className="text-lg">⏮</span>
              </Button>

              {/* Botão Anterior */}
              <Button
                variant="default"
                size="sm"
                onClick={scrollLeft}
                className="transition-all"
                title="Anterior (←)"
              >
                <LucideChevronLeft className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">Anterior</span>
              </Button>

              {/* Indicador de posição */}
              <div className="flex flex-col items-center gap-1 px-4">
                <div className="text-xs text-muted-foreground font-medium whitespace-nowrap">
                  Navegação Horizontal
                </div>
                <div className="flex gap-1">
                  {[0, 1, 2, 3, 4].map((i) => {
                    const progress = tableContainerRef
                      ? scrollPosition /
                        Math.max(
                          1,
                          tableContainerRef.scrollWidth -
                            tableContainerRef.clientWidth
                        )
                      : 0;
                    const isActive =
                      progress >= i / 5 && progress < (i + 1) / 5;
                    return (
                      <div
                        key={i}
                        className={`h-1.5 rounded-full transition-all ${
                          isActive
                            ? "bg-primary w-4"
                            : "bg-muted-foreground/30 w-1.5"
                        }`}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Botão Próximo */}
              <Button
                variant="default"
                size="sm"
                onClick={scrollRight}
                className="transition-all"
                title="Próximo (→)"
              >
                <span className="text-sm font-medium">Próximo</span>
                <LucideChevronRight className="h-4 w-4 ml-1" />
              </Button>

              {/* Botão Fim */}
              <Button
                variant="ghost"
                size="sm"
                onClick={scrollToEnd}
                className="hover:bg-primary hover:text-primary-foreground transition-all"
                title="Ir para o fim (End)"
              >
                <span className="text-lg">⏭</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Tabela de tickets */}
      {isLoading ? (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
            </div>
          </CardContent>
        </Card>
      ) : error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : (
        <Card className="border-muted/30 shadow-sm overflow-hidden">
          {/* Barra de progresso de scroll */}
          {filteredTickets.length > 0 && (
            <div className="h-2 bg-muted/20">
              <div
                className="h-full bg-primary/70 transition-all duration-300"
                style={{
                  width:
                    tableContainerRef &&
                    tableContainerRef.scrollWidth >
                      tableContainerRef.clientWidth
                      ? `${Math.max(
                          0,
                          Math.min(
                            100,
                            (scrollPosition /
                              Math.max(
                                1,
                                tableContainerRef.scrollWidth -
                                  tableContainerRef.clientWidth
                              )) *
                              100
                          )
                        )}%`
                      : "0%",
                }}
              />
            </div>
          )}

          {/* Container da tabela com scroll horizontal */}
          <div
            className="overflow-x-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent"
            ref={setTableContainerRef}
          >
            <div style={{ minWidth: "1800px", width: "1800px" }}>
              <Table
                className="w-full"
                style={{
                  minWidth: "1800px",
                  width: "1800px",
                }}
              >
                <TableHeader>
                  <TableRow>
                    <TableHead style={{ minWidth: "200px" }}>Título</TableHead>
                    <TableHead style={{ minWidth: "150px" }}>Status</TableHead>
                    <TableHead style={{ minWidth: "150px" }}>
                      Criado por
                    </TableHead>
                    <TableHead style={{ minWidth: "200px" }}>Email</TableHead>
                    <TableHead style={{ minWidth: "150px" }}>
                      Categoria
                    </TableHead>
                    <TableHead style={{ minWidth: "150px" }}>Filial</TableHead>
                    <TableHead style={{ minWidth: "120px" }}>
                      Data Criação
                    </TableHead>
                    <TableHead
                      className="text-right"
                      style={{ minWidth: "200px" }}
                    >
                      Ações
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTickets.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center py-8 text-muted-foreground"
                      >
                        Nenhum ticket encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTickets.map((ticket) => (
                      <TableRow key={ticket.id}>
                        <TableCell className="font-medium max-w-[200px] truncate">
                          {ticket.title}
                        </TableCell>
                        <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                        <TableCell>{ticket.user?.username || "N/A"}</TableCell>
                        <TableCell>{ticket.user?.email || "N/A"}</TableCell>
                        <TableCell>
                          {ticket.category ? (
                            <CategoryBadge
                              name={ticket.category.name}
                              color={ticket.category.color}
                              className="h-6 text-xs"
                            />
                          ) : (
                            <span className="text-muted-foreground text-xs">
                              None
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {ticket.filial ? (
                            <div className="flex items-center gap-1">
                              <LucideBuilding className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>{ticket.filial}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs">
                              None
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {format(new Date(ticket.createdAt), "dd/MM/yyyy", {
                            locale: ptBR,
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={ticketPath(ticket.id)}>
                                <LucideArrowUpRight className="h-4 w-4" />
                              </Link>
                            </Button>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                  Status
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleUpdateStatus(ticket.id, "ABERTO")
                                  }
                                  disabled={ticket.status === "ABERTO"}
                                >
                                  <LucideFileText className="h-4 w-4 mr-2" />
                                  Aberto
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleUpdateStatus(
                                      ticket.id,
                                      "EM_ANDAMENTO"
                                    )
                                  }
                                  disabled={ticket.status === "EM_ANDAMENTO"}
                                >
                                  <LucidePencil className="h-4 w-4 mr-2" />
                                  Em Andamento
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleUpdateStatus(ticket.id, "CONCLUÍDO")
                                  }
                                  disabled={ticket.status === "CONCLUÍDO"}
                                >
                                  <LucideCheckCircle className="h-4 w-4 mr-2" />
                                  Concluído
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>

                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/tickets/${ticket.id}/edit`}>
                                <LucideEdit className="h-4 w-4" />
                              </Link>
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openDeleteDialog(ticket.id)}
                              className="text-destructive hover:bg-destructive/10"
                            >
                              <LucideTrash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </Card>
      )}

      {/* Dialog de confirmação de exclusão */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Deletar Ticket</DialogTitle>
            <DialogDescription>
              Você tem certeza que deseja deletar este ticket? Esta ação não
              pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-between">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteTicket}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <LucideLoader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deletando...
                </>
              ) : (
                <>
                  <LucideTrash className="h-4 w-4 mr-2" />
                  Deletar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTicketsPage;
