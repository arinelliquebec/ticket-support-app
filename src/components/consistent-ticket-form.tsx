"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ActionState,
  EMPTY_ACTION_STATE,
} from "@/components/form/utils/to-action-state";
import { FieldError } from "@/components/form/field-error";
import { Form } from "@/components/form/form";
import { SubmitButton } from "@/components/form/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { ticketPath } from "@/paths";
import {
  LucideHeading,
  LucideFileText,
  LucideAlertTriangle,
  LucideTicket,
  LucideTicketPlus,
  LucideTag,
  LucideBuilding,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useActionState } from "react";
import { createOrUpdateValidatedTicket } from "@/actions/validated-ticket-action";
import { ticketSchema, TicketFormData } from "@/validations/ticket-schema";

type ConsistentTicketFormProps = {
  ticket?: any;
  categories?: Array<{ id: string; name: string; color: string }>;
};

// Definir filial options
const filialOptions = [
  { value: "Matriz RJ", label: "Matriz Rio de Janeiro" },
  { value: "Filial SP", label: "Filial São Paulo" },
  { value: "Filial CP", label: "Filial Campinas" },
  { value: "Filial RP", label: "Filial Ribeirão Preto" },
  { value: "Filial SC", label: "Filial Joinville" },
  { value: "Filial PR", label: "Filial Curitiba" },
  { value: "Filial ES", label: "Filial Vitória" },
  { value: "Filial DF", label: "Filial Brasília" },
  { value: "Filial PE", label: "Filial Recife" },
  { value: "Filial AM", label: "Filial Manaus" },
  { value: "Filial PIR", label: "Filial Piraúba" },
  { value: "Filial BH", label: "Filial Belo Horizonte" },
  { value: "Filial BA", label: "Filial Salvador" },
  { value: "Filial OL", label: "Filial Orlando" },
  { value: "Filial NY", label: "Filial Nova York" },
];

