"use client";

import { LucideAtSign, LucideLock, LucideAlertCircle } from "lucide-react";
import { useActionState } from "react";
import { FieldError } from "@/components/form/field-error";
import { Form } from "@/components/form/form";
import { SubmitButton } from "@/components/form/submit-button";
import { EMPTY_ACTION_STATE } from "@/components/form/utils/to-action-state";
import { Input } from "@/components/ui/input";
import { signIn } from "../actions/sign-in";
import { Alert, AlertDescription } from "@/components/ui/alert";

const SignInForm = () => {
  const [actionState, action] = useActionState(signIn, EMPTY_ACTION_STATE);

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
            type="password"
            name="password"
            placeholder="Senha..."
            className="pl-10 rounded-lg border-muted/30 focus-visible:ring-primary/50 transition-all duration-200"
            defaultValue={actionState.payload?.get("password") as string}
            autoComplete="current-password"
            required
            minLength={6}
          />
        </div>
        <FieldError actionState={actionState} name="password" />
      </div>

      <SubmitButton
        label="Entrar"
        className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
      />
    </Form>
  );
};

export { SignInForm };
