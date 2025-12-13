import { Heading } from "@/components/heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuth } from "@/features/auth/queries/get-auth";
import { redirect } from "next/navigation";
import { LucideUserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AdminUserForm } from "@/features/auth/components/admin-user-form";

const AdminCreateUserPage = async () => {
  // Server-side authentication check
  const { user } = await getAuth();

  if (!user || user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="flex-1 flex flex-col gap-y-8 max-w-6xl mx-auto w-full px-4 pb-12">
      <div className="bg-gradient-to-r from-primary/5 to-transparent -mx-4 -mt-4 px-4 pt-4 pb-6 border-b border-muted/10">
        <Heading
          title="Create New User"
          description="Add a new user to the system"
          icon={<LucideUserPlus className="h-8 w-8 text-primary" />}
        />
      </div>

      <div className="flex justify-between items-center">
        <Button variant="outline" asChild>
          <Link href="/admin/users">Back to Users</Link>
        </Button>
      </div>

      <Card className="max-w-md mx-auto w-full">
        <CardHeader>
          <CardTitle>Create User Account</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminUserForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCreateUserPage;
