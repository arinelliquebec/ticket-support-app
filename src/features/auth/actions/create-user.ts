"use server";

import { hash } from "@node-rs/argon2";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import {
  ActionState,
  fromErrorToActionState,
  toActionState,
} from "@/components/form/utils/to-action-state";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-check";

const createUserSchema = z.object({
  username: z
    .string()
    .min(1)
    .max(191)
    .refine(
      (value) => !value.includes(" "),
      "Nome de usuário não pode conter espaços"
    ),
  email: z.string().min(1, { message: "Campo obrigatório" }).max(191).email(),
  password: z.string().min(6).max(191),
  role: z.enum(["ADMIN", "USER"]),
});

export const createUser = async (
  _actionState: ActionState,
  formData: FormData
) => {
  try {
    // Verificar se o usuário atual é um administrador antes de prosseguir
    await requireAdmin();

    const data = createUserSchema.parse(Object.fromEntries(formData));
    const { username, email, password, role } = data;

    const passwordHash = await hash(password);

    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        role,
      },
    });

    // Se chegou aqui, a criação foi bem-sucedida
    return {
      success: true,
      status: "SUCCESS",
      message: "Usuário criado com sucesso",
      fieldErrors: {},
      timestamp: Date.now(),
      data: { userId: newUser.id },
    } as ActionState;
  } catch (error) {
    if (error instanceof Error && error.message.includes("redirect")) {
      // Este é um erro de redirecionamento do requireAdmin, não precisa ser tratado aqui
      throw error;
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      // Usar uma abordagem alternativa para criar o objeto de resposta
      return {
        success: false,
        status: "ERROR",
        message: "Email ou nome de usuário já está em uso",
        fieldErrors: {},
        payload: formData,
        timestamp: Date.now(),
        data: null,
      } as ActionState;
    }

    // Usar o fromErrorToActionState para outros erros
    if (error instanceof Error) {
      return {
        success: false,
        status: "ERROR",
        message: error.message,
        fieldErrors: {},
        payload: formData,
        timestamp: Date.now(),
        data: null,
      } as ActionState;
    }

    return {
      success: false,
      status: "ERROR",
      message: "Ocorreu um erro desconhecido",
      fieldErrors: {},
      payload: formData,
      timestamp: Date.now(),
      data: null,
    } as ActionState;
  }
};
