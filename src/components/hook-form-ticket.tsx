"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LucideHeading,
  LucideFileText,
  LucideTag,
  LucideBuilding,
  LucideAlertTriangle,
  LucideTicket,
  LucideTicketPlus,
  LucideLoader2,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ticketPath } from "@/paths";

// Import the existing schema
import { ticketSchema } from "@/validations/ticket-schema";

// Define the filial options used across the app
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

// Create the form schema with explicit required field types
const formSchema = ticketSchema.extend({
  title: z.string().min(1, "Título é obrigatório"),
  content: z.string().min(1, "Descrição é obrigatória"),
});

// Define the prop types for our component
type TicketFormProps = {
  ticket?: any; // The existing ticket for edit mode
  categories?: Array<{ id: string; name: string; color: string }>;
  onSubmit: (data: z.infer<typeof formSchema>) => Promise<any>;
  isSubmitting?: boolean;
};

export function HookFormTicket({
  ticket,
  categories = [],
  onSubmit,
  isSubmitting = false,
}: TicketFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  // Set up the form with default values and the zod resolver
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: ticket?.title || "",
      content: ticket?.content || "",
      // Important: Initialize these fields properly whether editing or creating
      categoryId: ticket?.categoryId || null,
      filial: ticket?.filial || null,
    },
  });

  // Count characters for UI display
  const titleLength = form.watch("title")?.length || 0;
  const contentLength = form.watch("content")?.length || 0;

  // Handle form submission
  const handleFormSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setServerError(null);

      // Call the provided onSubmit function with the form values
      const result = await onSubmit(values);

      // Handle successful submission
      if (result.success) {
        toast.success(result.message || "Ticket saved successfully");

        // If we have a ticket ID, redirect to it
        if (result.ticketId) {
          router.push(`${ticketPath(result.ticketId)}?new=true`);
        }
      } else {
        // Handle error from the server
        setServerError(
          result.error || "An error occurred while saving the ticket"
        );
        toast.error(result.error || "Failed to save ticket");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setServerError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
      toast.error("Failed to submit form");
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg border-muted/30 animate-fade-from-top">
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
              {ticket ? "Editar Ticket" : "Criar novo Ticket"}
            </CardTitle>
            <CardDescription>
              {ticket
                ? "Atualizar os detalhes do ticket existente"
                : "Enviar um novo ticket mais detalhado"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        {/* Display server errors if any */}
        {serverError && (
          <Alert variant="destructive" className="mb-4">
            <LucideAlertTriangle className="h-4 w-4" />
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="space-y-6"
          >
            {/* Hidden ID field for editing */}
            {ticket && <input type="hidden" name="id" value={ticket.id} />}

            {/* Title field */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }: any) => (
                <FormItem className="space-y-2">
                  <FormLabel className="flex items-center text-sm font-medium">
                    <LucideHeading className="h-4 w-4 mr-1.5 text-primary" />
                    Título
                    <span className="ml-auto text-xs text-muted-foreground">
                      {titleLength}/191
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Digite o título do ticket"
                      className="rounded-lg border-muted/30 focus-visible:ring-primary/50 transition-all duration-200 shadow-sm"
                      maxLength={191}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Content field */}
            <FormField
              control={form.control}
              name="content"
              render={({ field }: any) => (
                <FormItem className="space-y-2">
                  <FormLabel className="flex items-center text-sm font-medium">
                    <LucideFileText className="h-4 w-4 mr-1.5 text-primary" />
                    Descrição
                    <span className="ml-auto text-xs text-muted-foreground">
                      {contentLength}/1024
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Descreva os detalhes do ticket..."
                      className="rounded-lg border-muted/30 focus-visible:ring-primary/50 transition-all duration-200 shadow-sm min-h-[150px]"
                      maxLength={1024}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category field */}
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }: any) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="flex items-center text-sm font-medium">
                      <LucideTag className="h-4 w-4 mr-1.5 text-primary" />
                      Categoria
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || "none"}
                    >
                      <FormControl>
                        <SelectTrigger className="rounded-lg border-muted/30 focus-visible:ring-primary/50 transition-all duration-200 shadow-sm">
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Sem categoria</SelectItem>
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Filial field */}
              <FormField
                control={form.control}
                name="filial"
                render={({ field }: any) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="flex items-center text-sm font-medium">
                      <LucideBuilding className="h-4 w-4 mr-1.5 text-primary" />
                      Filial
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || "none"}
                    >
                      <FormControl>
                        <SelectTrigger className="rounded-lg border-muted/30 focus-visible:ring-primary/50 transition-all duration-200 shadow-sm">
                          <SelectValue placeholder="Selecione uma filial" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Sem filial</SelectItem>
                        {filialOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <CardFooter className="px-0 pt-4 flex justify-end">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary hover:bg-primary/90 min-w-32 gap-2"
              >
                {isSubmitting ? (
                  <>
                    <LucideLoader2 className="h-4 w-4 animate-spin" />
                    {ticket ? "Saving..." : "Creating..."}
                  </>
                ) : ticket ? (
                  "Update Ticket"
                ) : (
                  "Create Ticket"
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
