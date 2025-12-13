import { LucideShieldAlert } from "lucide-react";
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

export default function AccessDeniedPage() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[80vh]">
      <Card className="max-w-md w-full shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-destructive/10">
              <LucideShieldAlert className="h-10 w-10 text-destructive" />
            </div>
          </div>
          <CardTitle className="text-xl font-bold">Access Denied</CardTitle>
          <CardDescription className="mt-2">
            Você não tem permissão para acessar esta página.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground">
            Esta é uma página restrita para administradores. Se você acredita
            que isso é um erro, entre em contato com o suporte.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          <Button asChild variant="outline">
            <Link href="/">Voltar</Link>
          </Button>
          <Button asChild>
            <Link href="/sign-in">Logar</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
