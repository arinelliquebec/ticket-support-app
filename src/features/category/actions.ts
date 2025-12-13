"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  ActionState,
  fromErrorToActionState,
} from "@/components/form/utils/to-action-state";
import { getAuth } from "@/features/auth/queries/get-auth";
import { prisma } from "@/lib/prisma";

// Function with proper generic typing
const createActionState = <T = unknown>(
  status: "SUCCESS" | "ERROR",
  message: string,
  formData?: FormData,
  data?: T
): ActionState & { data?: T } => {
  return {
    success: status === "SUCCESS",
    data: data as any,
    status,
    message,
    fieldErrors: {},
    payload: formData,
    timestamp: Date.now(),
  };
};

const categorySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
  color: z.string().regex(/^#([A-Fa-f0-9]{6})$/, "Cor inválida"),
  description: z.string().optional(),
  icon: z.string().optional(),
});

export const createCategory = async (
  _actionState: ActionState,
  formData: FormData
) => {
  try {
    // Verificar autenticação e permissão
    const { user } = await getAuth();
    if (!user) {
      return createActionState("ERROR", "Usuário não autenticado");
    }

    if (user.role !== "ADMIN") {
      return createActionState(
        "ERROR",
        "Apenas administradores podem criar categorias"
      );
    }

    // Validar dados
    const validatedData = categorySchema.parse(Object.fromEntries(formData));

    // Verificar se já existe uma categoria com o mesmo nome
    const existingCategory = await prisma.ticketCategory.findFirst({
      where: {
        name: {
          equals: validatedData.name,
          mode: "insensitive",
        },
      },
    });

    if (existingCategory) {
      return createActionState(
        "ERROR",
        "Já existe uma categoria com este nome"
      );
    }

    // Criar categoria
    const category = await prisma.ticketCategory.create({
      data: validatedData,
    });

    // Revalidar paths relevantes
    revalidatePath("/admin/categories");
    revalidatePath("/tickets");

    return createActionState(
      "SUCCESS",
      "Categoria criada com sucesso",
      undefined,
      category
    );
  } catch (error) {
    return fromErrorToActionState(error, formData);
  }
};

export const updateCategory = async (
  id: string,
  _actionState: ActionState,
  formData: FormData
) => {
  try {
    // Verificar autenticação e permissão
    const { user } = await getAuth();
    if (!user) {
      return createActionState("ERROR", "Usuário não autenticado");
    }

    if (user.role !== "ADMIN") {
      return createActionState(
        "ERROR",
        "Apenas administradores podem editar categorias"
      );
    }

    // Validar dados
    const validatedData = categorySchema.parse(Object.fromEntries(formData));

    // Verificar se a categoria existe
    const category = await prisma.ticketCategory.findUnique({
      where: { id },
    });

    if (!category) {
      return createActionState("ERROR", "Categoria não encontrada");
    }

    // Verificar se o nome já está em uso (exceto pela própria categoria)
    if (validatedData.name !== category.name) {
      const existingCategory = await prisma.ticketCategory.findFirst({
        where: {
          name: {
            equals: validatedData.name,
            mode: "insensitive",
          },
          id: {
            not: id,
          },
        },
      });

      if (existingCategory) {
        return createActionState(
          "ERROR",
          "Já existe uma categoria com este nome"
        );
      }
    }

    // Atualizar categoria
    const updatedCategory = await prisma.ticketCategory.update({
      where: { id },
      data: validatedData,
    });

    // Revalidar paths relevantes
    revalidatePath("/admin/categories");
    revalidatePath("/tickets");

    return createActionState(
      "SUCCESS",
      "Categoria atualizada com sucesso",
      undefined,
      updatedCategory
    );
  } catch (error) {
    return fromErrorToActionState(error, formData);
  }
};

export const deleteCategory = async (id: string) => {
  try {
    // Verificar autenticação e permissão
    const { user } = await getAuth();
    if (!user) {
      return createActionState("ERROR", "Usuário não autenticado");
    }

    if (user.role !== "ADMIN") {
      return createActionState(
        "ERROR",
        "Apenas administradores podem excluir categorias"
      );
    }

    // Verificar se a categoria existe
    const category = await prisma.ticketCategory.findUnique({
      where: { id },
      include: {
        tickets: true,
      },
    });

    if (!category) {
      return createActionState("ERROR", "Categoria não encontrada");
    }

    // Remover a categoria dos tickets associados
    if (category.tickets.length > 0) {
      await prisma.ticket.updateMany({
        where: {
          categoryId: id,
        },
        data: {
          categoryId: null,
        },
      });
    }

    // Excluir a categoria
    await prisma.ticketCategory.delete({
      where: { id },
    });

    // Revalidar paths relevantes
    revalidatePath("/admin/categories");
    revalidatePath("/tickets");

    return createActionState("SUCCESS", "Categoria excluída com sucesso");
  } catch (error) {
    return fromErrorToActionState(error);
  }
};

export const getCategories = async () => {
  try {
    // Buscar todas as categorias
    const categories = await prisma.ticketCategory.findMany({
      orderBy: {
        name: "asc",
      },
      include: {
        _count: {
          select: {
            tickets: true,
          },
        },
      },
    });

    return categories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
};
