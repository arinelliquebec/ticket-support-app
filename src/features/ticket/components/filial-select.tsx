"use client";

import { LucideBuilding } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";

// Define the standard filial options that can be used across the application
export const FILIAL_OPTIONS = [
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

type FilialSelectProps = {
  value: string;
  onValueChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  triggerClassName?: string;
  showLabel?: boolean;
  includeEmpty?: boolean;
  emptyLabel?: string;
  disabled?: boolean;
  id?: string;
  error?: boolean;
};

export const FilialSelect = ({
  value,
  onValueChange,
  label = "Filial",
  placeholder = "Selecione uma filial",
  required = true, // Changed default to true
  triggerClassName = "",
  showLabel = true,
  includeEmpty = false, // Changed default to false since it's required
  emptyLabel = "Selecione uma filial", // Updated label
  disabled = false,
  id = "filial-select",
  error = false,
}: FilialSelectProps) => {
  // CRITICAL FIX: Ensure we have proper handling for null/empty values
  // Convert empty string or null to "none" for the Select component
  const [internalValue, setInternalValue] = useState(
    !value || value === "null" ? "" : value
  );

  // Update internal state when the value prop changes
  useEffect(() => {
    setInternalValue(!value || value === "null" ? "" : value);
  }, [value]);

  // CRITICAL FIX: Properly convert "none" back to "null" for database
  const handleValueChange = (newValue: string) => {
    setInternalValue(newValue);
    onValueChange(newValue === "none" ? "null" : newValue);
  };

  return (
    <div className="space-y-2">
      {showLabel && (
        <Label htmlFor={id} className="flex items-center text-sm font-medium">
          <LucideBuilding className="h-4 w-4 mr-1.5 text-primary" />
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      <Select
        value={internalValue}
        onValueChange={handleValueChange}
        disabled={disabled}
        required={required}
      >
        <SelectTrigger
          id={id}
          className={`rounded-lg border-muted/30 focus-visible:ring-primary/50 transition-all duration-200 shadow-sm ${
            error ? "border-destructive" : ""
          } ${triggerClassName}`}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {includeEmpty && <SelectItem value="none">{emptyLabel}</SelectItem>}
          {FILIAL_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
