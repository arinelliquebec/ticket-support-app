"use server";

import { revalidatePath } from "next/cache";
import { getAuth } from "@/features/auth/queries/get-auth";
import { prisma } from "@/lib/prisma";

/**
 * Admin-specific delete user action that returns a response object
 * instead of redirecting, making it suitable for client components
 */
export async function adminDeleteUser(userId: string) {
  try {
    // Get the authenticated user
    const { user } = await getAuth();

    if (!user) {
      return {
        success: false,
        error: "Usuário não autenticado",
      };
    }

    // Verify admin role
    if (user.role !== "ADMIN") {
      return {
        success: false,
        error: "Somente administradores podem excluir usuários",
      };
    }

    // Prevent admin from deleting themselves
    if (user.id === userId) {
      return {
        success: false,
        error: "Você não pode excluir sua própria conta",
      };
    }

    // Get the user to be deleted
    const userToDelete = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userToDelete) {
      return {
        success: false,
        error: "Usuário não encontrado",
      };
    }

    // PROTEÇÃO: Impedir exclusão do usuário fundador/principal
    if (userToDelete.email === "arinpar@gmail.com") {
      return {
        success: false,
        error: "Este é o usuário fundador do sistema e não pode ser excluído",
      };
    }

    // Delete the user - this will cascade to sessions due to the schema
    await prisma.user.delete({
      where: { id: userId },
    });

    // Revalidate the users path
    revalidatePath("/admin/users");

    // Return success response
    return {
      success: true,
      message: "Usuário excluído com sucesso",
    };
  } catch (error) {
    console.error("Erro ao excluir usuário:", error);

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Falha na exclusão do usuário",
    };
  }
}
