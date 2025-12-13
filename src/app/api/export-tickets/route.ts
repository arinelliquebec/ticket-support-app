// src/app/api/export-tickets/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/features/auth/queries/get-auth";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const { user } = await getAuth();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Obter parâmetros da query
    const { searchParams } = request.nextUrl;
    const format = searchParams.get("format") || "full";
    const status = searchParams.get("status");
    const categoryId = searchParams.get("categoryId");
    const filial = searchParams.get("filial");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    // Construir where clause
    const where: Prisma.TicketWhereInput = {};

    // Admin vê todos os tickets, usuário vê apenas os seus
    if (user.role !== "ADMIN") {
      where.userId = user.id;
    }

    // Aplicar filtros
    if (status) where.status = status as any;
    if (categoryId) where.categoryId = categoryId;
    if (filial) where.filial = filial;

    // Filtros de data
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        where.createdAt.lte = endDate;
      }
    }

    // Buscar tickets
    const tickets = await prisma.ticket.findMany({
      where,
      include: {
        user: {
          select: {
            username: true,
            email: true,
          },
        },
        category: {
          select: {
            name: true,
            color: true,
          },
        },
        comments: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            user: {
              select: {
                username: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        attachments: {
          select: {
            id: true,
            fileName: true,
            fileSize: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Criar workbook
    const workbook = XLSX.utils.book_new();

    if (format === "full") {
      // Planilha 1: Dados dos Tickets
      const ticketsData = tickets.map((ticket) => ({
        ID: ticket.id,
        Título: ticket.title,
        Descrição: ticket.content,
        Status: getStatusLabel(ticket.status),
        Categoria: ticket.category?.name || "Sem categoria",
        "Cor Categoria": ticket.category?.color || "",
        Filial: ticket.filial || "Sem filial",
        "Criado por": ticket.user?.username || "Usuário removido",
        Email: ticket.user?.email || "N/A",
        "Data de Criação": formatDate(ticket.createdAt),
        "Última Atualização": formatDate(ticket.updatedAt),
        Prazo: ticket.deadline,
        "Nº Comentários": ticket.comments.length,
        "Nº Anexos": ticket.attachments.length,
        "Último Comentário": ticket.comments[0]?.content || "Sem comentários",
        "Arquivos Anexados":
          ticket.attachments.map((a) => a.fileName).join(", ") || "Nenhum",
      }));

      const ticketsSheet = XLSX.utils.json_to_sheet(ticketsData);

      // Ajustar largura das colunas
      ticketsSheet["!cols"] = [
        { wch: 15 }, // ID
        { wch: 30 }, // Título
        { wch: 50 }, // Descrição
        { wch: 15 }, // Status
        { wch: 20 }, // Categoria
        { wch: 10 }, // Cor
        { wch: 20 }, // Filial
        { wch: 20 }, // Criado por
        { wch: 25 }, // Email
        { wch: 20 }, // Data Criação
        { wch: 20 }, // Última Atualização
        { wch: 15 }, // Prazo
        { wch: 15 }, // Nº Comentários
        { wch: 15 }, // Nº Anexos
        { wch: 40 }, // Último Comentário
        { wch: 40 }, // Arquivos
      ];

      XLSX.utils.book_append_sheet(workbook, ticketsSheet, "Tickets");

      // Planilha 2: Comentários (se houver)
      const allComments = tickets.flatMap((ticket) =>
        ticket.comments.map((comment) => ({
          "ID Ticket": ticket.id,
          "Título Ticket": ticket.title,
          Autor: comment.user.username,
          Comentário: comment.content,
          Data: formatDate(comment.createdAt),
        }))
      );

      if (allComments.length > 0) {
        const commentsSheet = XLSX.utils.json_to_sheet(allComments);
        commentsSheet["!cols"] = [
          { wch: 15 }, // ID Ticket
          { wch: 30 }, // Título
          { wch: 20 }, // Autor
          { wch: 60 }, // Comentário
          { wch: 20 }, // Data
        ];
        XLSX.utils.book_append_sheet(workbook, commentsSheet, "Comentários");
      }
    }

    // Planilha de Resumo (sempre incluída)
    const summaryData = createSummaryData(tickets, user);
    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    summarySheet["!cols"] = [{ wch: 40 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(
      workbook,
      summarySheet,
      format === "summary" ? "Resumo" : "Estatísticas"
    );

    // Converter para buffer
    const excelBuffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    // Gerar nome do arquivo
    const date = new Date().toISOString().slice(0, 10);
    const fileName = `tickets_${format}_${date}_${user.username}.xlsx`;

    // Retornar o arquivo Excel
    return new NextResponse(excelBuffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Error exporting tickets:", error);
    return NextResponse.json(
      { error: "Failed to export tickets" },
      { status: 500 }
    );
  }
}

// Funções auxiliares
function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    ABERTO: "Aberto",
    EM_ANDAMENTO: "Em Andamento",
    CONCLUÍDO: "Concluído",
  };
  return labels[status] || status;
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function createSummaryData(tickets: any[], user: any) {
  const data = [
    { Métrica: "Exportado por", Valor: user.username },
    { Métrica: "Data da Exportação", Valor: formatDate(new Date()) },
    { Métrica: "Total de Tickets", Valor: tickets.length },
    {
      Métrica: "Tickets Abertos",
      Valor: tickets.filter((t) => t.status === "ABERTO").length,
    },
    {
      Métrica: "Tickets Em Andamento",
      Valor: tickets.filter((t) => t.status === "EM_ANDAMENTO").length,
    },
    {
      Métrica: "Tickets Concluídos",
      Valor: tickets.filter((t) => t.status === "CONCLUÍDO").length,
    },
    { Métrica: "", Valor: "" }, // Linha vazia
    { Métrica: "POR CATEGORIA", Valor: "Quantidade" },
  ];

  // Contagem por categoria
  const categoryCounts = tickets.reduce((acc, ticket) => {
    const category = ticket.category?.name || "Sem categoria";
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  Object.entries(categoryCounts)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .forEach(([category, count]) => {
      data.push({ Métrica: `- ${category}`, Valor: count });
    });

  data.push({ Métrica: "", Valor: "" }); // Linha vazia
  data.push({ Métrica: "POR FILIAL", Valor: "Quantidade" });

  // Contagem por filial
  const filialCounts = tickets.reduce((acc, ticket) => {
    const filial = ticket.filial || "Sem filial";
    acc[filial] = (acc[filial] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  Object.entries(filialCounts)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .forEach(([filial, count]) => {
      data.push({ Métrica: `- ${filial}`, Valor: count });
    });

  // Estatísticas de tempo
  if (tickets.length > 0) {
    data.push({ Métrica: "", Valor: "" });
    data.push({ Métrica: "ESTATÍSTICAS DE TEMPO", Valor: "" });

    const now = new Date();
    const openTickets = tickets.filter((t) => t.status === "ABERTO");

    if (openTickets.length > 0) {
      const avgOpenTime =
        openTickets.reduce((sum, ticket) => {
          const created = new Date(ticket.createdAt);
          return sum + (now.getTime() - created.getTime());
        }, 0) / openTickets.length;

      const avgDays = Math.floor(avgOpenTime / (1000 * 60 * 60 * 24));
      data.push({
        Métrica: "Tempo médio aberto",
        Valor: `${avgDays} dias`,
      });
    }
  }

  return data;
}
