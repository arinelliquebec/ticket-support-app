"use client";

import { LucideShield, LucideUser } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { Badge } from "@/components/ui/badge";

export const RoleIndicator = () => {
  const { user, isFetched } = useAuth();

  if (!isFetched || !user) {
    return null;
  }

  if (user.role === "ADMIN") {
    return (
      <Badge
        variant="default"
        className="bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
      >
        <LucideShield className="mr-1 h-3 w-3" />
        Admin
      </Badge>
    );
  }

  return (
    <Badge
      variant="secondary"
      className="bg-secondary/50 text-muted-foreground"
    >
      <LucideUser className="mr-1 h-3 w-3" />
      User
    </Badge>
  );
};