export function ConsistentTicketForm({
  ticket,
  categories = [],
}: ConsistentTicketFormProps) {
  const router = useRouter();
  const [actionState, action] = useActionState(
    createOrUpdateValidatedTicket,
    EMPTY_ACTION_STATE
  );

  // Estado inicial do formulário com valores padrão para campos obrigatórios
  const [formValues, setFormValues] = useState<TicketFormData>({
    title: ticket?.title || "",
    content: ticket?.content || "",
    categoryId: ticket?.categoryId || "",
    filial: ticket?.filial || "",
    priority: (ticket?.priority as any) || "BAIXA",
  });

  // Estado de validação no cliente
  const [clientErrors, setClientErrors] = useState<Record<string, string[]>>(
    {}
  );

  // Contadores de caracteres
  const [titleLength, setTitleLength] = useState(formValues.title.length);
  const [contentLength, setContentLength] = useState(formValues.content.length);

  // Atualizar form values quando os dados mudam
  useEffect(() => {
    if (ticket) {
      setFormValues({
        title: ticket.title || "",
        content: ticket.content || "",
        categoryId: ticket.categoryId || "",
        filial: ticket.filial || "",
        priority: (ticket?.priority as any) || "BAIXA",
      });
      setTitleLength(ticket.title?.length || 0);
      setContentLength(ticket.content?.length || 0);
    }
  }, [ticket]);

  // Função de atualização de campo que também valida
  const updateField = (field: keyof TicketFormData, value: any) => {
    // Atualizar o valor do campo
    const newValues = { ...formValues, [field]: value };
    setFormValues(newValues);

    // Atualizar contadores de caracteres
    if (field === "title") setTitleLength(value.length);
    if (field === "content") setContentLength(value.length);

    // Validar com Zod
    const pickObject = { [field]: true } as { [K in typeof field]: true };
    const fieldSchema = ticketSchema.pick(pickObject);
    const result = fieldSchema.safeParse({ [field]: value });

    if (!result.success) {
      // Extrair erros de validação
      const fieldErrors: Record<string, string[]> = {};
      result.error.errors.forEach((err) => {
        const path = err.path[0] as string;
        if (!fieldErrors[path]) {
          fieldErrors[path] = [];
        }
        fieldErrors[path].push(err.message);
      });

      // Atualizar errors para este campo
      setClientErrors((prev) => ({
        ...prev,
        [field]: fieldErrors[field] || [],
      }));
    } else {
      // Limpar erros para este campo
      setClientErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Validar formulário completo no cliente antes de enviar
  const validateForm = () => {
    const result = ticketSchema.safeParse(formValues);

    if (!result.success) {
      // Extrair e formatar erros
      const fieldErrors: Record<string, string[]> = {};
      result.error.errors.forEach((err) => {
        const path = err.path[0] as string;
        if (!fieldErrors[path]) {
          fieldErrors[path] = [];
        }
        fieldErrors[path].push(err.message);
      });

      setClientErrors(fieldErrors);
      return false;
    }

    setClientErrors({});
    return true;
  };

  // Handler para processamento após sucesso
  const handleSuccess = (state: ActionState) => {
    if (state.status === "SUCCESS") {
      const data = state as any;

      if (data.data?.nextRedirect) {
        toast.success(state.message);
        router.push(data.data.nextRedirect);
      } else if (data.data?.id) {
        toast.success(state.message);
        router.push(ticketPath(data.data.id));
      }
    }
  };

  // Handler para submissão do formulário
  const handleSubmit = (e: React.FormEvent) => {
    // Impedir submissão se houver erros no cliente
    if (!validateForm()) {
      e.preventDefault();
      toast.error("Por favor, corrija os erros no formulário");
      return;
    }

    // Se não houver erros, permitir que o formulário continue
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg border-muted/30">
      <CardHeader className="pb-2 border-b">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-primary/10">
            {ticket ? (
              <LucideTicket className="h-6 w-6 text-primary" />
            ) : (
              <LucideTicketPlus className="h-6 w-6 text-primary" />
            )}
          </div>
          <div>
            <CardTitle className="text-xl">
              {ticket ? "Editar Ticket" : "Criar Novo Ticket"}
            </CardTitle>
            <CardDescription>
              {ticket
                ? "Atualize os detalhes do ticket existente"
                : "Crie um novo ticket de suporte"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <Form
          action={action}
          actionState={actionState}
          onSuccess={handleSuccess}
          className="space-y-6"
          preserveFormState
        >
          {/* ID oculto para edição */}
          {ticket && <input type="hidden" name="id" value={ticket.id} />}

          {/* Alerta geral para erros da API */}
          {actionState.status === "ERROR" && actionState.message && (
            <Alert variant="destructive" className="mb-4">
              <LucideAlertTriangle className="h-4 w-4" />
              <AlertDescription>{actionState.message}</AlertDescription>
            </Alert>
          )}

          {/* Campo de título */}
          <div className="space-y-2">
            <Label
              htmlFor="title"
              className="flex items-center text-sm font-medium"
            >
              <LucideHeading className="h-4 w-4 mr-1.5 text-primary" />
              Título
              <span className="text-destructive ml-1">*</span>
              <span className="ml-auto text-xs text-muted-foreground">
                {titleLength}/191
              </span>
            </Label>
            <Input
              id="title"
              name="title"
              value={formValues.title}
              onChange={(e) => updateField("title", e.target.value)}
              className={`rounded-lg border-muted/30 focus-visible:ring-primary/50 ${
                clientErrors.title ? "border-destructive" : ""
              }`}
              placeholder="Digite o título do ticket"
              maxLength={191}
              required
            />
            {/* Cliente-side validation errors */}
            {clientErrors.title &&
              clientErrors.title.map((err, i) => (
                <p key={i} className="text-xs text-destructive">
                  {err}
                </p>
              ))}
            {/* Server-side validation errors */}
            <FieldError actionState={actionState} name="title" />
          </div>

          {/* Campo de conteúdo */}
          <div className="space-y-2">
            <Label
              htmlFor="content"
              className="flex items-center text-sm font-medium"
            >
              <LucideFileText className="h-4 w-4 mr-1.5 text-primary" />
              Descrição
              <span className="text-destructive ml-1">*</span>
              <span className="ml-auto text-xs text-muted-foreground">
                {contentLength}/1024
              </span>
            </Label>
            <Textarea
              id="content"
              name="content"
              value={formValues.content}
              onChange={(e) => updateField("content", e.target.value)}
              className={`rounded-lg border-muted/30 focus-visible:ring-primary/50 min-h-[150px] ${
                clientErrors.content ? "border-destructive" : ""
              }`}
              placeholder="Descreva o problema em detalhes..."
              maxLength={1024}
              required
            />
            {/* Cliente-side validation errors */}
            {clientErrors.content &&
              clientErrors.content.map((err, i) => (
                <p key={i} className="text-xs text-destructive">
                  {err}
                </p>
              ))}
            {/* Server-side validation errors */}
            <FieldError actionState={actionState} name="content" />
          </div>

          {/* Campos categoria e filial */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Categoria */}
            <div className="space-y-2">
              <Label
                htmlFor="categoryId"
                className="flex items-center text-sm font-medium"
              >
                <LucideTag className="h-4 w-4 mr-1.5 text-primary" />
                Categoria
                <span className="text-destructive ml-1">*</span>
              </Label>
              <Select
                name="categoryId"
                value={formValues.categoryId}
                onValueChange={(value) => updateField("categoryId", value)}
              >
                <SelectTrigger
                  id="categoryId"
                  className={`rounded-lg border-muted/30 focus-visible:ring-primary/50 ${
                    clientErrors.categoryId ? "border-destructive" : ""
                  }`}
                >
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: category.color }}
                        ></div>
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {/* Client-side validation errors */}
              {clientErrors.categoryId &&
                clientErrors.categoryId.map((err, i) => (
                  <p key={i} className="text-xs text-destructive">
                    {err}
                  </p>
                ))}
              {/* Server-side validation errors */}
              <FieldError actionState={actionState} name="categoryId" />
            </div>

            {/* Filial */}
            <div className="space-y-2">
              <Label
                htmlFor="filial"
                className="flex items-center text-sm font-medium"
              >
                <LucideBuilding className="h-4 w-4 mr-1.5 text-primary" />
                Filial
                <span className="text-destructive ml-1">*</span>
              </Label>
              <Select
                name="filial"
                value={formValues.filial}
                onValueChange={(value) => updateField("filial", value)}
              >
                <SelectTrigger
                  id="filial"
                  className={`rounded-lg border-muted/30 focus-visible:ring-primary/50 ${
                    clientErrors.filial ? "border-destructive" : ""
                  }`}
                >
                  <SelectValue placeholder="Selecione uma filial" />
                </SelectTrigger>
                <SelectContent>
                  {filialOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {/* Client-side validation errors */}
              {clientErrors.filial &&
                clientErrors.filial.map((err, i) => (
                  <p key={i} className="text-xs text-destructive">
                    {err}
                  </p>
                ))}
              {/* Server-side validation errors */}
              <FieldError actionState={actionState} name="filial" />
            </div>
          </div>

          <CardFooter className="px-0 pt-4 flex justify-end">
            <SubmitButton
              label={ticket ? "Atualizar Ticket" : "Criar Ticket"}
              className="bg-primary hover:bg-primary/90 min-w-32 gap-2"
            />
          </CardFooter>
        </Form>
      </CardContent>
    </Card>
  );
}
