// prisma/migrations/add_performance_indexes.sql
-- Índice composto para queries de filtro comuns
CREATE INDEX "idx_ticket_status_userid_createdat"
ON "Ticket"("status", "userId", "createdAt" DESC);

-- Índice para busca por categoria e status
CREATE INDEX "idx_ticket_categoryid_status"
ON "Ticket"("categoryId", "status");

-- Índice para busca por filial
CREATE INDEX "idx_ticket_filial_status"
ON "Ticket"("filial", "status")
WHERE "filial" IS NOT NULL;

-- Índice para ordenação por deadline
CREATE INDEX "idx_ticket_deadline_status"
ON "Ticket"("deadline", "status");

-- Índice parcial para tickets não concluídos (mais consultados)
CREATE INDEX "idx_ticket_active"
ON "Ticket"("createdAt" DESC)
WHERE "status" != 'CONCLUÍDO';