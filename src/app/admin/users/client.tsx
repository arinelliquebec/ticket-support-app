"use client";

import { useState } from "react";
import { Heading } from "@/components/heading";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  LucideUsers,
  LucideTrash,
  LucideUserPlus,
  LucideShield,
  LucideUser,
  LucideLoader2,
  LucideAlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ManageUserRole } from "@/features/auth/components/manage-user-role";
import { toast } from "sonner";
import { adminDeleteUser } from "@/actions/admin-delete-user";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SerializedUser } from "./page"; // Import type from server component

interface AdminUsersClientPageProps {
  initialUsers: SerializedUser[];
  currentUserId: string; // Add currentUserId prop
}

export default function AdminUsersClientPage({
  initialUsers,
  currentUserId,
}: AdminUsersClientPageProps) {
  const [users, setUsers] = useState<SerializedUser[]>(initialUsers);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [userToDeleteName, setUserToDeleteName] = useState<string>("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openDeleteDialog = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setUserToDeleteName(user.username);
      setUserToDelete(userId);
      setIsDeleteDialogOpen(true);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      setIsDeleting(true);
      setError(null);

      // Use the new admin delete action
      const result = await adminDeleteUser(userToDelete);

      if (result.success) {
        // Remove the user from the local state
        setUsers((prev) => prev.filter((user) => user.id !== userToDelete));

        toast.success(result.message || "User deleted successfully");
        setIsDeleteDialogOpen(false);
      } else {
        setError(result.error || "Failed to delete user");
        toast.error(result.error || "Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      setError(errorMessage);
      toast.error("Failed to delete user");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-y-8 max-w-6xl mx-auto w-full px-4 pb-12">
      <div className="bg-gradient-to-r from-primary/5 to-transparent -mx-4 -mt-4 px-4 pt-4 pb-6 border-b border-muted/10">
        <Heading
          title="Gerenciamento de Usuários"
          description="Veja e gerencie todos os usuários do sistema"
          icon={<LucideUsers className="h-8 w-8 text-primary" />}
        />
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">
          Todos os Usuários ({users.length})
        </h2>
        <Button asChild>
          <Link href="/admin/users/create">
            <LucideUserPlus className="mr-2 h-4 w-4" />
            Adicionar novo Usuário
          </Link>
        </Button>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Permissão</TableHead>
              <TableHead>Último Acesso</TableHead>
              <TableHead className="text-center">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((userData) => {
              const lastSession = userData.sessions[0];
              // Use the explicitly passed currentUserId to identify the current user
              const isCurrentUser = userData.id === currentUserId;

              return (
                <TableRow
                  key={userData.id}
                  className={isCurrentUser ? "bg-muted/30" : ""}
                >
                  <TableCell className="font-medium flex items-center">
                    <LucideUser className="mr-2 h-4 w-4 text-muted-foreground" />
                    {userData.username}
                    {isCurrentUser && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        You
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{userData.email}</TableCell>
                  <TableCell>
                    {userData.role === "ADMIN" ? (
                      <Badge
                        variant="default"
                        className="bg-primary text-primary-foreground"
                      >
                        <LucideShield className="mr-1 h-3 w-3" />
                        Admin
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Usuário</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {lastSession ? (
                      <div className="text-sm">
                        {format(new Date(lastSession.expiresAt), "MMM d, yyyy")}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        Never
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center gap-2">
                      <ManageUserRole
                        userId={userData.id}
                        username={userData.username}
                        currentRole={userData.role}
                        disabled={
                          (isCurrentUser && userData.role === "ADMIN") ||
                          userData.email === "arinpar@gmail.com"
                        }
                      />

                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        disabled={isCurrentUser || userData.email === "arinpar@gmail.com"}
                        onClick={() => openDeleteDialog(userData.id)}
                        title={
                          userData.email === "arinpar@gmail.com"
                            ? "Usuário fundador não pode ser excluído"
                            : isCurrentUser
                            ? "Você não pode excluir sua própria conta"
                            : "Excluir usuário"
                        }
                      >
                        <LucideTrash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}

            {users.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground"
                >
                  Nenhum usuário encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Deletar Usuário: {userToDeleteName}</DialogTitle>
            <DialogDescription>
              Você tem certeza que deseja deletar o usuário "{userToDeleteName}
              "? Esta ação não pode ser desfeita. Todos os dados associados a
              este usuário serão permanentemente removidos.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <Alert variant="destructive">
              <LucideAlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <DialogFooter className="sm:justify-between">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setError(null);
              }}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <LucideLoader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deletando...
                </>
              ) : (
                <>
                  <LucideTrash className="h-4 w-4 mr-2" />
                  Deletar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
