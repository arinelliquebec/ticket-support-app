"use server";

import { notFound, redirect } from "next/navigation";
import { getAuth } from "@/features/auth/queries/get-auth";
import { prisma } from "@/lib/prisma";

export const getTicket = async (id: string) => {
  // Obter o usuário autenticado
  const { user } = await getAuth();

  // Se não houver usuário autenticado, redirecionar para login
  if (!user) {
    redirect("/sign-in");
  }

  // Buscar o ticket pelo ID com informações do usuário e categoria
  const ticket = await prisma.ticket.findUnique({
    where: {
      id,
    },
    include: {
      user: {
        select: {
          username: true,
          email: true, // Added email field
          avatarUrl: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
          color: true,
        },
      },
      // Include count of attachments and comments to display badges
      _count: {
        select: {
          attachments: true,
          comments: true,
        },
      },
    },
  });

  // Se o ticket não existir, retornar 404
  if (!ticket) {
    notFound();
  }

  // Verificar se o usuário tem permissão para ver este ticket
  // Administradores podem ver qualquer ticket, usuários apenas seus próprios
  if (user.role !== "ADMIN" && ticket.userId !== user.id) {
    redirect("/access-denied?reason=ticketOwnership");
  }

  return ticket;
};
