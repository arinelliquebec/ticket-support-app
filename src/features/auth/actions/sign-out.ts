"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { lucia } from "@/lib/lucia";
import { signInPath } from "@/paths";
import { getAuth } from "../queries/get-auth";

export const signOut = async () => {
  try {
    const { session } = await getAuth();

    if (!session) {
      return { success: false, error: "No active session" };
    }

    await lucia.invalidateSession(session.id);

    const sessionCookie = lucia.createBlankSessionCookie();

    // Ensure cookie is set with proper attributes
    (
      await // Ensure cookie is set with proper attributes
      cookies()
    ).set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

    return { success: true };
  } catch (error) {
    console.error("Error during sign out:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unknown error during sign out",
    };
  }
};
