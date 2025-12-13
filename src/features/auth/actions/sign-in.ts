"use server";

import { verify } from "@node-rs/argon2";
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

const signInSchema = z.object({
  email: z.string().min(1, { message: "Campo obrigatório" }).max(191).email(),
  password: z.string().min(6).max(191),
});

export const signIn = async (_actionState: ActionState, formData: FormData) => {
  try {
    const { email, password } = signInSchema.parse(
      Object.fromEntries(formData)
    );

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return {
        success: false,
        status: "ERROR",
        message: "Email ou senha incorretos",
        fieldErrors: {},
        payload: formData,
        timestamp: Date.now(),
        data: null,
      } as ActionState;
    }

    const validPassword = await verify(user.passwordHash, password);

    if (!validPassword) {
      return {
        success: false,
        status: "ERROR",
        message: "Email ou senha incorretos",
        fieldErrors: {},
        payload: formData,
        timestamp: Date.now(),
        data: null,
      } as ActionState;
    }

    const session = await lucia.createSession(user.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);

    (await cookies()).set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );
  } catch (error) {
    return fromErrorToActionState(error, formData);
  }

  redirect(ticketsPath());
};
