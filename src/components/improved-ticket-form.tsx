"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { EMPTY_ACTION_STATE } from "@/components/form/utils/to-action-state";

// Define our category options (fixed list per requirements)
const CATEGORY_OPTIONS = [
  { id: "3CX", name: "3CX", color: "#EC4899" },
  { id: "Fone", name: "Fone", color: "#F87171" },
  { id: "Monitor", name: "Monitor", color: "#34D399" },
  { id: "Hardware", name: "Hardware", color: "#60A5FA" },
  { id: "AlterData", name: "AlterData", color: "#FBBF24" },
  { id: "Internet", name: "Internet", color: "#A78BFA" },
  {
    id: "Criação | Exclusão de Usuário",
    name: "Criação | Exclusão de Usuário",
    color: "#10B981",
  },
  { id: "Domínio Web", name: "Domínio Web", color: "#E53809" },
  {
    id: "Criação | Alteração de Perfil",
    name: "Criação | Alteração de Perfil",
    color: "#10DD35",
  },
  { id: "Sistema Financeiro", name: "Sistema Financeiro", color: "#60CC95" },
  { id: "Email", name: "Email", color: "#EC4899" },
  { id: "Alteração de Senha", name: "Alteração de Senha", color: "#10A374" },
  { id: "CRM", name: "CRM", color: "#9BA344" },
  { id: "D4SIGN", name: "D4SIGN", color: "#11FD35" },
  { id: "Outros", name: "Outros", color: "#9CA3AF" },
];

// Define filial options
const FILIAL_OPTIONS = [
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

type ImprovedTicketFormProps = {
  ticket?: any;
  onSubmitAction: (prevState: any, formData: FormData) => Promise<any>;
};

export function ImprovedTicketForm({
  ticket,
  onSubmitAction,
}: ImprovedTicketFormProps) {
  const router = useRouter();
  const [actionState, action] = useActionState(
    onSubmitAction,
    EMPTY_ACTION_STATE
  );

  // Form values state
  const [title, setTitle] = useState(ticket?.title || "");
  const [content, setContent] = useState(ticket?.content || "");
  const [categoryId, setCategoryId] = useState(ticket?.categoryId || "");
  const [filial, setFilial] = useState(ticket?.filial || "");

  // Validation errors state
  const [errors, setErrors] = useState({
    title: false,
    content: false,
    categoryId: false,
    filial: false,
  });

  // Character counters
  const [titleLength, setTitleLength] = useState(title.length);
  const [contentLength, setContentLength] = useState(content.length);

  // Update form fields when ticket changes
  useEffect(() => {
    if (ticket) {
      setTitle(ticket.title || "");
      setContent(ticket.content || "");
      setCategoryId(ticket.categoryId || "");
      setFilial(ticket.filial || "");
      setTitleLength(ticket.title?.length || 0);
      setContentLength(ticket.content?.length || 0);
    }
  }, [ticket]);

  // Reset errors when fields change
  useEffect(() => {
    setErrors((prev) => ({ ...prev, title: false }));
  }, [title]);

  useEffect(() => {
    setErrors((prev) => ({ ...prev, content: false }));
  }, [content]);

  useEffect(() => {
    setErrors((prev) => ({ ...prev, categoryId: false }));
  }, [categoryId]);

  useEffect(() => {
    setErrors((prev) => ({ ...prev, filial: false }));
  }, [filial]);

  // Handle input changes
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    setTitleLength(e.target.value.length);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setContentLength(e.target.value.length);
  };

  // Form validation before submit
  const validateForm = () => {
    const newErrors = {
      title: title.trim() === "",
      content: content.trim() === "",
      categoryId: categoryId === "",
      filial: filial === "",
    };

    setErrors(newErrors);

    return !Object.values(newErrors).some((error) => error);
  };

  // Handler for form submission
  const handleSubmit = (e: React.FormEvent) => {
    if (!validateForm()) {
      e.preventDefault();
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
  };

  // Handler for successful submission
  const handleSuccess = (state: any) => {
    if (state.status === "SUCCESS") {
      toast.success(state.message || "Operação realizada com sucesso!");

      if (state.ticketId) {
        router.push(ticketPath(state.ticketId));
      } else if (state.data?.id) {
        router.push(ticketPath(state.data.id));
      } else if (state.data?.nextRedirect) {
        router.push(state.data.nextRedirect);
      }
    }
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
              Título <span className="text-destructive ml-1">*</span>
              <span className="ml-auto text-xs text-muted-foreground">
                {titleLength}/191
              </span>
            </Label>
            <Input
              id="title"
              name="title"
              value={title}
              onChange={handleTitleChange}
              className={`rounded-lg border-muted/30 focus-visible:ring-primary/50 ${
                errors.title ? "border-destructive" : ""
              }`}
              placeholder="Digite o título do ticket"
              maxLength={191}
              required
            />
            {errors.title && (
              <p className="text-xs text-destructive">Título é obrigatório</p>
            )}
            <FieldError actionState={actionState} name="title" />
          </div>

          {/* Campo de conteúdo */}
          <div className="space-y-2">
            <Label
              htmlFor="content"
              className="flex items-center text-sm font-medium"
            >
              <LucideFileText className="h-4 w-4 mr-1.5 text-primary" />
              Descrição <span className="text-destructive ml-1">*</span>
              <span className="ml-auto text-xs text-muted-foreground">
                {contentLength}/1024
              </span>
            </Label>
            <Textarea
              id="content"
              name="content"
              value={content}
              onChange={handleContentChange}
              className={`rounded-lg border-muted/30 focus-visible:ring-primary/50 min-h-[150px] ${
                errors.content ? "border-destructive" : ""
              }`}
              placeholder="Descreva o problema em detalhes..."
              maxLength={1024}
              required
            />
            {errors.content && (
              <p className="text-xs text-destructive">
                Descrição é obrigatória
              </p>
            )}
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
                Categoria <span className="text-destructive ml-1">*</span>
              </Label>
              <Select
                name="categoryId"
                value={categoryId}
                onValueChange={setCategoryId}
              >
                <SelectTrigger
                  id="categoryId"
                  className={`rounded-lg border-muted/30 focus-visible:ring-primary/50 ${
                    errors.categoryId ? "border-destructive" : ""
                  }`}
                >
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((category) => (
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
              {errors.categoryId && (
                <p className="text-xs text-destructive">
                  Categoria é obrigatória
                </p>
              )}
              <FieldError actionState={actionState} name="categoryId" />
            </div>

            {/* Filial */}
            <div className="space-y-2">
              <Label
                htmlFor="filial"
                className="flex items-center text-sm font-medium"
              >
                <LucideBuilding className="h-4 w-4 mr-1.5 text-primary" />
                Filial <span className="text-destructive ml-1">*</span>
              </Label>
              <Select name="filial" value={filial} onValueChange={setFilial}>
                <SelectTrigger
                  id="filial"
                  className={`rounded-lg border-muted/30 focus-visible:ring-primary/50 ${
                    errors.filial ? "border-destructive" : ""
                  }`}
                >
                  <SelectValue placeholder="Selecione uma filial" />
                </SelectTrigger>
                <SelectContent>
                  {FILIAL_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.filial && (
                <p className="text-xs text-destructive">Filial é obrigatória</p>
              )}
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
