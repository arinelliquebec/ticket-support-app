"use client";

import { Ticket } from "@prisma/client";
import { Suspense, useState, useEffect } from "react";
import { Spinner } from "@/components/spinner";
import { TicketItem } from "./ticket-item";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LucideFileText,
  LucidePencil,
  LucideCheckCircle,
  LucideTicketPlus,
  LucideInbox,
  LucideZap,
  LucideActivity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Box, LinearProgress } from "@mui/material";

interface EnhancedTicketListProps {
  tickets: (Ticket & {
    user?: {
      username: string;
    } | null;
    category?: {
      id: string;
      name: string;
      color: string;
    } | null;
    _count?: {
      attachments: number;
      comments: number;
    };
  })[];
}

export const EnhancedTicketList = ({ tickets }: EnhancedTicketListProps) => {
  const [groupedTickets, setGroupedTickets] = useState<{
    open: typeof tickets;
    inProgress: typeof tickets;
    done: typeof tickets;
  }>({
    open: [],
    inProgress: [],
    done: [],
  });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Group tickets by status
  useEffect(() => {
    const open = tickets.filter((ticket) => ticket.status === "ABERTO");
    const inProgress = tickets.filter(
      (ticket) => ticket.status === "EM_ANDAMENTO"
    );
    const done = tickets.filter((ticket) => ticket.status === "CONCLUÍDO");

    setGroupedTickets({
      open,
      inProgress,
      done,
    });
  }, [tickets]);

  if (tickets.length === 0) {
    return (
      <motion.div
        className="w-full max-w-2xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative overflow-hidden rounded-3xl border-2 border-dashed border-primary/20 bg-gradient-to-br from-background/50 via-background/80 to-background/50 backdrop-blur-sm p-12">
          {/* Animated background gradient */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-blue-500/5"
            animate={{
              backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              backgroundSize: "200% 200%",
            }}
          />

          <div className="relative z-10 text-center space-y-4">
            <motion.div
              className="inline-flex p-5 rounded-2xl bg-primary/10 border border-primary/20"
              animate={{
                scale: [1, 1.05, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <LucideInbox className="h-12 w-12 text-primary" />
            </motion.div>

            <h3 className="text-2xl font-bold bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
              Nenhum Ticket encontrado
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Tente ajustar seus filtros de pesquisa ou crie um novo ticket para começar
            </p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Button asChild variant="futuristic" size="lg" className="mt-4">
                <Link href="/tickets/new" className="flex items-center gap-2">
                  <LucideTicketPlus className="h-5 w-5" />
                  Criar Primeiro Ticket
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Calculate completion percentage
  const completionPercentage = tickets.length > 0
    ? (groupedTickets.done.length / tickets.length) * 100
    : 0;

  const getCountBadge = (count: number, variant: "blue" | "amber" | "green" | "default" = "default") => {
    const variantClasses = {
      blue: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      amber: "bg-amber-500/20 text-amber-300 border-amber-500/30",
      green: "bg-green-500/20 text-green-300 border-green-500/30",
      default: "bg-primary/20 text-primary border-primary/30",
    };

    return (
      <motion.span
        className={`ml-2 px-2 py-0.5 rounded-md text-xs font-semibold border ${variantClasses[variant]} backdrop-blur-sm`}
        whileHover={{ scale: 1.1 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        {count}
      </motion.span>
    );
  };

  const EmptyState = ({ message, icon: Icon }: { message: string; icon: any }) => (
    <motion.div
      className="p-12 text-center rounded-2xl border-2 border-dashed border-primary/10 bg-gradient-to-br from-background/50 to-background/80 backdrop-blur-sm"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="inline-flex p-4 rounded-xl bg-primary/10 border border-primary/20 mb-4"
        animate={{
          rotate: [0, 10, -10, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <Icon className="h-8 w-8 text-primary" />
      </motion.div>
      <p className="text-muted-foreground">{message}</p>
    </motion.div>
  );

  return (
    <motion.div
      className="w-full"
      initial={isMounted ? { opacity: 0, y: 20 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Tabs defaultValue="all" className="w-full">
        {/* Header with tabs and create button */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-8">
          {/* Tabs */}
          <div className="flex-1">
            <TabsList className="grid w-full lg:max-w-[650px] grid-cols-4 h-auto p-1.5 bg-background/50 backdrop-blur-md border border-primary/10 rounded-2xl">
              <TabsTrigger
                value="all"
                className="gap-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/20 data-[state=active]:to-blue-500/20 data-[state=active]:text-foreground data-[state=active]:border data-[state=active]:border-primary/30 rounded-xl transition-all duration-300"
              >
                <LucideActivity className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Todos</span>
                {getCountBadge(tickets.length)}
              </TabsTrigger>
              <TabsTrigger
                value="open"
                className="gap-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/20 data-[state=active]:to-cyan-500/20 data-[state=active]:text-foreground data-[state=active]:border data-[state=active]:border-blue-500/30 rounded-xl transition-all duration-300"
              >
                <LucideFileText className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Aberto</span>
                {getCountBadge(groupedTickets.open.length, "blue")}
              </TabsTrigger>
              <TabsTrigger
                value="in-progress"
                className="gap-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500/20 data-[state=active]:to-yellow-500/20 data-[state=active]:text-foreground data-[state=active]:border data-[state=active]:border-amber-500/30 rounded-xl transition-all duration-300"
              >
                <LucidePencil className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Andamento</span>
                {getCountBadge(groupedTickets.inProgress.length, "amber")}
              </TabsTrigger>
              <TabsTrigger
                value="done"
                className="gap-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500/20 data-[state=active]:to-emerald-500/20 data-[state=active]:text-foreground data-[state=active]:border data-[state=active]:border-green-500/30 rounded-xl transition-all duration-300"
              >
                <LucideCheckCircle className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Concluído</span>
                {getCountBadge(groupedTickets.done.length, "green")}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Create button */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Button asChild variant="futuristic" className="w-full lg:w-auto shadow-lg">
              <Link href="/tickets/new" className="flex items-center gap-2">
                <LucideTicketPlus className="h-4 w-4" />
                <span>Novo Ticket</span>
                <LucideZap className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </motion.div>
        </div>

        {/* Progress indicator */}
        <motion.div
          className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-sm border border-primary/10"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground/80">
              Progresso Geral
            </span>
            <span className="text-sm font-bold text-primary">
              {completionPercentage.toFixed(0)}%
            </span>
          </div>
          <Box>
            <LinearProgress
              variant="determinate"
              value={completionPercentage}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: 'rgba(14, 165, 233, 0.1)',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  background: 'linear-gradient(90deg, rgb(14, 165, 233), rgb(59, 130, 246), rgb(99, 102, 241))',
                },
              }}
            />
          </Box>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>{groupedTickets.done.length} concluídos</span>
            <span>{tickets.length} total</span>
          </div>
        </motion.div>

        {/* Tab Contents */}
        <TabsContent value="all" className="space-y-6 mt-0">
          <motion.div
            className="flex flex-col items-center gap-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {tickets.map((ticket, index) => (
              <motion.div
                key={`all-${ticket.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                className="w-full"
              >
                <Suspense fallback={<Spinner />}>
                  <TicketItem ticket={ticket} />
                </Suspense>
              </motion.div>
            ))}
          </motion.div>
        </TabsContent>

        <TabsContent value="open" className="space-y-6 mt-0">
          {groupedTickets.open.length === 0 ? (
            <EmptyState
              message="Nenhum ticket aberto"
              icon={LucideFileText}
            />
          ) : (
            <motion.div
              className="flex flex-col items-center gap-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {groupedTickets.open.map((ticket, index) => (
                <motion.div
                  key={`open-${ticket.id}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  className="w-full"
                >
                  <Suspense fallback={<Spinner />}>
                    <TicketItem ticket={ticket} />
                  </Suspense>
                </motion.div>
              ))}
            </motion.div>
          )}
        </TabsContent>

        <TabsContent value="in-progress" className="space-y-6 mt-0">
          {groupedTickets.inProgress.length === 0 ? (
            <EmptyState
              message="Nenhum ticket em andamento"
              icon={LucidePencil}
            />
          ) : (
            <motion.div
              className="flex flex-col items-center gap-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {groupedTickets.inProgress.map((ticket, index) => (
                <motion.div
                  key={`progress-${ticket.id}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  className="w-full"
                >
                  <Suspense fallback={<Spinner />}>
                    <TicketItem ticket={ticket} />
                  </Suspense>
                </motion.div>
              ))}
            </motion.div>
          )}
        </TabsContent>

        <TabsContent value="done" className="space-y-6 mt-0">
          {groupedTickets.done.length === 0 ? (
            <EmptyState
              message="Nenhum ticket concluído"
              icon={LucideCheckCircle}
            />
          ) : (
            <motion.div
              className="flex flex-col items-center gap-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {groupedTickets.done.map((ticket, index) => (
                <motion.div
                  key={`done-${ticket.id}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  className="w-full"
                >
                  <Suspense fallback={<Spinner />}>
                    <TicketItem ticket={ticket} />
                  </Suspense>
                </motion.div>
              ))}
            </motion.div>
          )}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};
