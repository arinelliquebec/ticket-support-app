"use client";

import { useState, useEffect } from "react";
import { LucideTag, LucideSearch, LucidePlus } from "lucide-react";
import { Heading } from "@/components/heading";
import { Button } from "@/components/ui/button";
import { CategoryList } from "@/features/category/components/category-list";
import { CategoryType } from "@/features/category/components/category-select";
import { Input } from "@/components/ui/input";
import { CategoryCreateForm } from "@/features/category/components/category-create-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/spinner";

const AdminCategoriesPage = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<CategoryType[]>(
    []
  );
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Simular carregamento - em uma implementação real, você buscaria do seu banco de dados
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        // Aqui você deve buscar categorias da sua API
        // const response = await fetch('/api/categories');
        // const data = await response.json();

        // Dados de exemplo - substitua pela chamada real à sua API
        const data: CategoryType[] = [
          {
            id: "1",
            name: "Bug",
            color: "#EF4444",
            description: "Problemas e erros no sistema",
          },
          {
            id: "2",
            name: "Feature",
            color: "#3B82F6",
            description: "Novas funcionalidades",
          },
          {
            id: "3",
            name: "Enhancement",
            color: "#10B981",
            description: "Melhorias em funcionalidades existentes",
          },
          {
            id: "4",
            name: "Documentation",
            color: "#8B5CF6",
            description: "Atualização de documentação",
          },
          {
            id: "5",
            name: "Design",
            color: "#EC4899",
            description: "Melhorias de interface e experiência",
          },
        ];

        setCategories(data);
        setFilteredCategories(data);
      } catch (error) {
        console.error("Error loading categories:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  // Filtrar categorias quando a busca mudar
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

  // Simulação de edição de categoria
  const handleEditCategory = (category: CategoryType) => {
    // Em uma implementação real, você abriria um modal de edição
    console.log("Edit category:", category);
  };

  // Simulação de exclusão de categoria
  const handleDeleteCategory = (id: string) => {
    // Em uma implementação real, você confirmaria e então deletaria do banco
    console.log("Delete category:", id);

    // Atualizar estado local para simular
    setCategories((prev) => prev.filter((cat) => cat.id !== id));
  };

  // Simulação de adição de categoria
  const handleAddCategory = (category: CategoryType) => {
    // Em uma implementação real, você enviaria para a API
    console.log("Add category:", category);

    // Atualizar estado local para simular
    setCategories((prev) => [...prev, category]);

    // Fechar modal
    setIsAddDialogOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col gap-y-8 max-w-6xl mx-auto w-full px-4 pb-12">
      <div className="bg-gradient-to-r from-primary/5 to-transparent -mx-4 -mt-4 px-4 pt-4 pb-6 border-b border-muted/10">
        <Heading
          title="Gerenciamento de Categorias"
          description="Crie e gerencie categorias para organizar seus tickets"
          icon={<LucideTag className="h-8 w-8 text-primary" />}
        />
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-auto sm:min-w-[300px]">
          <LucideSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar categorias..."
            className="pl-10 rounded-lg border-muted/30"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Button onClick={() => setIsAddDialogOpen(true)}>
          <LucidePlus className="h-4 w-4 mr-2" />
          Nova Categoria
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner />
        </div>
      ) : (
        <CategoryList
          categories={filteredCategories}
          onEdit={handleEditCategory}
          onDelete={handleDeleteCategory}
          onAdd={handleAddCategory}
        />
      )}

      {/* Dialog para adicionar nova categoria */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Nova Categoria</DialogTitle>
            <DialogDescription>
              Crie uma nova categoria para organizar seus tickets.
            </DialogDescription>
          </DialogHeader>
          <CategoryCreateForm />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCategoriesPage;
