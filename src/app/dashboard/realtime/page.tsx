import { getAuth } from "@/features/auth/queries/get-auth";
import { RealtimeKPIDashboard } from "@/components/realtime-kpi-dashboard";
import { Heading } from "@/components/heading";
import { LucideBarChart3, LucideAlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { adminPath } from "@/paths";

const ALLOWED_EMAIL = "arinpar@gmail.com";

export default async function RealtimeDashboardPage() {
  const { user } = await getAuth();

  // Check authentication
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] p-4">
        <Heading
          title="Acesso Negado"
          description="Você precisa estar autenticado para acessar este recurso."
          icon={<LucideAlertTriangle className="h-8 w-8 text-red-500" />}
        />
        <Button asChild className="mt-4">
          <Link href="/sign-in">Fazer Login</Link>
        </Button>
      </div>
    );
  }

  // Check if user has permission (restricted email only)
  if (user.email !== ALLOWED_EMAIL) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] p-4">
        <Heading
          title="Recurso Exclusivo"
          description="Este dashboard é exclusivo para administradores autorizados."
          icon={<LucideBarChart3 className="h-8 w-8 text-yellow-500" />}
        />
        <p className="mt-4 text-center text-muted-foreground max-w-md">
          O Dashboard de KPIs em Tempo Real é um recurso premium disponível apenas para usuários específicos.
          Entre em contato com o administrador do sistema para solicitar acesso.
        </p>
        {user.role === "ADMIN" && (
          <Button asChild variant="outline" className="mt-6">
            <Link href={adminPath()}>Voltar ao Admin</Link>
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col gap-y-8 max-w-7xl mx-auto w-full px-4 pb-12 pt-8">
      <RealtimeKPIDashboard 
        userEmail={user.email}
        userName={user.username}
      />
    </div>
  );
}
