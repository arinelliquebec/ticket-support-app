import {
  LucideTicketX,
  LucideTicketPlus,
  LucideArrowDown,
  LucideArrowUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function EmptyTickets() {
  return (
    <div className="w-full flex flex-col items-center justify-center py-12 px-4 md:py-16 animate-fade-from-top">
      <div className="bg-primary/5 border border-primary/10 rounded-full p-6 mb-6 shadow-glow">
        <LucideTicketX className="h-16 w-16 text-primary/60" />
      </div>

      <h3 className="text-2xl font-bold mb-2 text-center text-glow">
        Nenhum Ticket encontrado
      </h3>

      <p className="text-muted-foreground text-center max-w-md mb-8">
        Você ainda não possui tickets.
      </p>

      <div className="flex flex-col items-center">
        <Button
          asChild
          size="lg"
          className="bg-primary hover:bg-primary/90 font-medium shadow-glow"
        >
          <Link href="#new">
            <LucideTicketPlus className="mr-2 h-5 w-5" />
            Crie seu primeiro ticket
          </Link>
        </Button>

        <div className="mt-8 text-muted-foreground flex flex-col items-center animate-bounce">
          <p className="text-sm font-medium mb-2">Role para cima para criar</p>
          <LucideArrowUp className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
