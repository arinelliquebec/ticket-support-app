"use client";

import { LucideFileText, LucideUserPlus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { signUpPath, ticketsPath } from "@/paths";
import { useAuth } from "@/features/auth/hooks/use-auth";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type CreateTicketButtonProps = {
  variant?: "default" | "outline";
  size?: "default" | "lg";
  className?: string;
  label?: string;
};

export const CreateTicketButton = ({
  variant = "outline",
  size = "lg",
  className = "border-primary/20 hover:bg-primary/10 hover:text-primary",
  label = "Create Ticket",
}: CreateTicketButtonProps) => {
  const { user, isFetched } = useAuth();

  if (!isFetched) {
    return null;
  }

  if (user) {
    return (
      <Button size={size} variant={variant} asChild className={className}>
        <Link href={`${ticketsPath()}#new`}>
          <LucideFileText className="mr-2 h-5 w-5" />
          {label}
        </Link>
      </Button>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button size={size} variant={variant} asChild className={className}>
            <Link href={signUpPath()}>
              <LucideUserPlus className="mr-2 h-5 w-5" />
              Criar Conta
            </Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>You need to create an account to create tickets</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
