"use client";

import { LucideTag } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";

export type CategoryType = {
  id: string;
  name: string;
  color: string;
  description?: string;
};

type CategorySelectProps = {
  categories: CategoryType[];
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

export const CategorySelect = ({
  categories,
  value,
  onValueChange,
  label = "Categoria",
  placeholder = "Selecione uma categoria",
  required = true, // Default to required
  triggerClassName = "",
  showLabel = true,
  includeEmpty = false, // Changed default to false
  emptyLabel = "Selecione uma categoria", // Updated label
  disabled = false,
  id = "category-select",
  error = false,
}: CategorySelectProps) => {
  // Handle null/empty values
  const [internalValue, setInternalValue] = useState(
    !value || value === "null" ? "" : value
  );

  // Update internal state when the value prop changes
  useEffect(() => {
    setInternalValue(!value || value === "null" ? "" : value);
  }, [value]);

  // Convert "none" back to "null" for database if needed
  const handleValueChange = (newValue: string) => {
    setInternalValue(newValue);
    onValueChange(newValue === "none" ? "null" : newValue);
  };

  return (
    <div className="space-y-2">
      {showLabel && (
        <Label htmlFor={id} className="flex items-center text-sm font-medium">
          <LucideTag className="h-4 w-4 mr-1.5 text-primary" />
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
  );
};
