"use server";

import { hash } from "@node-rs/argon2";
import { Prisma } from "@prisma/client";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  ActionState,
  fromErrorToActionState,
} from "@/components/form/utils/to-action-state";
import { lucia } from "@/lib/lucia";
import { prisma } from "@/lib/prisma";
import { ticketsPath } from "@/paths";

const signUpSchema = z
  .object({
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
    confirmPassword: z.string().min(6).max(191),
    role: z.enum(["ADMIN", "USER"]).optional(),
  })
  .superRefine(({ password, confirmPassword }, ctx) => {
    if (password !== confirmPassword) {
      ctx.addIssue({
        code: "custom",
        message: "As senhas não coincidem",
        path: ["confirmPassword"],
      });
    }
  });

export const signUp = async (_actionState: ActionState, formData: FormData) => {
  try {
    const {
      username,
      email,
      password,
      role = "USER",
    } = signUpSchema.parse(Object.fromEntries(formData));

    // Check if this is the first user - make them an admin
    const usersCount = await prisma.user.count();
    const isFirstUser = usersCount === 0;
    const userRole = isFirstUser ? "ADMIN" : role;

    const passwordHash = await hash(password);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        role: userRole,
      },
    });

    const session = await lucia.createSession(user.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);

    (await cookies()).set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        status: "ERROR",
        message: "Email ou nome de usuário já está em uso",
        fieldErrors: {},
        payload: formData,
        timestamp: Date.now(),
      } as ActionState;
    }

    return fromErrorToActionState(error, formData);
  }

  redirect(ticketsPath());
};
