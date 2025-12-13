"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/use-auth";

/**
 * Custom hook to check if the current user has the required role
 *
 * @param requiredRole The role required to access the content ('ADMIN' | 'USER')
 * @param redirectTo Where to redirect if the user doesn't have the required role
 * @returns Object with loading and hasPermission states
 */
export const useCheckRole = (
  requiredRole: "ADMIN" | "USER" = "USER",
  redirectTo = "/"
) => {
  const { user, isFetched } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    if (!isFetched) return;

    // If no user, redirect to sign in
    if (!user) {
      router.push("/sign-in");
      return;
    }

    // If requiredRole is ADMIN, check if user is admin
    if (requiredRole === "ADMIN" && user.role !== "ADMIN") {
      router.push(redirectTo);
      return;
    }

    // User has required permissions
    setHasPermission(true);
    setLoading(false);
  }, [user, isFetched, requiredRole, router, redirectTo]);

  return { loading, hasPermission };
};
