"use client";

import { useState } from "react";
import { useActionState } from "react";
import { Form } from "@/components/form/form";
import { SubmitButton } from "@/components/form/submit-button";
import { EMPTY_ACTION_STATE } from "@/components/form/utils/to-action-state";
import { updateUserRole } from "@/features/auth/actions/update-user-role";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { LucideShield, LucideCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type ManageUserRoleProps = {
  userId: string;
  username: string;
  currentRole: string;
  disabled?: boolean;
};

export const ManageUserRole = ({
  userId,
  username,
  currentRole,
  disabled = false,
}: ManageUserRoleProps) => {
  const [actionState, action] = useActionState(
    updateUserRole,
    EMPTY_ACTION_STATE
  );
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(currentRole);

  const handleSuccess = () => {
    toast.success("Permissão do usuário atualizada com sucesso!");
    setIsOpen(false);
  };

  const handleRoleChange = (value: string) => {
    setSelectedRole(value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          className="w-full"
        >
          <LucideShield className="mr-2 h-4 w-4" />
          Mudar permissão
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Atualizar permissão do Usuário</DialogTitle>
          <DialogDescription>
            Mudar permissão do usuário{" "}
            <span className="font-medium">{username}</span>
          </DialogDescription>
        </DialogHeader>

        <Form
          action={action}
          actionState={actionState}
          onSuccess={handleSuccess}
          className="space-y-4 py-4"
        >
          <input type="hidden" name="userId" value={userId} />

          <div className="flex flex-col gap-2">
            <Select
              name="role"
              defaultValue={currentRole}
              onValueChange={handleRoleChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione a permissão" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USER">Usuário</SelectItem>
                <SelectItem value="ADMIN">Administrador</SelectItem>
              </SelectContent>
            </Select>

            {selectedRole === "ADMIN" && (
              <div className="text-sm text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 p-2 rounded flex items-start mt-2">
                <LucideShield className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>Administradores têm total acesso ao sistema.</span>
              </div>
            )}
          </div>

          <DialogFooter className="sm:justify-start">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <SubmitButton label="Update Role" className="ml-2" />
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
