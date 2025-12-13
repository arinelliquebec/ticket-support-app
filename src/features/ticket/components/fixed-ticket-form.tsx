"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  LucideBuilding,
  LucideHeading,
  LucideFileText,
  LucideTag,
  LucideAlertTriangle,
} from "lucide-react";
import { createFixedTicket } from "@/actions/fixed-ticket";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ticketPath } from "@/paths";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define props type for FixedTicketForm
type FixedTicketFormProps = {
  categories: Array<{ id: string; name: string; color: string }>;
};

// Define filial options
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

export const FixedTicketForm = ({ categories }: FixedTicketFormProps) => {
  const router = useRouter();

  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [filial, setFilial] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form validation state
  const [titleLength, setTitleLength] = useState(0);
  const [contentLength, setContentLength] = useState(0);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    setTitleLength(e.target.value.length);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setContentLength(e.target.value.length);
  };

  const handleCategoryChange = (value: string) => {
    // Handle "none" selection properly
    setCategoryId(value === "none" ? null : value);
  };

  const handleFilialChange = (value: string) => {
    // Handle "none" selection properly
    setFilial(value === "none" ? null : value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!title || !content) {
        setError("Title and content are required");
        setLoading(false);
        return;
      }

      // Create FormData object manually
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);

      // CRITICAL FIX: Handle null values correctly
      // Only append if not null, and use explicit "null" string when needed
      if (categoryId === null) {
        formData.append("categoryId", "null");
      } else if (categoryId) {
        formData.append("categoryId", categoryId);
      }

      if (filial === null) {
        formData.append("filial", "null");
      } else if (filial) {
        formData.append("filial", filial);
      }

      // Submit the form data
      const result = await createFixedTicket(formData);

      if (result.success) {
        toast.success("Ticket created successfully");
        if (result.ticketId) {
          router.push(ticketPath(result.ticketId));
        }
      } else {
        setError(result.error || "Failed to create ticket");
        console.error("Error details:", result.errorDetails);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      console.error("Form submission error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
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
          Title
          <span className="ml-auto text-xs text-muted-foreground">
            {titleLength}/191
          </span>
        </Label>
        <Input
          id="title"
          value={title}
          onChange={handleTitleChange}
          maxLength={191}
          placeholder="Digite o título do ticket..."
          className="rounded-lg border-muted/30 focus-visible:ring-primary/50"
          required
        />
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="content"
          className="flex items-center text-sm font-medium"
        >
          <LucideFileText className="h-4 w-4 mr-1.5 text-primary" />
          Description
          <span className="ml-auto text-xs text-muted-foreground">
            {contentLength}/1024
          </span>
        </Label>
        <Textarea
          id="content"
          value={content}
          onChange={handleContentChange}
          maxLength={1024}
          placeholder="Descreva seu problema em detalhes..."
          className="rounded-lg border-muted/30 focus-visible:ring-primary/50 min-h-32"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label
            htmlFor="category"
            className="flex items-center text-sm font-medium"
          >
            <LucideTag className="h-4 w-4 mr-1.5 text-primary" />
            Category
          </Label>
          <Select onValueChange={handleCategoryChange} defaultValue="none">
            <SelectTrigger
              id="category"
              className="rounded-lg border-muted/30 focus-visible:ring-primary/50 transition-all duration-200 shadow-sm"
            >
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No category</SelectItem>
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

        <div className="space-y-2">
          <Label
            htmlFor="filial"
            className="flex items-center text-sm font-medium"
          >
            <LucideBuilding className="h-4 w-4 mr-1.5 text-primary" />
            Branch
          </Label>
          <Select onValueChange={handleFilialChange} defaultValue="none">
            <SelectTrigger
              id="filial"
              className="rounded-lg border-muted/30 focus-visible:ring-primary/50 transition-all duration-200 shadow-sm"
            >
              <SelectValue placeholder="Select a branch" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No branch</SelectItem>
              {filialOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="bg-primary hover:bg-primary/90 transition-all duration-300 w-full sm:w-auto"
      >
        {loading ? "Creating..." : "Create Ticket"}
      </Button>
    </form>
  );
};
