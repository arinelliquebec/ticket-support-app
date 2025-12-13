"use client";

import { Ticket } from "@prisma/client";
import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FieldError } from "@/components/form/field-error";
import { Form } from "@/components/form/form";
import { SubmitButton } from "@/components/form/submit-button";
import {
  ActionState,
  EMPTY_ACTION_STATE,
} from "@/components/form/utils/to-action-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { upsertTicket } from "../actions/upsert-ticket";
import {
  LucideHeading,
  LucideFileText,
  LucideInfo,
  LucideAlertTriangle,
  LucideSave,
  LucideTicket,
  LucideTicketPlus,
  LucidePaperclip,
  LucideArrowRight,
  LucideCheck,
  LucideUpload,
  LucideFile,
  LucideLoader2,
  LucideX,
  LucideArrowLeft,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { ticketPath, ticketsPath } from "@/paths";
import { CategorySelect } from "@/features/category/components/category-select";
import { FilialSelect } from "@/features/ticket/components/filial-select";

type TicketUpsertFormProps = {
  ticket?: Ticket;
  categories?: Array<{ id: string; name: string; color: string }>;
};

export const TicketUpsertForm = ({
  ticket,
  categories = [],
}: TicketUpsertFormProps) => {
  const router = useRouter();
  const [actionState, action] = useActionState(
    async (state: any, formData: FormData) =>
      upsertTicket(ticket?.id, state, formData),
    EMPTY_ACTION_STATE
  );

  // Keep track of the form values to preserve them after validation errors
  const [formValues, setFormValues] = useState({
    title: (actionState.payload?.get("title") as string) ?? ticket?.title ?? "",
    content:
      (actionState.payload?.get("content") as string) ?? ticket?.content ?? "",
    categoryId:
      (actionState.payload?.get("categoryId") as string) ??
      ticket?.categoryId ??
      "",
    filial:
      (actionState.payload?.get("filial") as string) ?? ticket?.filial ?? "",
  });

  const [titleLength, setTitleLength] = useState(formValues.title.length);
  const [contentLength, setContentLength] = useState(formValues.content.length);

  // State to track field validation errors
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});

  // Track if the form has been successfully submitted
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Store the newly created ticket ID
  const [newTicketId, setNewTicketId] = useState<string | null>(null);

  // File upload states
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormValues((prev) => ({ ...prev, title: value }));
    setTitleLength(value.length);
    setFieldErrors((prev) => ({ ...prev, title: value.trim() === "" }));
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setFormValues((prev) => ({ ...prev, content: value }));
    setContentLength(value.length);
    setFieldErrors((prev) => ({ ...prev, content: value.trim() === "" }));
  };

  const handleCategoryChange = (value: string) => {
    setFormValues((prev) => ({
      ...prev,
      categoryId: value,
    }));
    setFieldErrors((prev) => ({
      ...prev,
      categoryId: !value || value === "null",
    }));
  };

  // Add handler for filial field
  const handleFilialChange = (value: string) => {
    setFormValues((prev) => ({
      ...prev,
      filial: value,
    }));
    setFieldErrors((prev) => ({ ...prev, filial: !value || value === "null" }));
  };

  const handleSuccess = async (state: any) => {
    if (state.status === "SUCCESS" && state.data?.id) {
      // Store the new ticket ID
      setNewTicketId(state.data.id);

      // Set submitted state to true
      setIsSubmitted(true);

      // For editing existing ticket, just redirect
      if (ticket) {
        toast.success(state.message || "Ticket updated successfully");
        router.push(
          state.data.nextRedirect || `${ticketPath(state.data.id)}?new=true`
        );
        return;
      }

      // For new tickets, handle file uploads if any were selected
      if (selectedFiles.length > 0) {
        await uploadFiles(state.data.id);
      } else {
        // No files to upload, redirect after a short delay
        toast.success(state.message || "Ticket created successfully");
        setTimeout(() => {
          router.push(`${ticketPath(state.data.id)}?new=true`);
        }, 1000);
      }
    }
  };

  // Update form values from actionState when there's an error
  // This ensures form fields retain their values after a validation error
  useEffect(() => {
    if (actionState.status === "ERROR" && actionState.payload) {
      setFormValues({
        title: (actionState.payload.get("title") as string) ?? formValues.title,
        content:
          (actionState.payload.get("content") as string) ?? formValues.content,
        categoryId:
          (actionState.payload.get("categoryId") as string) ??
          formValues.categoryId,
        filial:
          (actionState.payload.get("filial") as string) ?? formValues.filial,
      });
    }
  }, [actionState]);

  // File handling
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const handleFiles = (files: File[]) => {
    setFileError(null);

    // Validate file sizes (10MB max per file)
    const validFiles = files.filter((file) => {
      if (file.size > 10 * 1024 * 1024) {
        setFileError(`File ${file.name} exceeds the 10MB limit`);
        return false;
      }
      return true;
    });

    setSelectedFiles((prev) => [...prev, ...validFiles]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const uploadFiles = async (ticketId: string) => {
    setIsUploading(true);
    setUploadProgress(0);

    const totalFiles = selectedFiles.length;
    const uploaded: string[] = [];

    // Create a progress incrementer
    const incrementProgress = () => {
      setUploadProgress((prev) => {
        if (prev >= 95) return prev;
        return prev + 100 / (totalFiles * 5); // Smoother progress
      });
    };

    // Start progress animation
    const progressInterval = setInterval(incrementProgress, 200);

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(`/api/tickets/${ticketId}/attachments`, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Failed to upload ${file.name}`);
        }

        const data = await response.json();
        uploaded.push(file.name);

        // Update progress based on completed files
        setUploadProgress(((i + 1) / totalFiles) * 100);
      }

      setUploadedFiles(uploaded);
      toast.success(
        `${totalFiles} ${
          totalFiles === 1 ? "file" : "files"
        } uploaded successfully`
      );

      // Redirect to the ticket page after successful upload
      setTimeout(() => {
        router.push(`${ticketPath(ticketId)}?new=true`);
      }, 1000);
    } catch (error) {
      console.error("Upload error:", error);
      setFileError(
        error instanceof Error ? error.message : "File upload failed"
      );
      toast.error("Some files failed to upload");

      // Still redirect to ticket, but after a delay
      setTimeout(() => {
        router.push(`${ticketPath(ticketId)}?new=true`);
      }, 2000);
    } finally {
      clearInterval(progressInterval);
      setUploadProgress(100);

      // Complete the upload process after showing 100% for a moment
      setTimeout(() => {
        setIsUploading(false);
      }, 500);
    }
  };

  // Format file size for display
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " bytes";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  };

  // Generate today's date in YYYY-MM-DD format for the hidden deadline field
  const getTodayDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 7); // Set deadline 7 days from today as default
    return today.toISOString().split("T")[0]; // Format as YYYY-MM-DD
  };

  // Validate the form before submission
  const validateForm = () => {
    const errors: Record<string, boolean> = {};
    let hasErrors = false;

    if (!formValues.title.trim()) {
      errors.title = true;
      hasErrors = true;
    }

    if (!formValues.content.trim()) {
      errors.content = true;
      hasErrors = true;
    }

    if (!formValues.categoryId || formValues.categoryId === "null") {
      errors.categoryId = true;
      hasErrors = true;
    }

    if (!formValues.filial || formValues.filial === "null") {
      errors.filial = true;
      hasErrors = true;
    }

    setFieldErrors(errors);
    return !hasErrors;
  };

  // Override the form's onSubmit to add client-side validation
  const handleSubmit = (e: React.FormEvent) => {
    if (!validateForm()) {
      e.preventDefault();
      // Set a custom error state to display a message
      if (!actionState.message) {
        toast.error("Por favor, preencha todos os campos obrigatórios");
      }
      return;
    }
    // If validation passes, let the form submit normally
  };

  // If the form was successfully submitted and we have a ticket ID, show the file upload status
  if (isSubmitted && newTicketId) {
    return (
      <Card className="w-full max-w-2xl mx-auto shadow-lg border-muted/30 animate-fade-from-top">
        <CardHeader className="pb-2 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/20">
              <LucideCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <CardTitle className="text-xl">
                Ticket Created Successfully!
              </CardTitle>
              <CardDescription>
                {selectedFiles.length > 0
                  ? isUploading
                    ? "Uploading your files..."
                    : "Your files have been uploaded."
                  : "Your ticket has been created."}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {isUploading ? (
            <div className="space-y-4">
              <div className="flex justify-center">
                <LucideLoader2 className="h-10 w-10 text-primary animate-spin" />
              </div>
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-center text-sm text-muted-foreground">
                Uploading {selectedFiles.length}{" "}
                {selectedFiles.length === 1 ? "file" : "files"}...{" "}
                {Math.round(uploadProgress)}%
              </p>
            </div>
          ) : (
            <Alert className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200">
              <LucideInfo className="h-4 w-4" />
              <AlertDescription>
                {uploadedFiles.length > 0
                  ? `${uploadedFiles.length} ${
                      uploadedFiles.length === 1 ? "file" : "files"
                    } uploaded successfully.`
                  : "Ticket created successfully."}
              </AlertDescription>
            </Alert>
          )}

          {!isUploading && fileError && (
            <Alert variant="destructive" className="mt-4">
              <LucideAlertTriangle className="h-4 w-4" />
              <AlertDescription>{fileError}</AlertDescription>
            </Alert>
          )}
        </CardContent>

        <CardFooter className="pt-4 border-t flex justify-between gap-4">
          <Button
            variant="outline"
            className="font-medium hover:bg-secondary/80 transition-all duration-300 shadow-sm"
            onClick={() => router.push(ticketsPath())}
            disabled={isUploading}
          >
            <LucideArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Tickets
          </Button>

          <Button
            variant="default"
            className="bg-primary hover:bg-primary/90"
            onClick={() => router.push(`${ticketPath(newTicketId)}?new=true`)}
            disabled={isUploading}
          >
            Ver Ticket
            <LucideArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    );
  }

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
                ? "Editar detalhes de um ticket existente"
                : "Enviar um novo ticket com detalhes do problema"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <Form
          action={action}
          actionState={actionState as ActionState}
          onSuccess={handleSuccess}
          className="space-y-6"
        >
          {actionState.status === "ERROR" && actionState.message && (
            <Alert variant="destructive" className="mb-4">
              <LucideAlertTriangle className="h-4 w-4" />
              <AlertDescription>{actionState.message}</AlertDescription>
            </Alert>
          )}

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
              type="text"
              className={`rounded-lg border-muted/30 focus-visible:ring-primary/50 transition-all duration-200 shadow-sm ${
                fieldErrors.title || actionState.fieldErrors.title
                  ? "border-destructive"
                  : ""
              }`}
              placeholder="Digite o título do ticket"
              value={formValues.title}
              onChange={handleTitleChange}
              maxLength={191}
              required
            />
            {fieldErrors.title && (
              <p className="text-xs text-destructive">Título é obrigatório</p>
            )}
            <FieldError actionState={actionState as ActionState} name="title" />
            ``{" "}
          </div>

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
              className={`rounded-lg border-muted/30 focus-visible:ring-primary/50 transition-all duration-200 shadow-sm min-h-[150px] ${
                fieldErrors.content || actionState.fieldErrors.content
                  ? "border-destructive"
                  : ""
              }`}
              placeholder="Descreva os detalhes do ticket..."
              value={formValues.content}
              onChange={handleContentChange}
              maxLength={1024}
              required
            />
            {fieldErrors.content && (
              <p className="text-xs text-destructive">
                Descrição é obrigatória
              </p>
            )}
            <FieldError
              actionState={actionState as ActionState}
              name="content"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category selection with our new component */}
            <div className="space-y-2">
              <CategorySelect
                categories={categories}
                value={formValues.categoryId}
                onValueChange={handleCategoryChange}
                required={true}
                placeholder="Selecione uma categoria"
                error={
                  fieldErrors.categoryId ||
                  Boolean(actionState.fieldErrors.categoryId)
                }
              />

              {fieldErrors.categoryId && (
                <p className="text-xs text-destructive">
                  Categoria é obrigatória
                </p>
              )}
              <FieldError
                actionState={actionState as ActionState}
                name="categoryId"
              />
            </div>

            {/* Filial selection with our new component */}
            <div className="space-y-2">
              <FilialSelect
                value={formValues.filial}
                onValueChange={handleFilialChange}
                required={true}
                placeholder="Selecione uma filial"
                error={
                  fieldErrors.filial || Boolean(actionState.fieldErrors.filial)
                }
              />

              {fieldErrors.filial && (
                <p className="text-xs text-destructive">Filial é obrigatória</p>
              )}
              <FieldError
                actionState={actionState as ActionState}
                name="filial"
              />
            </div>
          </div>

          {/* Hidden deadline field with default value */}
          <input type="hidden" name="deadline" value={getTodayDate()} />

          {/* File Upload Section */}
          {!ticket && (
            <div className="space-y-3">
              <Label className="flex items-center text-sm font-medium">
                <LucidePaperclip className="h-4 w-4 mr-1.5 text-primary" />
                Anexos
                <span className="ml-2 text-xs text-muted-foreground">
                  (opcional, máx 10MB por arquivo)
                </span>
              </Label>

              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
                multiple
              />

              <div
                className={`border-2 border-dashed rounded-lg p-6 transition-all
                  ${
                    isDragging
                      ? "border-primary bg-primary/5"
                      : "border-muted/30 hover:bg-muted/5"
                  }
                  ${fileError ? "border-destructive/40 bg-destructive/5" : ""}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={openFileDialog}
              >
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="p-3 rounded-full bg-primary/10">
                    <LucideUpload className="h-6 w-6 text-primary" />
                  </div>
                  <p className="font-medium">
                    Arraste arquivos aqui ou clique para selecionar
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Suporta qualquer tipo de arquivo até 10MB
                  </p>
                </div>
              </div>

              {fileError && (
                <p className="text-sm text-destructive flex items-center">
                  <LucideAlertTriangle className="h-4 w-4 mr-1.5" />
                  {fileError}
                </p>
              )}

              {selectedFiles.length > 0 && (
                <div className="space-y-2 mt-4">
                  <p className="text-sm font-medium">
                    {selectedFiles.length}{" "}
                    {selectedFiles.length === 1
                      ? "arquivo selecionado"
                      : "arquivos selecionados"}
                  </p>
                  <div className="max-h-40 overflow-y-auto space-y-2 p-2 border rounded-md bg-muted/5">
                    {selectedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between py-1 px-2 rounded hover:bg-muted/20"
                      >
                        <div className="flex items-center space-x-2 truncate">
                          <LucideFile className="h-4 w-4 text-primary" />
                          <span className="text-sm truncate" title={file.name}>
                            {file.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatFileSize(file.size)}
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(index);
                          }}
                        >
                          <LucideX className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <CardFooter className="px-0 pt-4 flex justify-end">
            <SubmitButton
              label={ticket ? "Update Ticket" : "Create Ticket"}
              className="bg-primary hover:bg-primary/90 min-w-32 gap-2"
            />
          </CardFooter>
        </Form>
      </CardContent>
    </Card>
  );
};
