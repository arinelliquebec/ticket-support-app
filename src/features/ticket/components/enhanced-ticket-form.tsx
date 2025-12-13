"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  LucideHeading,
  LucideFileText,
  LucideInfo,
  LucideAlertTriangle,
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
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { ticketPath, ticketsPath } from "@/paths";
import { createRobustTicket } from "@/actions/create-robust-ticket";
import { CategorySelect } from "@/features/category/components/category-select";
import { FilialSelect } from "@/features/ticket/components/filial-select";
import { TicketPriority } from "@/validations/ticket-schema";
import { PrioritySelect } from "@/components/priority-badge";

// Define props type for EnhancedTicketForm
type EnhancedTicketFormProps = {
  categories?: Array<{ id: string; name: string; color: string }>;
};

export const EnhancedTicketForm = ({
  categories = [],
}: EnhancedTicketFormProps) => {
  const router = useRouter();

  // Form state with controlled inputs to avoid undefined values
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryValue, setCategoryValue] = useState<string>("");
  const [filialValue, setFilialValue] = useState<string>("");
  const [priorityValue, setPriorityValue] = useState<TicketPriority>("BAIXA");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});

  // Character counters
  const [titleLength, setTitleLength] = useState(0);
  const [contentLength, setContentLength] = useState(0);

  // File upload states
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Submission success state
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [newTicketId, setNewTicketId] = useState<string | null>(null);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTitle(value);
    setTitleLength(value.length);
    setFieldErrors((prev) => ({ ...prev, title: value.trim() === "" }));
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setContent(value);
    setContentLength(value.length);
    setFieldErrors((prev) => ({ ...prev, content: value.trim() === "" }));
  };

  const handleCategoryChange = (value: string) => {
    setCategoryValue(value);
    setFieldErrors((prev) => ({
      ...prev,
      categoryId: !value || value === "null",
    }));
  };

  const handleFilialChange = (value: string) => {
    setFilialValue(value);
    setFieldErrors((prev) => ({ ...prev, filial: !value || value === "null" }));
  };

  // File handling functions
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

  // Format file size for display
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " bytes";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
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

      // Redirect back to tickets list after successful upload
      setTimeout(() => {
        router.push(ticketsPath());
        router.refresh();
      }, 1000);
    } catch (error) {
      console.error("Upload error:", error);
      setFileError(
        error instanceof Error ? error.message : "File upload failed"
      );
      toast.error("Some files failed to upload");

      // Still redirect to tickets list, but after a delay
      setTimeout(() => {
        router.push(ticketsPath());
        router.refresh();
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

  const validateForm = () => {
    const errors: Record<string, boolean> = {};
    let isValid = true;

    if (!title.trim()) {
      errors.title = true;
      isValid = false;
    }

    if (!content.trim()) {
      errors.content = true;
      isValid = false;
    }

    if (!categoryValue || categoryValue === "null") {
      errors.categoryId = true;
      isValid = false;
    }

    if (!filialValue || filialValue === "null") {
      errors.filial = true;
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate the form
    if (!validateForm()) {
      setError("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create FormData object
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      formData.append("categoryId", categoryValue);
      formData.append("filial", filialValue);
      formData.append("priority", priorityValue);

      // Debug logging
      console.log("EnhancedTicketForm - Submitting form with values:");
      console.log("- title:", formData.get("title"));
      console.log("- content:", formData.get("content"));
      console.log("- priority:", formData.get("priority"));
      console.log("- categoryId:", formData.get("categoryId"));
      console.log("- filial:", formData.get("filial"));

      // Use the robust ticket action
      const result = await createRobustTicket(formData);

      if (result.success) {
        toast.success("Ticket created successfully");

        // Store the new ticket ID and set submitted state
        if (result.ticketId) {
          setNewTicketId(result.ticketId);
          setIsSubmitted(true);

          // Handle file uploads if any
          if (selectedFiles.length > 0) {
            await uploadFiles(result.ticketId);
          } else {
            // Redirect immediately to tickets list if no files
            setTimeout(() => {
              router.push(ticketsPath());
              router.refresh(); // Force refresh to show new ticket
            }, 1500);
          }
        }
      } else {
        console.error("Error creating ticket:", result.error);
        setError(result.error || "Failed to create ticket");
      }
    } catch (err) {
      console.error("Form submission error:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  // If the form was successfully submitted and we have a ticket ID, show success state
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
                Ticket criado com sucesso!
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
                Enviando {selectedFiles.length}{" "}
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
                  : "Ticket criado com sucesso!"}
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
            onClick={() => {
              router.push(ticketsPath());
              router.refresh();
            }}
            disabled={isUploading}
          >
            <LucideArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Tickets
          </Button>

          <Button
            variant="default"
            className="bg-primary hover:bg-primary/90"
            onClick={() => router.push(ticketPath(newTicketId))}
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
            <LucideTicketPlus className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">Criar novo Ticket</CardTitle>
            <CardDescription>
              Faça o envio com as informações necessárias para melhor
              atendê-los.
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
                fieldErrors.title ? "border-destructive" : ""
              }`}
              placeholder="Digite o título do ticket..."
              value={title}
              onChange={handleTitleChange}
              maxLength={191}
              required
            />
            {fieldErrors.title && (
              <p className="text-xs text-destructive">Título é obrigatório</p>
            )}
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
                fieldErrors.content ? "border-destructive" : ""
              }`}
              placeholder="Digite a descrição do ticket..."
              value={content}
              onChange={handleContentChange}
              maxLength={1024}
              required
            />
            {fieldErrors.content && (
              <p className="text-xs text-destructive">
                Descrição é obrigatória
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category selection using our new component */}
            <CategorySelect
              categories={categories}
              value={categoryValue}
              onValueChange={handleCategoryChange}
              required={true}
              placeholder="Selecione uma categoria"
              error={fieldErrors.categoryId}
            />
            {fieldErrors.categoryId && (
              <div className="md:col-span-2 -mt-4">
                <p className="text-xs text-destructive">
                  Categoria é obrigatória
                </p>
              </div>
            )}

            {/* Filial selection using our new component */}
            <FilialSelect
              value={filialValue}
              onValueChange={handleFilialChange}
              required={true}
              placeholder="Selecione uma filial"
              error={fieldErrors.filial}
            />
            {fieldErrors.filial && (
              <div className="md:col-span-2 -mt-4">
                <p className="text-xs text-destructive">Filial é obrigatória</p>
              </div>
            )}
          </div>

          {/* Priority Selection */}
          <PrioritySelect
            value={priorityValue}
            onChange={(priority) => setPriorityValue(priority)}
            required={false}
            label="Prioridade do Ticket"
          />

          {/* File Upload Section */}
          <div className="space-y-3">
            <Label className="flex items-center text-sm font-medium">
              <LucidePaperclip className="h-4 w-4 mr-1.5 text-primary" />
              Anexos
              <span className="ml-2 text-xs text-muted-foreground">
                (opcional, max 10MB por arquivos)
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
                  Clique aqui ou arraste para importar arquivos
                </p>
                <p className="text-sm text-muted-foreground">
                  Suporta qualquer arquivo de até 10MB
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
                    ? "Arquivo selecionado"
                    : "Arquivos selecionados"}
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

          <CardFooter className="px-0 pt-4 flex justify-end">
            <Button
              type="submit"
              disabled={loading}
              className="bg-primary hover:bg-primary/90 min-w-32 gap-2"
            >
              {loading ? (
                <>
                  <LucideLoader2 className="h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                "Criar Ticket"
              )}
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
};
