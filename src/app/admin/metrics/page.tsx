import { getAuth } from "@/features/auth/queries/get-auth";
import { redirect } from "next/navigation";
import { homePath } from "@/paths";
import { AdvancedMetricsDashboard } from "@/components/advanced-metrics-dashboard";
import { AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Restricted email
const ALLOWED_EMAIL = "arinpar@gmail.com";

export default async function AdvancedMetricsPage() {
  const { user } = await getAuth();

  if (!user) {
    redirect(homePath());
  }

  // Check if user has permission
  if (user.email !== ALLOWED_EMAIL) {
    return (
      <div className="container max-w-4xl py-12">
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Acesso Negado
            </CardTitle>
            <CardDescription>
              Você não tem permissão para visualizar este relatório.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Este relatório avançado está disponível apenas para usuários autorizados.
              <br />
              Se você acredita que deveria ter acesso, entre em contato com o administrador do sistema.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl py-6">
      <AdvancedMetricsDashboard />
    </div>
  );
}

