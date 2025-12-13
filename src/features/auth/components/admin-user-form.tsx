"use client";

import {
  LucideUser,
  LucideAtSign,
  LucideLock,
  LucideAlertCircle,
} from "lucide-react";
import { useActionState } from "react";
import { FieldError } from "@/components/form/field-error";
import { Form } from "@/components/form/form";
import { SubmitButton } from "@/components/form/submit-button";
import { EMPTY_ACTION_STATE } from "@/components/form/utils/to-action-state";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createUser } from "@/features/auth/actions/create-user";

export const AdminUserForm = () => {
  const [actionState, action] = useActionState(createUser, EMPTY_ACTION_STATE);

  return (
    <Form action={action} actionState={actionState} className="space-y-4">
      {actionState.status === "ERROR" && actionState.message && (
        <Alert variant="destructive" className="py-2 border-destructive/30">
          <LucideAlertCircle className="h-4 w-4" />
          <AlertDescription>{actionState.message}</AlertDescription>
        </Alert>
      )}

      {actionState.status === "SUCCESS" && actionState.message && (
        <Alert className="py-2 border-green-500/30 bg-green-500/10 text-green-700">
          <AlertDescription>{actionState.message}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="username" className="text-sm font-medium">
          Username
        </Label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <LucideUser className="h-4 w-4" />
          </div>
          <Input
            id="username"
            name="username"
            className="pl-10 rounded-lg border-muted/30 focus-visible:ring-primary/50 transition-all duration-200"
            defaultValue={actionState.payload?.get("username") as string}
            required
          />
        </div>
        <FieldError actionState={actionState} name="username" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium">
          Email
        </Label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <LucideAtSign className="h-4 w-4" />
          </div>
          <Input
            id="email"
            name="email"
            type="email"
            className="pl-10 rounded-lg border-muted/30 focus-visible:ring-primary/50 transition-all duration-200"
            defaultValue={actionState.payload?.get("email") as string}
            required
          />
        </div>
        <FieldError actionState={actionState} name="email" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium">
          Senha
        </Label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <LucideLock className="h-4 w-4" />
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            className="pl-10 rounded-lg border-muted/30 focus-visible:ring-primary/50 transition-all duration-200"
            defaultValue={actionState.payload?.get("password") as string}
            required
            minLength={6}
          />
        </div>
        <FieldError actionState={actionState} name="password" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="role" className="text-sm font-medium">
          Permissão do Usuário
        </Label>
        <Select name="role" defaultValue="USER">
          <SelectTrigger className="w-full rounded-lg border-muted/30 focus-visible:ring-primary/50 transition-all duration-200">
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="USER">Usuário</SelectItem>
            <SelectItem value="ADMIN">Administrador</SelectItem>
          </SelectContent>
        </Select>
        <FieldError actionState={actionState} name="role" />
      </div>

      <SubmitButton
        label="Create User"
        className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
      />
    </Form>
  );
};
