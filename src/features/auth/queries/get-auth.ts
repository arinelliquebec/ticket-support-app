"use server";

import { cookies } from "next/headers";
import { cache } from "react";
import { lucia } from "@/lib/lucia";
import { prisma } from "@/lib/prisma";

/**
 * Usa React cache() para memoização no nível de request.
 * Para autenticação, isso é apropriado pois queremos sempre
 * verificar a sessão atual sem cache entre requests.
 */
export const getAuth = cache(async () => {
  const sessionId =
    (await cookies()).get(lucia.sessionCookieName)?.value ?? null;

  if (!sessionId) {
    return {
      user: null,
      session: null,
    };
  }

  const result = await lucia.validateSession(sessionId);

  try {
    if (result.session && result.session.fresh) {
      const sessionCookie = lucia.createSessionCookie(result.session.id);
      (await cookies()).set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
      );
    }
    if (!result.session) {
      const sessionCookie = lucia.createBlankSessionCookie();
      (await cookies()).set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
      );
    }
  } catch {
    // do nothing if used in a RSC
  }

  // If we have a user, fetch the role information and avatarUrl
  let userWithRole = null;
  if (result.user) {
    userWithRole = await prisma.user.findUnique({
      where: { id: result.user.id },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        avatarUrl: true,
      },
    });
  }

  return {
    user: userWithRole || result.user,
    session: result.session,
  };
});
