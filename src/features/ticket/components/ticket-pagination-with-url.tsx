"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LucideChevronLeft, LucideChevronRight } from "lucide-react";

type TicketPaginationWithUrlProps = {
  currentPage: number;
  totalCount: number;
  pageSize: number;
  hasNextPage: boolean;
};

export const TicketPaginationWithUrl = ({
  currentPage,
  totalCount,
  pageSize,
  hasNextPage,
}: TicketPaginationWithUrlProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Calculate range of items being displayed
  const startItem = totalCount === 0 ? 0 : currentPage * pageSize + 1;
  const endItem = Math.min((currentPage + 1) * pageSize, totalCount);

  const handlePageChange = (newPage: number) => {
    // Create new URLSearchParams object to modify
    const params = new URLSearchParams(searchParams.toString());

    // Update page parameter
    params.set("page", newPage.toString());

    // Navigate to new URL with updated parameters
    router.push(`${pathname}?${params.toString()}`);
  };

  const handlePageSizeChange = (newSize: string) => {
    // Create new URLSearchParams object to modify
    const params = new URLSearchParams(searchParams.toString());

    // Update pageSize parameter and reset to first page
    params.set("pageSize", newSize);
    params.set("page", "0");

    // Navigate to new URL with updated parameters
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between w-full py-4 gap-4">
      <div className="text-sm text-muted-foreground">
        Mostrando <span className="font-medium">{startItem}</span> até{" "}
        <span className="font-medium">{endItem}</span> de{" "}
        <span className="font-medium">{totalCount}</span> tickets
      </div>

      <div className="flex items-center space-x-4">
        <Select
          value={pageSize.toString()}
          onValueChange={handlePageSizeChange}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder={`${pageSize} por página`} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5 por página</SelectItem>
            <SelectItem value="10">10 por página</SelectItem>
            <SelectItem value="20">20 por página</SelectItem>
            <SelectItem value="50">50 por página</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0}
          >
            <LucideChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">Página {currentPage + 1}</span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!hasNextPage}
          >
            <LucideChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
