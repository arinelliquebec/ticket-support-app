"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LucideTag } from "lucide-react";
import { useState, useEffect } from "react";

export type CategoryType = {
  id: string;
  name: string;
  color: string;
  description?: string;
};

interface EnhancedCategorySelectProps {
  categories: CategoryType[];
  value: string;
  onValueChange: (value: string) => void;
  required?: boolean;
  className?: string;
  label?: string;
  showLabel?: boolean;
  placeholder?: string;
  includeNone?: boolean;
  noneLabel?: string;
  id?: string;
}

export function EnhancedCategorySelect({
  categories = [],
  value,
  onValueChange,
  required = false,
  className = "",
  label = "Categoria",
  showLabel = true,
  placeholder = "Selecione uma categoria",
  includeNone = true,
  noneLabel = "Sem categoria",
  id = "category-select",
}: EnhancedCategorySelectProps) {
  // Sort categories alphabetically
  const sortedCategories = [...categories].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  // Group categories by type
  const getGroupedCategories = () => {
    // Special categories to prioritize
    const highPriorityCategories = [
      "Hardware",
      "Internet",
      "AlterData",
      "Sistema Financeiro",
    ];

    const prioritized = sortedCategories.filter((c) =>
      highPriorityCategories.includes(c.name)
    );

    const others = sortedCategories.filter(
      (c) => !highPriorityCategories.includes(c.name) && c.name !== "Outros"
    );

    const misc = sortedCategories.filter((c) => c.name === "Outros");

    return [...prioritized, ...others, ...misc];
  };

  const groupedCategories = getGroupedCategories();

  // CRITICAL FIX: Ensure we have proper handling for null/empty values
  // Convert empty string or null to "none" for the Select component
  const [internalValue, setInternalValue] = useState(
    !value || value === "null" ? "none" : value
  );

  // Update internal state when the value prop changes
  useEffect(() => {
    setInternalValue(!value || value === "null" ? "none" : value);
  }, [value]);

  // CRITICAL FIX: Properly convert "none" back to "null" for database
  const handleValueChange = (newValue: string) => {
    setInternalValue(newValue);
    onValueChange(newValue === "none" ? "null" : newValue);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {showLabel && (
        <Label htmlFor={id} className="flex items-center text-sm font-medium">
          <LucideTag className="h-4 w-4 mr-1.5 text-primary" />
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      <Select value={internalValue} onValueChange={handleValueChange}>
        <SelectTrigger
          id={id}
          className="rounded-lg border-muted/30 focus-visible:ring-primary/50 transition-all duration-200 shadow-sm"
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {includeNone && <SelectItem value="none">{noneLabel}</SelectItem>}
          {groupedCategories.map((category) => (
            <SelectItem
              key={category.id}
              value={category.id}
              className="flex items-center"
            >
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
}
