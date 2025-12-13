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

type PermissionDeniedProps = {
  message?: string;
  redirectUrl?: string;
  redirectLabel?: string;
};

export const PermissionDenied = ({
  message = "You don't have permission to access this page.",
  redirectUrl = "/",
  redirectLabel = "Return to Home",
}: PermissionDeniedProps) => {
  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <Card className="max-w-md w-full shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-destructive/10">
              <LucideShieldAlert className="h-10 w-10 text-destructive" />
            </div>
          </div>
          <CardTitle className="text-xl font-bold">Acesso Negado</CardTitle>
          <CardDescription className="mt-2">{message}</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground">
            Se você acha que isso é um erro, por favor, entre em contato com um
            Administrador.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button asChild>
            <Link href={redirectUrl}>{redirectLabel}</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
