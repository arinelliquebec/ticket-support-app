-- Add TicketPriority enum
CREATE TYPE "TicketPriority" AS ENUM ('BAIXA', 'MEDIA', 'ALTA', 'URGENTE');

-- Add priority column to Ticket table with default value MEDIA
ALTER TABLE "Ticket" ADD COLUMN "priority" "TicketPriority" NOT NULL DEFAULT 'MEDIA';

-- Create index on priority column for better query performance
CREATE INDEX "Ticket_priority_idx" ON "Ticket"("priority");

-- Create composite index on status and priority for common queries
CREATE INDEX "Ticket_status_priority_idx" ON "Ticket"("status", "priority");

-- Update existing tickets to have MEDIA priority (already set by default)
-- This is just for documentation purposes
COMMENT ON COLUMN "Ticket"."priority" IS 'Prioridade do ticket: BAIXA, MEDIA, ALTA ou URGENTE';

