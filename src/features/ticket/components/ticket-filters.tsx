// src/features/ticket/components/ticket-filters.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  LucideSearch,
  LucideFilter,
  LucideX,
  LucideRefreshCw,
  LucideBuilding,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { DatePicker } from "@/components/date-picker";

// Define list of branches/filiais
const filialOptions = [
  { value: "Matriz", label: "Matriz" },
  { value: "Filial SP", label: "Filial São Paulo" },
  { value: "Filial RJ", label: "Filial Rio de Janeiro" },
  { value: "Filial BH", label: "Filial Belo Horizonte" },
  { value: "Filial RS", label: "Filial Porto Alegre" },
  { value: "Filial BA", label: "Filial Salvador" },
];

export type TicketFiltersWithUrlProps = {
  categories?: Array<{ id: string; name: string; color: string }>;
  showMobile?: boolean;
};

export const TicketFiltersWithUrl = ({
  categories = [],
  showMobile = true,
}: TicketFiltersWithUrlProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  // Get current filter values from URL
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";
  const category = searchParams.get("categoryId") || "";
  const dateFrom = searchParams.get("dateFrom") || "";
  const dateTo = searchParams.get("dateTo") || "";
  const filial = searchParams.get("filial") || "";
  const sortBy = searchParams.get("sortBy") || "";
  const sortOrder = searchParams.get("sortOrder") || "";

  // Local filter state for form inputs
  const [localFilters, setLocalFilters] = useState({
    search,
    status,
    categoryId: category,
    dateFrom,
    dateTo,
    filial,
    sortBy,
    sortOrder,
  });

  // Update local state when URL params change
  useEffect(() => {
    setLocalFilters({
      search: searchParams.get("search") || "",
      status: searchParams.get("status") || "",
      categoryId: searchParams.get("categoryId") || "",
      dateFrom: searchParams.get("dateFrom") || "",
      dateTo: searchParams.get("dateTo") || "",
      filial: searchParams.get("filial") || "",
      sortBy: searchParams.get("sortBy") || "",
      sortOrder: searchParams.get("sortOrder") || "",
    });
  }, [searchParams]);

  // Count active filters
  const countActiveFilters = () => {
    let count = 0;
    if (status) count++;
    if (category) count++;
    if (dateFrom) count++;
    if (dateTo) count++;
    if (filial) count++;
    if (sortBy && sortOrder) count++;
    return count;
  };

  const activeFiltersCount = countActiveFilters();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalFilters((prev) => ({ ...prev, search: value }));

    // Debounce search
    if (searchTimeout) clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      applyFilter("search", value);
    }, 500);
  };

  let searchTimeout: NodeJS.Timeout | null = null;

  const handleFilterChange = (key: string, value: string) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    // Create new URLSearchParams object to modify
    const params = new URLSearchParams(searchParams.toString());

    // Update all filter parameters
    Object.entries(localFilters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    // Reset to first page when filters change
    params.set("page", "0");

    // Navigate to new URL with updated parameters
    const newUrl = `${pathname}?${params.toString()}`;
    router.push(newUrl);
    setIsPopoverOpen(false);
  };

  const applyFilter = (key: string, value: string) => {
    // Create new URLSearchParams object to modify
    const params = new URLSearchParams(searchParams.toString());

    // Update specific filter parameter
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    // Reset to first page when filters change
    params.set("page", "0");

    // Navigate to new URL with updated parameters
    const newUrl = `${pathname}?${params.toString()}`;
    router.push(newUrl);
  };

  const resetFilters = () => {
    // Create new URLSearchParams object with only pagination params
    const params = new URLSearchParams();

    // Keep pagination params if they exist
    const page = searchParams.get("page");
    const pageSize = searchParams.get("pageSize");

    if (page) params.set("page", page);
    if (pageSize) params.set("pageSize", pageSize);

    // Navigate to new URL with only pagination parameters
    router.push(`${pathname}?${params.toString()}`);

    // Reset local state
    setLocalFilters({
      search: "",
      status: "",
      categoryId: "",
      dateFrom: "",
      dateTo: "",
      filial: "",
      sortBy: "",
      sortOrder: "",
    });
  };

  // Get display value for status
  const getStatusLabel = (statusValue: string) => {
    switch (statusValue) {
      case "ABERTO":
        return "Open";
      case "EM_ANDAMENTO":
        return "In Progress";
      case "CONCLUÍDO":
        return "Done";
      default:
        return statusValue;
    }
  };

  // Get display value for sort
  const getSortLabel = (sortBy: string, sortOrder: string) => {
    const fieldLabels: Record<string, string> = {
      createdAt: "Criação",
      updatedAt: "Atualização",
      deadline: "Prazo",
    };

    const orderLabels: Record<string, string> = {
      desc: "Recente → Antigo",
      asc: "Antigo → Recente",
    };

    return `${fieldLabels[sortBy] || sortBy} (${
      orderLabels[sortOrder] || sortOrder
    })`;
  };

  return (
    <div className="w-full">
      {/* Desktop Filters */}
      <div className="hidden md:flex items-center gap-4 w-full">
        <div className="relative flex-1">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <LucideSearch className="h-4 w-4" />
          </div>
          <Input
            type="text"
            placeholder="Buscar..."
            className="pl-10 pr-4 rounded-lg border-muted/30 focus-visible:ring-primary/50"
            value={localFilters.search}
            onChange={handleSearchChange}
          />
        </div>

        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="font-medium gap-2 border-muted/30"
            >
              <LucideFilter className="h-4 w-4" />
              Filtros
              {activeFiltersCount > 0 && (
                <Badge className="h-5 w-5 p-0 flex items-center justify-center rounded-full bg-primary text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="end">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={localFilters.status || "all"}
                  onValueChange={(value) => {
                    handleFilterChange("status", value === "all" ? "" : value);
                  }}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="ABERTO">ABERTO</SelectItem>
                    <SelectItem value="EM_ANDAMENTO">EM_ANDAMENTO</SelectItem>
                    <SelectItem value="CONCLUÍDO">CONCLUÍDO</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filial Filter */}
              <div className="space-y-2">
                <Label htmlFor="filial">Filiais</Label>
                <Select
                  value={localFilters.filial || "all"}
                  onValueChange={(value) =>
                    handleFilterChange("filial", value === "all" ? "" : value)
                  }
                >
                  <SelectTrigger id="filial">
                    <SelectValue placeholder="All filiais" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Selecione</SelectItem>
                    {filialOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {categories.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="category">Categorias</Label>
                  <Select
                    value={localFilters.categoryId || "all"}
                    onValueChange={(value) =>
                      handleFilterChange(
                        "categoryId",
                        value === "all" ? "" : value
                      )
                    }
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Selecione</SelectItem>
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
              )}

              {/* Ordenação por Data */}
              <div className="space-y-2">
                <Label htmlFor="sortBy">Ordenar por Data</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Select
                    value={localFilters.sortBy || ""}
                    onValueChange={(value) => {
                      const newSortOrder = localFilters.sortOrder || "desc";
                      setLocalFilters((prev) => ({
                        ...prev,
                        sortBy: value,
                        sortOrder: newSortOrder,
                      }));

                      // Aplicar filtros imediatamente
                      const params = new URLSearchParams(
                        searchParams.toString()
                      );
                      if (value) {
                        params.set("sortBy", value);
                        params.set("sortOrder", newSortOrder);
                      } else {
                        params.delete("sortBy");
                        params.delete("sortOrder");
                      }
                      params.set("page", "0");
                      router.push(`${pathname}?${params.toString()}`);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Campo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="createdAt">Data de Criação</SelectItem>
                      <SelectItem value="updatedAt">
                        Data de Atualização
                      </SelectItem>
                      <SelectItem value="deadline">Prazo</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={localFilters.sortOrder || "desc"}
                    onValueChange={(value) => {
                      const currentSortBy = localFilters.sortBy || "createdAt";
                      setLocalFilters((prev) => ({
                        ...prev,
                        sortOrder: value,
                        sortBy: currentSortBy,
                      }));

                      // Aplicar filtros imediatamente
                      const params = new URLSearchParams(
                        searchParams.toString()
                      );
                      params.set("sortBy", currentSortBy);
                      params.set("sortOrder", value);
                      params.set("page", "0");
                      router.push(`${pathname}?${params.toString()}`);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Ordem" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desc">Mais Recente</SelectItem>
                      <SelectItem value="asc">Mais Antigo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetFilters}
                  className="text-muted-foreground"
                >
                  Reset
                </Button>
                <Button size="sm" onClick={applyFilters}>
                  Aplicar Filtros
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={resetFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <LucideRefreshCw className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Mobile Filters - simplified for brevity */}
      {showMobile && (
        <div className="flex md:hidden items-center gap-2 w-full">
          {/* Mobile filters implementation here */}
        </div>
      )}

      {/* Filter Tags */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {status && (
            <Badge
              variant="outline"
              className="bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300 border-blue-200"
            >
              Status: {getStatusLabel(status)}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1 hover:bg-transparent"
                onClick={() => applyFilter("status", "")}
              >
                <LucideX className="h-3 w-3" />
              </Button>
            </Badge>
          )}

          {filial && (
            <Badge
              variant="outline"
              className="bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-300 border-purple-200"
            >
              Filial: {filial}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1 hover:bg-transparent"
                onClick={() => applyFilter("filial", "")}
              >
                <LucideX className="h-3 w-3" />
              </Button>
            </Badge>
          )}

          {sortBy && sortOrder && (
            <Badge
              variant="outline"
              className="bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-300 border-green-200"
            >
              Ordenação: {getSortLabel(sortBy, sortOrder)}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1 hover:bg-transparent"
                onClick={() => {
                  applyFilter("sortBy", "");
                  applyFilter("sortOrder", "");
                }}
              >
                <LucideX className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};
