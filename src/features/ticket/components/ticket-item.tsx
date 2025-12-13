"use client";

import { Ticket } from "@prisma/client";
import {
  LucideArrowUpRightFromSquare,
  LucidePencil,
  LucideCalendar,
  LucideUser,
  LucideMoreVertical,
  LucideTag,
  LucidePaperclip,
  LucideMessageSquare,
  LucideBuilding,
  LucideCheckCircle,
  LucideFileText,
  LucideMail,
  LucideClock,
  LucideZap,
  LucideActivity,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ticketEditPath, ticketPath } from "@/paths";
import { TICKET_ICONS, TICKET_STATUS_LABELS } from "../constants";
import { TicketMoreMenu } from "./ticket-more-menu";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { format } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState, Suspense, useEffect } from "react";
import { ptBR } from "date-fns/locale";
import { CategoryBadge } from "@/features/category/components/category-badge";
import { TicketDetailAttachments } from "./ticket-detail-attachments";
import { motion, AnimatePresence } from "framer-motion";
import { TicketPriority, isUrgentPriority, PRIORITY_CONFIG } from "@/validations/ticket-schema";
import { PriorityBadge } from "@/components/priority-badge";
import { Box, Chip, LinearProgress } from "@mui/material";

type TicketItemProps = {
  ticket: Ticket & {
    user?: {
      username: string;
      email?: string;
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
  };
  isDetail?: boolean;
};

type CompletionInfo = {
  adminName: string;
  completedAt: Date;
};

export const TicketItem = ({ ticket, isDetail }: TicketItemProps) => {
  const { user } = useAuth();
  const [isHovered, setIsHovered] = useState(false);
  const [completionInfo, setCompletionInfo] = useState<CompletionInfo | null>(
    null
  );
  const [isLoadingCompletion, setIsLoadingCompletion] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Check if the current user is an admin or owner of this ticket
  const isAdmin = user?.role === "ADMIN";
  const isOwner = user?.id === ticket.userId;
  const canEdit = isAdmin || isOwner;

  // Check if ticket is urgent
  const isUrgent = isUrgentPriority(ticket.priority as TicketPriority);

  // Get priority config
  const priorityConfig = ticket.priority
    ? PRIORITY_CONFIG[ticket.priority as TicketPriority]
    : null;

  // Fetch completion info when the ticket is CONCLUÍDO
  useEffect(() => {
    const fetchCompletionInfo = async () => {
      if (ticket.status !== "CONCLUÍDO") return;

      setIsLoadingCompletion(true);
      try {
        const response = await fetch(`/api/tickets/${ticket.id}/comments`);
        if (!response.ok) throw new Error("Failed to fetch comments");

        const comments = await response.json();

        const completionPatterns = [
          /marked as CONCLUÍDO by admin: (.+)$/,
          /marcado como Concluído por: (.+)$/,
          /Ticket concluído por (.+)$/,
        ];

        const completionComment = comments
          .filter((comment: any) =>
            completionPatterns.some((pattern) => pattern.test(comment.content))
          )
          .sort(
            (a: any, b: any) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )[0];

        if (completionComment) {
          let adminName = "";
          for (const pattern of completionPatterns) {
            const match = completionComment.content.match(pattern);
            if (match && match[1]) {
              adminName = match[1];
              break;
            }
          }

          if (!adminName) {
            adminName = completionComment.user.username;
          }

          setCompletionInfo({
            adminName,
            completedAt: new Date(completionComment.createdAt),
          });
        }
      } catch (error) {
        console.error("Error fetching completion info:", error);
      } finally {
        setIsLoadingCompletion(false);
      }
    };

    fetchCompletionInfo();
  }, [ticket.id, ticket.status]);

  // Get status styling
  const getStatusStyle = () => {
    switch (ticket.status) {
      case "ABERTO":
        return {
          bgClass: "from-blue-500/20 via-cyan-500/10 to-sky-500/20",
          glowClass: "shadow-[0_0_30px_rgba(56,189,248,0.3),0_0_60px_rgba(14,165,233,0.2)]",
          borderClass: "border-blue-500/30",
          dotColor: "bg-blue-500",
          badgeClass: "bg-blue-500/20 text-blue-300 border-blue-500/40",
        };
      case "EM_ANDAMENTO":
        return {
          bgClass: "from-amber-500/20 via-yellow-500/10 to-orange-500/20",
          glowClass: "shadow-[0_0_30px_rgba(251,146,60,0.3),0_0_60px_rgba(245,158,11,0.2)]",
          borderClass: "border-amber-500/30",
          dotColor: "bg-amber-500",
          badgeClass: "bg-amber-500/20 text-amber-300 border-amber-500/40",
        };
      case "CONCLUÍDO":
        return {
          bgClass: "from-green-500/20 via-emerald-500/10 to-teal-500/20",
          glowClass: "shadow-[0_0_30px_rgba(16,185,129,0.3),0_0_60px_rgba(5,150,105,0.2)]",
          borderClass: "border-green-500/30",
          dotColor: "bg-green-500",
          badgeClass: "bg-green-500/20 text-green-300 border-green-500/40",
        };
      default:
        return {
          bgClass: "from-gray-500/20 via-slate-500/10 to-gray-500/20",
          glowClass: "shadow-[0_0_20px_rgba(148,163,184,0.2)]",
          borderClass: "border-gray-500/30",
          dotColor: "bg-gray-500",
          badgeClass: "bg-gray-500/20 text-gray-300 border-gray-500/40",
        };
    }
  };

  const statusStyle = getStatusStyle();

  // Render status badge
  const getStatusBadge = () => {
    if (ticket.status === "CONCLUÍDO" && completionInfo) {
      return (
        <motion.div
          className="flex flex-col items-end gap-1"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Chip
            icon={<LucideCheckCircle className="h-3 w-3" />}
            label={TICKET_STATUS_LABELS[ticket.status]}
            size="small"
            className={`${statusStyle.badgeClass} font-medium backdrop-blur-sm`}
          />

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center text-xs text-green-300/80 cursor-help hover:text-green-300 transition-colors">
                  <LucideCheckCircle className="h-3 w-3 mr-1" />
                  <span>{completionInfo.adminName}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  Concluído em{" "}
                  {format(completionInfo.completedAt, "dd/MM/yyyy 'às' HH:mm", {
                    locale: ptBR,
                  })}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </motion.div>
      );
    }

    return (
      <Chip
        label={
          <span className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${statusStyle.dotColor} animate-pulse`} />
            {TICKET_STATUS_LABELS[ticket.status]}
          </span>
        }
        size="small"
        className={`${statusStyle.badgeClass} font-medium backdrop-blur-sm`}
      />
    );
  };

  // Action buttons
  const detailButton = (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            asChild
            className="rounded-xl border-primary/20 bg-primary/5 hover:bg-primary/15 hover:border-primary/40 hover:scale-105 transition-all duration-300 backdrop-blur-sm"
          >
            <Link prefetch href={ticketPath(ticket.id)}>
              <LucideArrowUpRightFromSquare className="h-4 w-4 text-primary" />
            </Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>Ver detalhes</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  const editButton = canEdit ? (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            asChild
            className="rounded-xl border-primary/20 bg-primary/5 hover:bg-primary/15 hover:border-primary/40 hover:scale-105 transition-all duration-300 backdrop-blur-sm"
          >
            <Link prefetch href={ticketEditPath(ticket.id)}>
              <LucidePencil className="h-4 w-4 text-primary" />
            </Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>Editar ticket</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ) : null;

  const moreMenu = canEdit ? (
    <TicketMoreMenu
      ticket={ticket}
      trigger={
        <Button
          variant="outline"
          size="icon"
          className="rounded-xl border-primary/20 bg-primary/5 hover:bg-primary/15 hover:border-primary/40 hover:scale-105 transition-all duration-300 backdrop-blur-sm"
        >
          <LucideMoreVertical className="h-4 w-4 text-primary" />
        </Button>
      }
    />
  ) : null;

  return (
    <motion.div
      className={`w-full flex flex-col gap-y-4 mx-auto ${
        isDetail ? "max-w-4xl" : "max-w-3xl"
      }`}
      initial={isMounted ? { opacity: 0, y: 20 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Main Card */}
      <motion.div
        className="relative"
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
      >
        <Card
          className={`w-full rounded-2xl border-2 transition-all duration-500 relative overflow-hidden
                   ${isUrgent
                     ? `border-red-500/50 ${statusStyle.glowClass} ring-2 ring-red-500/20 ring-offset-2 ring-offset-background/50`
                     : `${statusStyle.borderClass} hover:${statusStyle.glowClass}`}
                   ${isDetail ? "shadow-2xl" : "shadow-xl"}

                   bg-gradient-to-br ${statusStyle.bgClass}
                   backdrop-blur-md

                   before:absolute before:inset-0 before:rounded-2xl
                   before:bg-gradient-to-br before:from-background/40 before:via-background/60 before:to-background/40
                   before:backdrop-blur-sm

                   after:absolute after:inset-0 after:rounded-2xl
                   after:bg-gradient-to-tr after:from-transparent after:via-primary/5 after:to-transparent
                   after:opacity-0 hover:after:opacity-100 after:transition-opacity after:duration-700`}
          enableMotion={false}
        >
          {/* Animated top border */}
          <div className="absolute top-0 left-0 right-0 h-0.5 overflow-hidden">
            <motion.div
              className={`h-full w-full bg-gradient-to-r ${
                isUrgent
                  ? "from-red-500 via-rose-400 to-red-500"
                  : "from-primary via-blue-400 to-primary"
              }`}
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{
                backgroundSize: "200% 100%",
              }}
            />
          </div>

          {/* Urgent pulsating ring */}
          {isUrgent && (
            <motion.div
              className="absolute -inset-2 rounded-3xl border-2 border-red-500/30"
              animate={{
                scale: [1, 1.02, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          )}

          <CardHeader className="relative z-10">
            <div className="flex items-start justify-between gap-4">
              {/* Left side - Icon and Title */}
              <div className="flex gap-4 items-start flex-1 min-w-0">
                {/* Status Icon with glow effect */}
                <motion.div
                  className={`p-3 rounded-2xl shrink-0 transition-all duration-300 relative
                             bg-gradient-to-br ${statusStyle.bgClass} ${statusStyle.borderClass} border backdrop-blur-sm
                             ${statusStyle.glowClass}`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  {TICKET_ICONS[ticket.status]}

                  {/* Icon glow effect */}
                  <div className={`absolute inset-0 rounded-2xl ${statusStyle.bgClass} blur-xl opacity-50 -z-10`} />
                </motion.div>

                {/* Title and metadata */}
                <div className="flex-1 min-w-0 space-y-3">
                  <Link href={ticketPath(ticket.id)}>
                    <CardTitle
                      className={`${
                        isDetail ? "text-2xl" : "text-xl"
                      } font-bold leading-tight
                      bg-gradient-to-r from-foreground via-foreground/90 to-foreground bg-clip-text
                      hover:from-primary hover:via-blue-400 hover:to-primary
                      transition-all duration-300 cursor-pointer truncate`}
                    >
                      {ticket.title}
                    </CardTitle>
                  </Link>

                  {/* Metadata grid */}
                  <div className="flex flex-wrap items-center gap-3">
                    {/* User */}
                    {ticket.user && (
                      <motion.div
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 backdrop-blur-sm"
                        whileHover={{ scale: 1.05 }}
                      >
                        <LucideUser className="h-3.5 w-3.5 text-primary" />
                        <span className="text-sm font-medium text-foreground/90">
                          {ticket.user.username}
                        </span>
                      </motion.div>
                    )}

                    {/* Email */}
                    {ticket.user?.email && (
                      <motion.div
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 backdrop-blur-sm"
                        whileHover={{ scale: 1.05 }}
                      >
                        <LucideMail className="h-3.5 w-3.5 text-primary" />
                        <span className="text-xs font-medium text-foreground/80 truncate max-w-[150px]">
                          {ticket.user.email}
                        </span>
                      </motion.div>
                    )}

                    {/* Category */}
                    {ticket.category && (
                      <CategoryBadge
                        name={ticket.category.name}
                        color={ticket.category.color}
                        className="h-7 text-sm shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                      />
                    )}

                    {/* Filial */}
                    {ticket.filial && (
                      <motion.div
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 backdrop-blur-sm"
                        whileHover={{ scale: 1.05 }}
                      >
                        <LucideBuilding className="h-3.5 w-3.5 text-primary" />
                        <span className="text-sm font-medium text-foreground/90">
                          {ticket.filial}
                        </span>
                      </motion.div>
                    )}

                    {/* Priority Badge */}
                    {ticket.priority && (
                      <PriorityBadge
                        priority={ticket.priority as TicketPriority}
                        size="sm"
                        animated={isUrgent}
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Right side - Status Badge */}
              <div className="shrink-0">
                {getStatusBadge()}
              </div>
            </div>

            {/* Priority progress bar (if priority exists) */}
            {priorityConfig && (
              <Box sx={{ mt: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={priorityConfig.progress}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: 'rgba(14, 165, 233, 0.1)',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 3,
                      background: isUrgent
                        ? 'linear-gradient(90deg, rgb(239, 68, 68), rgb(220, 38, 38))'
                        : 'linear-gradient(90deg, rgb(14, 165, 233), rgb(59, 130, 246))',
                    },
                  }}
                />
              </Box>
            )}
          </CardHeader>

          <CardContent className={`relative z-10 ${isDetail ? "px-6" : "px-6"}`}>
            <div
              className={`text-foreground/80 leading-relaxed
                          ${isDetail ? "text-base" : "text-sm line-clamp-3"}
                          whitespace-pre-wrap`}
            >
              {ticket.content}
            </div>
          </CardContent>

          <CardFooter
            className={`flex justify-between items-center relative z-10
                     ${isDetail ? "px-6 pb-6" : "px-6 pb-5"}
                     border-t border-primary/10 bg-background/20 backdrop-blur-sm`}
          >
            {/* Left side - metadata */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-foreground/60">
              {/* Timestamp */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div
                      className="flex items-center gap-1.5 cursor-help hover:text-foreground/90 transition-colors"
                      whileHover={{ scale: 1.05 }}
                    >
                      <LucideClock className="h-3.5 w-3.5" />
                      <span className="font-medium">
                        {format(new Date(ticket.createdAt), "dd/MM/yyyy HH:mm", {
                          locale: ptBR,
                        })}
                      </span>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="space-y-1">
                      <p className="font-medium">Criado em:</p>
                      <p className="text-xs">
                        {format(new Date(ticket.createdAt), "EEEE, dd 'de' MMMM 'de' yyyy", {
                          locale: ptBR,
                        })}
                      </p>
                      <p className="text-xs">
                        às {format(new Date(ticket.createdAt), "HH:mm:ss", {
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Counts */}
              {ticket._count && (
                <div className="flex items-center gap-3">
                  {ticket._count.attachments > 0 && (
                    <motion.div
                      className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/10 border border-primary/20"
                      whileHover={{ scale: 1.05 }}
                    >
                      <LucidePaperclip className="h-3.5 w-3.5 text-primary" />
                      <span className="font-medium">{ticket._count.attachments}</span>
                    </motion.div>
                  )}

                  {ticket._count.comments > 0 && (
                    <motion.div
                      className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/10 border border-primary/20"
                      whileHover={{ scale: 1.05 }}
                    >
                      <LucideMessageSquare className="h-3.5 w-3.5 text-primary" />
                      <span className="font-medium">{ticket._count.comments}</span>
                    </motion.div>
                  )}
                </div>
              )}
            </div>

            {/* Right side - action buttons */}
            <AnimatePresence>
              {(isHovered || isDetail) && (
                <motion.div
                  className="flex items-center gap-2"
                  initial={{ opacity: 0, scale: 0.8, x: 10 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8, x: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  {!isDetail && detailButton}
                  {editButton}
                  {moreMenu}
                </motion.div>
              )}
            </AnimatePresence>
          </CardFooter>
        </Card>
      </motion.div>

      {/* Attachments Section - Only shown in detail view */}
      {isDetail && (
        <Suspense
          fallback={
            <div className="flex items-center justify-center p-8 rounded-2xl bg-background/50 backdrop-blur-sm border border-primary/10">
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                <span className="text-sm text-muted-foreground">Carregando anexos...</span>
              </div>
            </div>
          }
        >
          <TicketDetailAttachments ticketId={ticket.id} isDetail={isDetail} />
        </Suspense>
      )}
    </motion.div>
  );
};
