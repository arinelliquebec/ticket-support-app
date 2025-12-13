import { Suspense } from "react";
import Link from "next/link";
import { LucideLayoutDashboard, LucideUsers, LucideMenu } from "lucide-react";
import { getAuth } from "@/features/auth/queries/get-auth";
import { redirect } from "next/navigation";
import { PermissionDenied } from "@/components/permission-denied";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AdminLayoutProps = {
  children: React.ReactNode;
};

// Sidebar component for larger screens
const AdminSidebar = ({ className }: { className?: string }) => {
  const navItems = [
    {
      label: "Dashboard",
      href: "/admin",
      icon: <LucideLayoutDashboard className="h-5 w-5" />,
    },
    {
      label: "Users",
      href: "/admin/users",
      icon: <LucideUsers className="h-5 w-5" />,
    },
    // "Tickets" and "Settings" items have been removed
  ];

  return (
    <div className={cn("border-r bg-secondary/10 h-full", className)}>
      <div className="space-y-4 py-4">
        <div className="px-4 py-2">
          <h2 className="text-lg font-semibold tracking-tight">Admin Area</h2>
          <p className="text-sm text-muted-foreground">
            Gerencie os tickets e usuários da empresa.
          </p>
        </div>
        <nav className="space-y-1 px-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-x-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-secondary transition-colors"
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
};

// Mobile navigation button
const MobileNavButton = () => {
  return (
    <Button variant="outline" size="icon" className="md:hidden">
      <LucideMenu className="h-5 w-5" />
      <span className="sr-only">Menu</span>
    </Button>
  );
};

export default async function AdminLayout({ children }: AdminLayoutProps) {
  // Server-side authentication check
  const { user } = await getAuth();

  if (!user) {
    redirect("/sign-in");
  }

  // Check if user is admin
  if (user.role !== "ADMIN") {
    return (
      <PermissionDenied
        message="Somente administradores podem acessar esta área."
        redirectUrl="/"
        redirectLabel="Voltar para o painel"
      />
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Desktop sidebar - hidden on mobile */}
      <AdminSidebar className="hidden md:block w-64 pt-16 shrink-0" />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-auto">
        {/* Mobile header with nav toggle */}
        <div className="md:hidden flex items-center justify-between p-4 border-b">
          <h1 className="text-xl font-bold">Painel do Admin</h1>
          <MobileNavButton />
        </div>

        {/* Page content */}
        <div className="flex-1 overflow-auto p-4 pt-16 md:pt-20">
          <Suspense fallback={<div>Carregando...</div>}>{children}</Suspense>
        </div>
      </div>
    </div>
  );
}
