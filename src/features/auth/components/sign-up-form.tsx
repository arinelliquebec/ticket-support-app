"use client";

import {
  LucideUser,
  LucideAtSign,
  LucideLock,
  LucideAlertCircle,
  LucideEye,
  LucideEyeOff,
  LucideShield,
} from "lucide-react";
import { useActionState, useState } from "react";
import { FieldError } from "@/components/form/field-error";
import { Form } from "@/components/form/form";
import { SubmitButton } from "@/components/form/submit-button";
import { EMPTY_ACTION_STATE } from "@/components/form/utils/to-action-state";
import { Input } from "@/components/ui/input";
import { signUp } from "../actions/sign-up";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useAuth } from "../hooks/use-auth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const SignUpForm = () => {
  const [actionState, action] = useActionState(signUp, EMPTY_ACTION_STATE);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { user } = useAuth();

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () =>
    setShowConfirmPassword(!showConfirmPassword);

  const isAdmin = user?.role === "ADMIN";

  return (
    <Form action={action} actionState={actionState} className="space-y-4">
      {actionState.status === "ERROR" && actionState.message && (
        <Alert variant="destructive" className="py-2 border-destructive/30">
          <LucideAlertCircle className="h-4 w-4" />
          <AlertDescription>{actionState.message}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <LucideUser className="h-4 w-4" />
          </div>
          <Input
            name="username"
            placeholder="Nome do usuário..."
            className="pl-10 rounded-lg border-muted/30 focus-visible:ring-primary/50 transition-all duration-200"
            defaultValue={actionState.payload?.get("username") as string}
            autoComplete="username"
            required
          />
        </div>
        <FieldError actionState={actionState} name="username" />
      </div>

      <div className="space-y-2">
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <LucideAtSign className="h-4 w-4" />
          </div>
          <Input
            name="email"
            type="email"
            placeholder="Email..."
            className="pl-10 rounded-lg border-muted/30 focus-visible:ring-primary/50 transition-all duration-200"
            defaultValue={actionState.payload?.get("email") as string}
            autoComplete="email"
            required
          />
        </div>
        <FieldError actionState={actionState} name="email" />
      </div>

      <div className="space-y-2">
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <LucideLock className="h-4 w-4" />
          </div>
          <Input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Senha (min 6 caracteres)"
            className="pl-10 pr-10 rounded-lg border-muted/30 focus-visible:ring-primary/50 transition-all duration-200"
            defaultValue={actionState.payload?.get("password") as string}
            autoComplete="new-password"
            required
            minLength={6}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={togglePasswordVisibility}
          >
            {showPassword ? (
              <LucideEyeOff className="h-4 w-4" />
            ) : (
              <LucideEye className="h-4 w-4" />
            )}
          </Button>
        </div>
        <FieldError actionState={actionState} name="password" />
      </div>

      <div className="space-y-2">
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <LucideLock className="h-4 w-4" />
          </div>
          <Input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            placeholder="Confirmar senha (min 6 caracteres)"
            className="pl-10 pr-10 rounded-lg border-muted/30 focus-visible:ring-primary/50 transition-all duration-200"
            defaultValue={actionState.payload?.get("confirmPassword") as string}
            autoComplete="new-password"
            required
            minLength={6}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={toggleConfirmPasswordVisibility}
          >
            {showConfirmPassword ? (
              <LucideEye className="h-4 w-4" />
            ) : (
              <LucideEyeOff className="h-4 w-4" />
            )}
          </Button>
        </div>
        <FieldError actionState={actionState} name="confirmPassword" />
      </div>

      {isAdmin && (
        <>
          <Separator className="my-2" />

          <div className="space-y-2">
            <Label className="flex items-center text-sm text-muted-foreground">
              <LucideShield className="h-4 w-4 mr-1.5" />
              Tipo de Conta
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
            <p className="text-xs text-muted-foreground">
              Administradores tem total acesso ao sistema.
            </p>
          </div>
        </>
      )}

      <SubmitButton
        label="Criar conta"
        className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
      />
    </Form>
  );
};

export { SignUpForm };
