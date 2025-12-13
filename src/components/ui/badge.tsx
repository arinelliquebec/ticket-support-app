"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-primary/30 bg-primary/10 text-primary hover:bg-primary/20",
        secondary:
          "border-secondary/30 bg-secondary/50 text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20",
        outline:
          "border-primary/20 text-foreground hover:border-primary/40 hover:bg-primary/5",
        success:
          "border-green-500/30 bg-green-500/10 text-green-400 hover:bg-green-500/20",
        warning:
          "border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20",
        info:
          "border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20",
        neon:
          "border-primary bg-transparent text-primary shadow-[0_0_10px_rgba(14,165,233,0.3)] hover:shadow-[0_0_15px_rgba(14,165,233,0.5)]",
        glass:
          "border-white/10 bg-white/5 backdrop-blur-lg text-foreground hover:bg-white/10",
        gradient:
          "border-0 bg-gradient-to-r from-primary to-blue-500 text-white",
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        sm: "px-2 py-0.5 text-[10px]",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  enableMotion?: boolean;
  pulse?: boolean;
}

function Badge({
  className,
  variant,
  size,
  enableMotion = false,
  pulse = false,
  ...props
}: BadgeProps) {
  if (enableMotion) {
    return (
      <motion.div
        className={cn(badgeVariants({ variant, size }), className)}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        {...(props as HTMLMotionProps<"div">)}
      />
    );
  }

  return (
    <div className={cn(
      badgeVariants({ variant, size }),
      pulse && "relative",
      className
    )} {...props}>
      {pulse && (
        <span className="absolute inset-0 rounded-lg animate-ping opacity-25 bg-current" />
      )}
      <span className="relative">{props.children}</span>
    </div>
  );
}

// Status Badge with dot indicator
interface StatusBadgeProps extends BadgeProps {
  status: "online" | "offline" | "busy" | "away";
}

function StatusBadge({ status, className, ...props }: StatusBadgeProps) {
  const statusColors = {
    online: "bg-green-500",
    offline: "bg-gray-500",
    busy: "bg-red-500",
    away: "bg-amber-500",
  };

  const statusLabels = {
    online: "Online",
    offline: "Offline",
    busy: "Ocupado",
    away: "Ausente",
  };

  return (
    <Badge variant="glass" className={cn("gap-1.5", className)} {...props}>
      <span className={cn("w-2 h-2 rounded-full", statusColors[status])} />
      {statusLabels[status]}
    </Badge>
  );
}

// Count Badge (for notifications)
interface CountBadgeProps {
  count: number;
  max?: number;
  className?: string;
}

function CountBadge({ count, max = 99, className }: CountBadgeProps) {
  const displayCount = count > max ? `${max}+` : count;

  return (
    <motion.span
      key={count}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={cn(
        "inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full",
        "bg-gradient-to-r from-primary to-blue-500 text-[10px] font-bold text-white",
        "shadow-[0_0_10px_rgba(14,165,233,0.5)]",
        className
      )}
    >
      {displayCount}
    </motion.span>
  );
}

// Priority Badge
interface PriorityBadgeProps extends Omit<BadgeProps, "variant"> {
  priority: "low" | "medium" | "high" | "urgent";
}

function PriorityBadge({ priority, className, ...props }: PriorityBadgeProps) {
  const priorityConfig = {
    low: { variant: "info" as const, label: "Baixa" },
    medium: { variant: "warning" as const, label: "Média" },
    high: { variant: "destructive" as const, label: "Alta" },
    urgent: { variant: "neon" as const, label: "Urgente" },
  };

  const config = priorityConfig[priority];

  return (
    <Badge
      variant={config.variant}
      className={cn(priority === "urgent" && "animate-pulse", className)}
      {...props}
    >
      {config.label}
    </Badge>
  );
}

export { Badge, StatusBadge, CountBadge, PriorityBadge, badgeVariants };
