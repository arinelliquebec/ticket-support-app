"use client";

import { useActionState, useState } from "react";
import { EMPTY_ACTION_STATE } from "@/components/form/utils/to-action-state";
import { Form } from "@/components/form/form";
import { SubmitButton } from "@/components/form/submit-button";
import { FieldError } from "@/components/form/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LucideTag, LucidePalette, LucideAlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { createCategory } from "../actions";

// Cores pré-definidas para seleção
const PRESET_COLORS = [
  "#EF4444", // Vermelho
  "#F97316", // Laranja
  "#FACC15", // Amarelo
  "#10B981", // Verde
  "#06B6D4", // Ciano
  "#3B82F6", // Azul
  "#8B5CF6", // Roxo
  "#EC4899", // Rosa
  "#6B7280", // Cinza
];

type CategoryCreateFormProps = {
  onSuccess?: () => void;
};

export const CategoryCreateForm = ({ onSuccess }: CategoryCreateFormProps) => {
  const [actionState, action] = useActionState(
    createCategory,
    EMPTY_ACTION_STATE
  );

  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);

  const handleSuccess = (actionState: any) => {
    if (actionState.status === "SUCCESS") {
      // Limpar formulário se necessário

      // Chamar callback de sucesso se fornecido
      if (onSuccess) {
        onSuccess();
      }
    }
  };

  return (
    <Form
      action={action}
      actionState={actionState}
      onSuccess={handleSuccess}
      className="space-y-6"
    >
      {actionState.status === "ERROR" && actionState.message && (
        <Alert variant="destructive">
          <LucideAlertTriangle className="h-4 w-4" />
          <AlertDescription>{actionState.message}</AlertDescription>
        </Alert>
      )}

      <input type="hidden" name="color" value={selectedColor} />

      <div className="space-y-2">
        <Label htmlFor="name" className="flex items-center text-sm font-medium">
          <LucideTag className="h-4 w-4 mr-1.5 text-primary" />
          Nome da Categoria
        </Label>
        <Input
          id="name"
          name="name"
          type="text"
          className="rounded-lg border-muted/30 focus-visible:ring-primary/50 transition-all duration-200 shadow-sm"
          placeholder="Ex: Bug, Feature, Melhoria..."
          defaultValue={(actionState.payload?.get("name") as string) ?? ""}
          required
        />
        <FieldError actionState={actionState} name="name" />
      </div>

      <div className="space-y-2">
        <Label className="flex items-center text-sm font-medium">
          <LucidePalette className="h-4 w-4 mr-1.5 text-primary" />
          Cor da Categoria
        </Label>
        <div className="flex flex-wrap gap-2">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              className={cn(
                "w-8 h-8 rounded-full border-2 transition-all",
                selectedColor === color
                  ? "border-white scale-110 shadow-md"
                  : "border-transparent hover:scale-105"
              )}
              style={{ backgroundColor: color }}
              onClick={() => setSelectedColor(color)}
            />
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium">
          Descrição (opcional)
        </Label>
        <Textarea
          id="description"
          name="description"
          className="rounded-lg border-muted/30 focus-visible:ring-primary/50 transition-all duration-200 shadow-sm min-h-[80px]"
          placeholder="Descrição opcional para esta categoria"
          defaultValue={
            (actionState.payload?.get("description") as string) ?? ""
          }
        />
        <FieldError actionState={actionState} name="description" />
      </div>

      <div className="pt-2">
        <SubmitButton
          label="Criar Categoria"
          className="bg-primary hover:bg-primary/90"
        />
      </div>
    </Form>
  );
};
