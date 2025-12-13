"use client";

import { Ticket, TicketStatus } from "@prisma/client";
import { LucideTrash } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useConfirmDialog } from "@/components/confirm-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteTicket } from "../actions/delete-ticket";
import { updateTicketStatus } from "../actions/update-ticket-status";
import { TICKET_STATUS_LABELS } from "../constants";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { ticketsPath } from "@/paths";

type TicketMoreMenuProps = {
  ticket: Ticket;
  trigger: React.ReactElement;
};

const TicketMoreMenu = ({ ticket, trigger }: TicketMoreMenuProps) => {
  const { user } = useAuth();
  const router = useRouter();

  // Check if user is admin (only admins can change status)
  const isAdmin = user?.role === "ADMIN";

  // Fix: Properly pass a React element as the trigger prop
  const [deleteButton, deleteDialog] = useConfirmDialog({
    title: "Deletar Ticket",
    description:
      "Você tem certeza que deseja deletar este ticket? Esta ação não pode ser desfeita.",
    action: async () => {
      const result = await deleteTicket(ticket.id);

      // Se deletado com sucesso, redirecionar para lista de tickets
      if (result.status === "SUCCESS") {
        setTimeout(() => {
          router.push(ticketsPath());
          router.refresh();
        }, 500);
      }

      return result;
    },
    trigger: (
      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
        <LucideTrash className="h-4 w-4 mr-2" />
        <span>Deletar</span>
      </DropdownMenuItem>
    ),
  });

  const handleUpdateTicketStatus = async (value: string) => {
    // Only allow admins to update status
    if (!isAdmin) {
      toast.error("Somente Administradores podem atualizar o status");
      return;
    }

    const promise = updateTicketStatus(ticket.id, value as TicketStatus);

    toast.promise(promise, {
      loading: "Atualizando o status ...",
      success: "Status atualizado com sucesso",
      error: "Falha ao atualizar o status",
    });

    const result = await promise;

    if (result && result.status === "ERROR") {
      toast.error(result.message);
    }
  };

  const ticketStatusRadioGroupItems = isAdmin ? (
    <DropdownMenuRadioGroup
      value={ticket.status}
      onValueChange={handleUpdateTicketStatus}
    >
      {(Object.keys(TICKET_STATUS_LABELS) as Array<TicketStatus>).map((key) => (
        <DropdownMenuRadioItem key={key} value={key}>
          {TICKET_STATUS_LABELS[key]}
        </DropdownMenuRadioItem>
      ))}
    </DropdownMenuRadioGroup>
  ) : null;

  return (
    <>
      {deleteDialog}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" side="right">
          {ticketStatusRadioGroupItems}
          {isAdmin && ticketStatusRadioGroupItems && <DropdownMenuSeparator />}
          {deleteButton}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export { TicketMoreMenu };
