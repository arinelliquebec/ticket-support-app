"use client";

import { useState, useEffect } from "react";
import {
  LucideTag,
  LucideSearch,
  LucidePlus,
  LucideEdit,
  LucideTrash,
  LucideLoader2,
  LucideCheck,
  LucideX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { CategoryType } from "./enhanced-category-select";
import { toast } from "sonner";
import { EnhancedCategoryBadge } from "./enhanced-category-badge";
import { Label } from "@/components/ui/label";

// Standard category colors for reference
const STANDARD_COLORS = {
  "3CX | Telefonia": "#EC4899",
  Fone: "#F87171",
  Monitor: "#34D399",
  Hardware: "#60A5FA",
  AlterData: "#FBBF24",
  Internet: "#8B5CF6",
  Mouse: "#A78BFA",
  Email: "#4F46E5",
  "Domínio Web": "#0EA5E9",
  "Sistema Financeiro": "#10B981",
  D4SIGN: "#F59E0B",
  "Criação | Exclusão de Usuário": "#EF4444",
  CRM: "#8B5CF6",
  "Rock Data": "#EC4899",
  "Confirme Online": "#6366F1",
  Outros: "#9CA3AF",
};

export function AdminCategoryManager() {
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<CategoryType[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    color: "#6366F1",
    description: "",
  });
  const [isEditing, setIsEditing] = useState(false);

  // Fetch categories when component mounts
  useEffect(() => {
    fetchCategories();
  }, []);

  // Filter categories when search changes
  useEffect(() => {
    if (!search.trim()) {
      setFilteredCategories(categories);
      return;
    }

    const filtered = categories.filter(
      (category) =>
        category.name.toLowerCase().includes(search.toLowerCase()) ||
        (category.description &&
          category.description.toLowerCase().includes(search.toLowerCase()))
    );

    setFilteredCategories(filtered);
  }, [categories, search]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/categories");

      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }

      const data = await response.json();
      setCategories(data);
      setFilteredCategories(data);
    } catch (error) {
      console.error("Error loading categories:", error);
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const refreshCategories = async () => {
    setIsRefreshing(true);
    await fetchCategories();
    setIsRefreshing(false);
  };

  const handleEditCategory = (category: CategoryType) => {
    setFormData({
      id: category.id,
      name: category.name,
      color: category.color,
      description: category.description || "",
    });
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleNewCategory = () => {
    setFormData({
      id: "",
      name: "",
      color: "#6366F1",
      description: "",
    });
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  const handleDeleteCategory = async (id: string) => {
    // Confirm before deleting
    if (!confirm("Are you sure you want to delete this category?")) {
      return;
    }

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete category");
      }

      toast.success("Category deleted successfully");
      setCategories((prev) => prev.filter((cat) => cat.id !== id));
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = isEditing
        ? `/api/categories/${formData.id}`
        : "/api/categories";

      const method = isEditing ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(
          isEditing ? "Failed to update category" : "Failed to create category"
        );
      }

      const data = await response.json();

      toast.success(
        isEditing
          ? "Category updated successfully"
          : "Category created successfully"
      );

      if (isEditing) {
        setCategories((prev) =>
          prev.map((cat) => (cat.id === data.id ? data : cat))
        );
      } else {
        setCategories((prev) => [...prev, data]);
      }

      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error("Failed to save category");
    }
  };

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Color presets based on standard colors
  const colorPresets = Object.values(STANDARD_COLORS);

  return (
    <div className="space-y-6">
      {/* Header and search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-auto sm:min-w-[300px]">
          <LucideSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search categories..."
            className="pl-10 rounded-lg border-muted/30"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={refreshCategories}
            disabled={isRefreshing}
          >
            <LucideLoader2
              className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
          </Button>

          <Button onClick={handleNewCategory}>
            <LucidePlus className="h-4 w-4 mr-2" />
            New Category
          </Button>
        </div>
      </div>

      {/* Categories grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <LucideLoader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.length === 0 ? (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              No categories found
            </div>
          ) : (
            filteredCategories.map((category) => (
              <Card
                key={category.id}
                className="hover:shadow-md transition-all duration-300"
              >
                <CardHeader className="pb-2 flex flex-row justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <CardTitle className="text-base font-medium">
                      {category.name}
                    </CardTitle>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditCategory(category)}
                    >
                      <LucideEdit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteCategory(category.id)}
                    >
                      <LucideTrash className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="flex flex-col gap-2">
                    <EnhancedCategoryBadge
                      name={category.name}
                      color={category.color}
                      className="w-fit"
                    />

                    {category.description && (
                      <p className="text-sm text-muted-foreground">
                        {category.description}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Dialog for adding/editing categories */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Category" : "Create New Category"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update the details of this category"
                : "Add a new category to organize tickets"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Category Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Hardware, Internet, etc."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="color"
                  name="color"
                  type="color"
                  value={formData.color}
                  onChange={handleChange}
                  className="w-16 h-8 p-1"
                  required
                />
                <Input
                  type="text"
                  value={formData.color}
                  onChange={handleChange}
                  name="color"
                  placeholder="#HEXCODE"
                  className="flex-1"
                />
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {colorPresets.map((color, index) => (
                  <div
                    key={index}
                    className="w-6 h-6 rounded-full cursor-pointer border border-muted hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData((prev) => ({ ...prev, color }))}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Brief description of this category"
              />
            </div>

            <div className="pt-4 flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                <LucideX className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button type="submit">
                <LucideCheck className="h-4 w-4 mr-2" />
                {isEditing ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
