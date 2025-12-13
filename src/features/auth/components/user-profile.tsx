"use client";

import {
  LucideUser,
  LucideAtSign,
  LucideShield,
  LucideCalendar,
} from "lucide-react";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RoleIndicator } from "./role-indicator";
import { UserAvatarManager } from "./user-avatar-manager";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const UserProfile = () => {
  const { user, isFetched } = useAuth();

  if (!isFetched || !user) {
    return null;
  }

  const getInitials = (name: string) => {
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Avatar Manager Card */}
      <UserAvatarManager />

      {/* User Info Card */}
      <Card className="w-full shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl flex items-center justify-between">
            <span className="flex items-center">
              <LucideUser className="mr-2 h-5 w-5 text-primary" />
              Informação da conta
            </span>
            <RoleIndicator />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center gap-y-2 gap-x-8">
              <div className="flex items-center text-muted-foreground">
                <LucideUser className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">Usuário:</span>
              </div>
              <span className="font-medium">{user.username}</span>
            </div>

            <div className="flex flex-col md:flex-row md:items-center gap-y-2 gap-x-8">
              <div className="flex items-center text-muted-foreground">
                <LucideAtSign className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">Email:</span>
              </div>
              <span>{user.email}</span>
            </div>

            <div className="flex flex-col md:flex-row md:items-center gap-y-2 gap-x-8">
              <div className="flex items-center text-muted-foreground">
                <LucideShield className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">Tipo de Conta:</span>
              </div>
              <span>
                {user.role === "ADMIN" ? "Administrador" : "Usuário Simples"}
              </span>
            </div>

            <Separator className="my-2" />

            <div className="text-xs text-muted-foreground mt-4">
              <div className="flex items-center">
                <LucideCalendar className="h-3 w-3 mr-1" />
                <span>
                  {user.role === "ADMIN"
                    ? "Contas de administradores têm todas as permissões do sistema."
                    : "Contas de usuários simples têm permissões limitadas."}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
