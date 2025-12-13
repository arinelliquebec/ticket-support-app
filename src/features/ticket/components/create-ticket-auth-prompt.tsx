// src/features/ticket/components/create-ticket-auth-prompt.tsx
import {
  LucideUserPlus,
  LucideLogIn,
  LucideTicketPlus,
  LucideAlertCircle,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { signInPath, signUpPath } from "@/paths";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const CreateTicketAuthPrompt = () => {
  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg border-muted/30 animate-fade-from-top">
      <CardHeader className="pb-2 border-b">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-primary/10">
            <LucideTicketPlus className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">Criar novo Ticket</CardTitle>
            <CardDescription>Faça Login ou crie uma conta!</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <Alert className="bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300 border-amber-200">
          <LucideAlertCircle className="h-4 w-4" />
          <AlertDescription>
            Você precisa ter uma conta para criar Tickets.
          </AlertDescription>
        </Alert>

        <div className="text-center space-y-2">
          <p className="text-muted-foreground">Já tem uma conta? Faça Login!</p>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-4 pt-4 justify-center">
        <Button asChild variant="outline" className="w-full sm:w-auto">
          <Link href={signInPath()}>
            <LucideLogIn className="mr-2 h-4 w-4" />
            Login
          </Link>
        </Button>
        <Button
          asChild
          className="w-full sm:w-auto bg-primary hover:bg-primary/90"
        >
          <Link href={signUpPath()}>
            <LucideUserPlus className="mr-2 h-4 w-4" />
            Criar Conta
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};
