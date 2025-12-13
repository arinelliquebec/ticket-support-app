"use client";

import { useState } from "react";
import { CategoryType } from "./category-select";
import { CategoryBadge } from "./category-badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LucideEdit,
  LucideTrash,
  LucideMoreVertical,
  LucidePlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CategoryCreateForm } from "./category-create-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type CategoryListProps = {
  categories: CategoryType[];
  onEdit?: (category: CategoryType) => void;
  onDelete?: (id: string) => void;
  onAdd?: (category: CategoryType) => void;
};

export const CategoryList = ({
  categories,
  onEdit,
  onDelete,
  onAdd,
}: CategoryListProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Categorias</h2>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <LucidePlus className="h-4 w-4 mr-2" />
                Nova Categoria
              </Button>
            </DialogTrigger>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.length === 0 ? (
            <div className="col-span-2 text-center py-8 bg-muted/30 rounded-lg border border-dashed border-muted-foreground/30">
              <p className="text-muted-foreground">
                Nenhuma categoria encontrada
              </p>
              <Button variant="link" onClick={() => setIsAddDialogOpen(true)}>
                Criar sua primeira categoria
              </Button>
            </div>
          ) : (
            categories.map((category) => (
              <Card key={category.id} className="border-muted/30">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CategoryBadge
                      name={category.name}
                      color={category.color}
                    />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <LucideMoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit?.(category)}>
                          <LucideEdit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => onDelete?.(category.id)}
                        >
                          <LucideTrash className="h-4 w-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                {category.description && (
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {category.description}
                    </p>
                  </CardContent>
                )}
                <CardFooter className="pt-0 pb-2 text-xs text-muted-foreground">
                  {/* Aqui você pode mostrar o número de tickets nesta categoria */}
                  {/* Ex: 12 tickets nesta categoria */}
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </div>
    </>
  );
};
