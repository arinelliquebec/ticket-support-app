"use server";

import { z } from "zod";
import {
  ActionState,
  fromErrorToActionState,
} from "@/components/form/utils/to-action-state";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-check";

const updateRoleSchema = z.object({
  userId: z.string(),
  role: z.enum(["ADMIN", "USER"]),
});

export const updateUserRole = async (
  _actionState: ActionState,
  formData: FormData
): Promise<ActionState> => {
  try {
    // Verify current user is an admin
    const adminUser = await requireAdmin();

    // Parse and validate form data
    const { userId, role } = updateRoleSchema.parse(
      Object.fromEntries(formData)
    );

    // Prevent admins from downgrading themselves
    if (userId === adminUser.id && role !== "ADMIN") {
      return {
        success: false,
        data: undefined,
        status: "ERROR",
        message:
          "Você não pode remover seus próprios privilégios de administrador",
        fieldErrors: {},
        timestamp: Date.now(),
      };
    }

    // PROTEÇÃO: Impedir alteração da role do usuário fundador
    const userToUpdate = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (userToUpdate?.email === "arinpar@gmail.com" && role !== "ADMIN") {
      return {
        success: false,
        data: undefined,
        status: "ERROR",
        message:
          "O usuário fundador não pode ter seus privilégios de administrador removidos",
        fieldErrors: {},
        timestamp: Date.now(),
      };
    }

    // Update user role in database
    await prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    // Revalidate UI
    revalidatePath("/admin/users");

    return {
      success: true,
      data: undefined,
      status: "SUCCESS",
      message: "Permissões atualizadas com sucesso",
      fieldErrors: {},
      timestamp: Date.now(),
    };
  } catch (error) {
    // If it's a redirect error from requireAdmin, let it propagate
    if (error instanceof Error && error.message.includes("redirect")) {
      throw error;
    }

    // Standard error handling for all other errors
    return fromErrorToActionState(error, formData);
  }
};
