"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  LucideHeading,
  LucideFileText,
  LucideAlertTriangle,
  LucideTag,
  LucideBuilding,
  LucideLoader2,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { quickFixCreateTicket } from "@/actions/quick-fix-create-ticket";
import { quickFixEditTicket } from "@/actions/quick-fix-edit-ticket";
import { ticketPath } from "@/paths";

// Define specific fixed category options
const CATEGORY_OPTIONS = [
  { id: "3CX", name: "3CX", color: "#EC4899" },
  { id: "Fone", name: "Fone", color: "#F87171" },
  { id: "Monitor", name: "Monitor", color: "#34D399" },
  { id: "Hardware", name: "Hardware", color: "#60A5FA" },
  { id: "AlterData", name: "AlterData", color: "#FBBF24" },
  { id: "Internet", name: "Internet", color: "#8B5CF6" },
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

// Define fixed filial options
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

type FixedTicketFormProps = {
  ticket?: any;
  existingCategories?: Array<{ id: string; name: string; color: string }>;
  categories?: Array<{ id: string; name: string; color: string }>;
};

export function FixedTicketForm({
  ticket,
  existingCategories = [],
  categories: categoriesProp = [],
}: FixedTicketFormProps) {
  const router = useRouter();

  // Form state
  const [title, setTitle] = useState(ticket?.title || "");
  const [content, setContent] = useState(ticket?.content || "");
  const [categoryId, setCategoryId] = useState(ticket?.categoryId || "");
  const [filial, setFilial] = useState(ticket?.filial || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Character counters
  const [titleLength, setTitleLength] = useState(title.length);
  const [contentLength, setContentLength] = useState(content.length);

  // Determine which categories to use (prefer categories prop, then existing, then default)
  const categories =
    categoriesProp.length > 0
      ? categoriesProp
      : existingCategories.length > 0
      ? existingCategories
      : CATEGORY_OPTIONS;

  // Update form with ticket data when it becomes available
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

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    setTitleLength(e.target.value.length);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setContentLength(e.target.value.length);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate required fields
    if (!title?.trim()) {
      setError("Title is required");
      setLoading(false);
      return;
    }

    if (!content?.trim()) {
      setError("Content is required");
      setLoading(false);
      return;
    }

    if (!categoryId) {
      setError("Category is required");
      setLoading(false);
      return;
    }

    if (!filial) {
      setError("Filial is required");
      setLoading(false);
      return;
    }

    try {
      // Create FormData
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      formData.append("categoryId", categoryId);
      formData.append("filial", filial);

      // Use different actions for create/edit
      let result;
      if (ticket) {
        // Edit existing ticket
        result = await quickFixEditTicket(ticket.id, formData);
      } else {
        // Create new ticket
        result = await quickFixCreateTicket(formData);
      }

      if (result.success && result.ticketId) {
        toast.success(result.message || "Operation completed successfully");
        router.push(ticketPath(result.ticketId));
      } else {
        setError(result.error || "An error occurred");
        toast.error(result.error || "Failed to process form");
      }
    } catch (err) {
      console.error("Form submission error:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      toast.error("Failed to submit form");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg border-muted/30">
      <CardHeader className="pb-2 border-b">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-primary/10">
            <LucideTag className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">
              {ticket ? "Editar Ticket" : "Criar novo Ticket"}
            </CardTitle>
            <CardDescription>
              {ticket
                ? "Atualizar um ticket existente"
                : "Enviar um novo Ticket para o sistema"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <LucideAlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

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
              className="rounded-lg border-muted/30 focus-visible:ring-primary/50"
              placeholder="Digite o título do ticket..."
              maxLength={191}
              required
            />
          </div>

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
              className="rounded-lg border-muted/30 focus-visible:ring-primary/50 min-h-[150px]"
              placeholder="Descreva o problema em detalhes..."
              maxLength={1024}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category selection field */}
            <div className="space-y-2">
              <Label
                htmlFor="category"
                className="flex items-center text-sm font-medium"
              >
                <LucideTag className="h-4 w-4 mr-1.5 text-primary" />
                Categoria <span className="text-destructive ml-1">*</span>
              </Label>
              <Select
                name="categoryId"
                value={categoryId}
                onValueChange={setCategoryId}
                required
              >
                <SelectTrigger
                  id="category"
                  className="rounded-lg border-muted/30 focus-visible:ring-primary/50"
                >
                  <SelectValue placeholder="Select a category" />
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
            </div>

            {/* Filial select field */}
            <div className="space-y-2">
              <Label
                htmlFor="filial"
                className="flex items-center text-sm font-medium"
              >
                <LucideBuilding className="h-4 w-4 mr-1.5 text-primary" />
                Filial <span className="text-destructive ml-1">*</span>
              </Label>
              <Select
                name="filial"
                value={filial}
                onValueChange={setFilial}
                required
              >
                <SelectTrigger className="rounded-lg border-muted/30 focus-visible:ring-primary/50">
                  <SelectValue placeholder="Select a filial" />
                </SelectTrigger>
                <SelectContent>
                  {FILIAL_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <CardFooter className="px-0 pt-4 flex justify-end">
            <Button
              type="submit"
              disabled={loading}
              className="bg-primary hover:bg-primary/90 min-w-32 gap-2"
            >
              {loading ? (
                <>
                  <LucideLoader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : ticket ? (
                "Update Ticket"
              ) : (
                "Create Ticket"
              )}
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
}
