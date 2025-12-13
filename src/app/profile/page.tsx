import { Heading } from "@/components/heading";
import { getAuth } from "@/features/auth/queries/get-auth";
import { redirect } from "next/navigation";
import { LucideUser } from "lucide-react";
import { UserProfile } from "@/features/auth/components/user-profile";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const UserProfilePage = async () => {
  // Server-side authentication check
  const { user } = await getAuth();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="flex-1 flex flex-col gap-y-8 max-w-3xl mx-auto w-full px-4 pb-12">
      <div className="bg-gradient-to-r from-primary/5 to-transparent -mx-4 -mt-4 px-4 pt-4 pb-6 border-b border-muted/10">
        <Heading
          title="Seu Perfil"
          description="Ver e gerenciar suas informações de conta"
          icon={<LucideUser className="h-8 w-8 text-primary" />}
        />
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Detalhes do Perfil</h2>
        {user.role === "ADMIN" && (
          <Button asChild variant="outline">
            <Link href="/admin">Admin Dashboard</Link>
          </Button>
        )}
      </div>

      <UserProfile />
    </div>
  );
};

export default UserProfilePage;
