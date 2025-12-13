import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

interface Metrics {
  averageResponseTime: number | null;
  averageResolutionTime: number | null;
  slaCompliance: {
    total: number;
    onTime: number;
    percentage: number;
  };
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  completedTickets: number;
  byPriority: Array<{ priority: string; count: number; percentage: number }>;
  byCategory: Array<{ category: string; count: number; percentage: number }>;
  byFilial: Array<{ filial: string; count: number; percentage: number }>;
  topCategories: Array<{
    name: string;
    count: number;
    avgResolutionTime: number;
  }>;
  responseTimeByPriority: Array<{ priority: string; avgTime: number }>;
  adminMetrics: Array<{
    adminId: string;
    adminName: string;
    adminEmail: string;
    ticketsResponded: number;
    avgResponseTime: number | null;
    ticketsResolved: number;
    avgResolutionTime: number | null;
    slaCompliance: number;
  }>;
}

const formatHours = (hours: number | null): string => {
  if (hours === null) return "N/A";
  if (hours < 1) return `${Math.round(hours * 60)} min`;
  if (hours < 24) return `${hours.toFixed(1)}h`;
  return `${(hours / 24).toFixed(1)} dias`;
};

export function generateMetricsPDF(metrics: Metrics, timeRange: string) {
  const doc = new jsPDF();
  let yPosition = 20;

  // Add logo/title
  doc.setFontSize(20);
  doc.setTextColor(59, 130, 246); // Primary blue
  doc.text("Suporte Fradema", 105, yPosition, { align: "center" });

  yPosition += 10;
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text("Relatório Avançado de Métricas", 105, yPosition, {
    align: "center",
  });

  yPosition += 8;
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  const rangeLabels: Record<string, string> = {
    "7d": "Últimos 7 dias",
    "30d": "Últimos 30 dias",
    "90d": "Últimos 90 dias",
    all: "Todo o período",
  };
  doc.text(`Período: ${rangeLabels[timeRange] || timeRange}`, 105, yPosition, {
    align: "center",
  });

  yPosition += 5;
  doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, 105, yPosition, {
    align: "center",
  });

  yPosition += 10;
  doc.setLineWidth(0.5);
  doc.line(20, yPosition, 190, yPosition);
  yPosition += 10;

  // KPIs Section
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text("📊 Indicadores Principais (KPIs)", 20, yPosition);
  yPosition += 8;

  const kpiData = [
    ["Total de Tickets", metrics.totalTickets.toString()],
    ["Tickets Abertos", metrics.openTickets.toString()],
    ["Em Andamento", metrics.inProgressTickets.toString()],
    ["Concluídos", metrics.completedTickets.toString()],
    [
      "Taxa de Conclusão",
      `${Math.round((metrics.completedTickets / metrics.totalTickets) * 100)}%`,
    ],
    ["Tempo Médio de Resposta", formatHours(metrics.averageResponseTime)],
    ["Tempo Médio de Resolução", formatHours(metrics.averageResolutionTime)],
  ];

  autoTable(doc, {
    startY: yPosition,
    head: [["Métrica", "Valor"]],
    body: kpiData,
    theme: "grid",
    headStyles: { fillColor: [59, 130, 246], textColor: 255 },
    styles: { fontSize: 10 },
    margin: { left: 20, right: 20 },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 10;

  // SLA Compliance Section
  if (yPosition > 240) {
    doc.addPage();
    yPosition = 20;
  }

  doc.setFontSize(14);
  doc.text("🎯 Cumprimento de SLA por Prioridade", 20, yPosition);
  yPosition += 8;

  const slaData = [
    [
      "Geral (120h)",
      metrics.slaCompliance.total.toString(),
      metrics.slaCompliance.onTime.toString(),
      `${metrics.slaCompliance.percentage}%`,
    ],
  ];

  autoTable(doc, {
    startY: yPosition,
    head: [["Prioridade (Meta)", "Total", "No Prazo", "Compliance"]],
    body: slaData,
    theme: "striped",
    headStyles: { fillColor: [59, 130, 246], textColor: 255 },
    styles: { fontSize: 10 },
    margin: { left: 20, right: 20 },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 10;

  // Distribution by Priority
  if (yPosition > 240) {
    doc.addPage();
    yPosition = 20;
  }

  doc.setFontSize(14);
  doc.text("📈 Distribuição por Prioridade", 20, yPosition);
  yPosition += 8;

  const priorityData = metrics.byPriority.map((item) => [
    item.priority,
    item.count.toString(),
    `${item.percentage}%`,
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [["Prioridade", "Quantidade", "Percentual"]],
    body: priorityData,
    theme: "grid",
    headStyles: { fillColor: [59, 130, 246], textColor: 255 },
    styles: { fontSize: 10 },
    margin: { left: 20, right: 20 },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 10;

  // Response Time by Priority
  if (yPosition > 240) {
    doc.addPage();
    yPosition = 20;
  }

  doc.setFontSize(14);
  doc.text("⏰ Tempo de Resposta por Prioridade", 20, yPosition);
  yPosition += 8;

  const responseData = metrics.responseTimeByPriority.map((item) => [
    item.priority,
    formatHours(item.avgTime),
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [["Prioridade", "Tempo Médio"]],
    body: responseData,
    theme: "striped",
    headStyles: { fillColor: [59, 130, 246], textColor: 255 },
    styles: { fontSize: 10 },
    margin: { left: 20, right: 20 },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 10;

  // Top Categories
  if (metrics.topCategories.length > 0) {
    if (yPosition > 240) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.text("🏆 Top Categorias com Tempo de Resolução", 20, yPosition);
    yPosition += 8;

    const categoryData = metrics.topCategories.map((item) => [
      item.name,
      item.count.toString(),
      formatHours(item.avgResolutionTime),
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [["Categoria", "Tickets", "Tempo Médio"]],
      body: categoryData,
      theme: "grid",
      headStyles: { fillColor: [59, 130, 246], textColor: 255 },
      styles: { fontSize: 10 },
      margin: { left: 20, right: 20 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;
  }

  // Distribution by Category
  if (metrics.byCategory.length > 0) {
    if (yPosition > 240) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.text("📂 Distribuição por Categoria", 20, yPosition);
    yPosition += 8;

    const categoryDistData = metrics.byCategory
      .slice(0, 10)
      .map((item) => [
        item.category,
        item.count.toString(),
        `${item.percentage}%`,
      ]);

    autoTable(doc, {
      startY: yPosition,
      head: [["Categoria", "Quantidade", "Percentual"]],
      body: categoryDistData,
      theme: "striped",
      headStyles: { fillColor: [59, 130, 246], textColor: 255 },
      styles: { fontSize: 10 },
      margin: { left: 20, right: 20 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;
  }

  // Distribution by Filial
  if (metrics.byFilial.length > 0) {
    if (yPosition > 240) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.text("🏢 Distribuição por Filial", 20, yPosition);
    yPosition += 8;

    const filialData = metrics.byFilial.map((item) => [
      item.filial,
      item.count.toString(),
      `${item.percentage}%`,
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [["Filial", "Quantidade", "Percentual"]],
      body: filialData,
      theme: "grid",
      headStyles: { fillColor: [59, 130, 246], textColor: 255 },
      styles: { fontSize: 10 },
      margin: { left: 20, right: 20 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;
  }

  // Performance by Admin (Individual Metrics)
  if (metrics.adminMetrics.length > 0) {
    if (yPosition > 240) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setTextColor(220, 38, 38); // Red color for emphasis
    doc.text("👥 Performance Individual por Administrador", 20, yPosition);
    yPosition += 5;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(
      "Métricas de desempenho e produtividade de cada admin",
      20,
      yPosition
    );
    yPosition += 8;
    doc.setTextColor(0, 0, 0);

    const adminData = metrics.adminMetrics.map((admin) => [
      admin.adminName,
      admin.adminEmail,
      admin.ticketsResponded.toString(),
      formatHours(admin.avgResponseTime),
      admin.ticketsResolved.toString(),
      formatHours(admin.avgResolutionTime),
      `${admin.slaCompliance}%`,
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [
        [
          "Administrador",
          "Email",
          "Respostas",
          "Tempo Resp.",
          "Resolvidos",
          "Tempo Resol.",
          "SLA %",
        ],
      ],
      body: adminData,
      theme: "striped",
      headStyles: {
        fillColor: [220, 38, 38],
        textColor: 255,
        fontStyle: "bold",
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      columnStyles: {
        0: { cellWidth: 30 }, // Nome
        1: { cellWidth: 40 }, // Email
        2: { cellWidth: 20, halign: "center" }, // Respostas
        3: { cellWidth: 20, halign: "center" }, // Tempo Resp
        4: { cellWidth: 20, halign: "center" }, // Resolvidos
        5: { cellWidth: 20, halign: "center" }, // Tempo Resol
        6: { cellWidth: 20, halign: "center" }, // SLA
      },
      margin: { left: 20, right: 20 },
      didDrawCell: (data) => {
        // Highlight best performers
        if (data.section === "body" && data.column.index === 6) {
          const slaValue = parseInt(data.cell.text[0]);
          if (slaValue >= 90) {
            // Green background for high performers
            doc.setFillColor(220, 252, 231);
          } else if (slaValue >= 75) {
            // Yellow background for good performers
            doc.setFillColor(254, 249, 195);
          } else if (slaValue < 75 && slaValue > 0) {
            // Red background for low performers
            doc.setFillColor(254, 226, 226);
          }
        }
      },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 5;

    // Add legend for color coding
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(
      "🟢 SLA ≥ 90% (Excelente)  🟡 SLA 75-89% (Bom)  🔴 SLA < 75% (Atenção)",
      20,
      yPosition
    );
  }

  // Add footer with page numbers
  const pageCount = doc.internal.pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Página ${i} de ${pageCount}`, 105, 285, { align: "center" });
    doc.text("Relatório Confidencial - Uso Exclusivo", 105, 290, {
      align: "center",
    });
  }

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().split("T")[0];
  const filename = `relatorio-metricas-${timeRange}-${timestamp}.pdf`;

  // Save the PDF
  doc.save(filename);
}
