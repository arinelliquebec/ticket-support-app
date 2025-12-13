// src/components/auth-button.tsx
"use client";

import {
  LucideLogIn,
  LucideUserPlus,
  LucideUser,
  LucideLogOut,
  LucideSettings,
  LucideShield,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { signOut } from "@/features/auth/actions/sign-out";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { homePath, signInPath, signUpPath } from "@/paths";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const AuthButton = () => {
  const router = useRouter();
  const { user, isFetched } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  if (!isFetched) {
    return null;
  }

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      const result = await signOut();

      if (result.success) {
        // Force a hard refresh to the sign-in page
        window.location.href = signInPath();
      } else {
        toast.error(result.error || "Failed to sign out");
        setIsSigningOut(false);
      }
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("An error occurred while signing out");
      setIsSigningOut(false);
    }
  };

  const getInitials = (name: string) => {
    return name.substring(0, 2).toUpperCase();
  };

  if (user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="border-primary/20 hover:border-primary hover:bg-primary/10 font-medium transition-all duration-200 gap-2"
          >
            {/* Aumentado o tamanho de h-6 w-6 para h-8 w-8 */}
            <Avatar className="h-8 w-8 mr-1">
              <AvatarImage src={user.avatarUrl || ""} alt={user.username} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {getInitials(user.username)}
              </AvatarFallback>
            </Avatar>
            <span className="hidden md:inline">{user.username}</span>
            {user.role === "ADMIN" && (
              <span className="ml-1 bg-primary/20 text-primary text-xs py-0.5 px-1.5 rounded-full">
                Admin
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem asChild>
            <Link href="/profile" className="cursor-pointer">
              <LucideUser className="h-4 w-4 mr-2" />
              Perfil
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link href={homePath()} className="cursor-pointer">
              <LucideSettings className="h-4 w-4 mr-2" />
              Dashboard
            </Link>
          </DropdownMenuItem>

          {user.role === "ADMIN" && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/admin" className="cursor-pointer">
                  <LucideShield className="h-4 w-4 mr-2" />
                  Admin Area
                </Link>
              </DropdownMenuItem>
            </>
          )}

          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="text-destructive focus:text-destructive cursor-pointer"
          >
            <LucideLogOut className="h-4 w-4 mr-2" />
            <span>{isSigningOut ? "Saindo..." : "Sair"}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="flex items-center gap-x-2">
      <Link
        href={signUpPath()}
        className="hidden sm:flex items-center gap-x-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
      >
        <LucideUserPlus className="h-4 w-4" />
        <span>Cadastrar</span>
      </Link>
      <Button
        asChild
        variant="default"
        className="bg-primary hover:bg-primary/90 shadow-sm font-medium transition-all duration-200"
      >
        <Link href={signInPath()}>
          <LucideLogIn className="h-4 w-4 mr-2" />
          <span>Entrar</span>
        </Link>
      </Button>
    </div>
  );
};
