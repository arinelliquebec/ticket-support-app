"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  PRIORITY_CONFIG,
  TicketPriority,
  TICKET_PRIORITIES,
  isUrgentPriority
} from "@/validations/ticket-schema";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LucideAlertTriangle,
  LucideChevronDown,
  LucideChevronUp,
  LucideMinus,
  LucideFlame,
  LucideZap,
  LucideShield,
  LucideSparkles,
  LucideCheckCircle2
} from "lucide-react";
import { useState } from "react";

// Icons for each priority level
const PRIORITY_ICONS = {
  BAIXA: LucideChevronDown,
  MEDIA: LucideMinus,
  ALTA: LucideChevronUp,
  URGENTE: LucideFlame,
};

// Color configurations
const PRIORITY_STYLES = {
  BAIXA: {
    gradient: "from-slate-600/40 via-slate-700/40 to-slate-600/40",
    border: "border-slate-500/40",
    selectedBorder: "border-slate-400/80",
    glow: "rgba(100, 116, 139, 0.4)",
    text: "text-slate-300",
    bg: "bg-slate-500",
    ring: "ring-slate-500/30",
    badge: "bg-slate-500/20 text-slate-300 border-slate-500/40 hover:bg-slate-500/30",
  },
  MEDIA: {
    gradient: "from-cyan-600/40 via-blue-600/40 to-cyan-600/40",
    border: "border-cyan-500/40",
    selectedBorder: "border-cyan-400/80",
    glow: "rgba(14, 165, 233, 0.5)",
    text: "text-cyan-300",
    bg: "bg-cyan-500",
    ring: "ring-cyan-500/30",
    badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/30",
  },
  ALTA: {
    gradient: "from-amber-600/40 via-orange-600/40 to-amber-600/40",
    border: "border-amber-500/40",
    selectedBorder: "border-amber-400/80",
    glow: "rgba(245, 158, 11, 0.5)",
    text: "text-amber-300",
    bg: "bg-amber-500",
    ring: "ring-amber-500/30",
    badge: "bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30",
  },
  URGENTE: {
    gradient: "from-red-600/50 via-rose-600/50 to-red-600/50",
    border: "border-red-500/50",
    selectedBorder: "border-red-400/90",
    glow: "rgba(239, 68, 68, 0.6)",
    text: "text-red-300",
    bg: "bg-red-500",
    ring: "ring-red-500/40",
    badge: "bg-red-500/20 text-red-300 border-red-500/50 hover:bg-red-500/30",
  },
};

interface PriorityBadgeProps {
  priority: TicketPriority;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  animated?: boolean;
  showTooltip?: boolean;
}

export function PriorityBadge({
  priority,
  showIcon = true,
  size = "md",
  className,
  animated = true,
  showTooltip = true,
}: PriorityBadgeProps) {
  const config = PRIORITY_CONFIG[priority];
  const styles = PRIORITY_STYLES[priority];
  const isUrgent = isUrgentPriority(priority);
  const Icon = PRIORITY_ICONS[priority];

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5 gap-1",
    md: "text-sm px-2.5 py-1 gap-1.5",
    lg: "text-base px-3 py-1.5 gap-2",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-3.5 w-3.5",
    lg: "h-4 w-4",
  };

  const BadgeComponent = (
    <motion.div
      initial={animated ? { scale: 0.8, opacity: 0 } : false}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <Badge
        variant="outline"
        className={cn(
          "font-semibold tracking-wide transition-all duration-300 relative overflow-hidden",
          sizeClasses[size],
          styles.badge,
          isUrgent && animated && "animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.4)]",
          className
        )}
      >
        {/* Shimmer effect for urgent */}
        {isUrgent && animated && (
          <motion.span
            className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/20 to-transparent"
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
        )}

        <span className="relative z-10 flex items-center gap-1.5">
          {showIcon && (
            <Icon className={cn(iconSizes[size], isUrgent && "animate-bounce")} />
          )}
          <span>{config.label}</span>
        </span>
      </Badge>
    </motion.div>
  );

  if (showTooltip) {
    return (
      <TooltipProvider>
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            {BadgeComponent}
          </TooltipTrigger>
          <TooltipContent
            side="top"
            className={cn(
              "px-3 py-2 text-xs",
              isUrgent && "border-red-500/50 bg-red-950/90"
            )}
          >
            <div className="flex items-center gap-2">
              <Icon className={cn("h-4 w-4", styles.text)} />
              <div>
                <p className="font-semibold">{config.label}</p>
                <p className="text-muted-foreground">{config.description}</p>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return BadgeComponent;
}

interface PrioritySelectProps {
  value: TicketPriority;
  onChange: (priority: TicketPriority) => void;
  disabled?: boolean;
  className?: string;
  required?: boolean;
  error?: boolean;
  label?: string;
  variant?: "cards" | "dropdown" | "buttons";
}

export function PrioritySelect({
  value,
  onChange,
  disabled = false,
  className,
  required = false,
  error = false,
  label = "Prioridade do Ticket",
  variant = "cards",
}: PrioritySelectProps) {
  const [hoveredPriority, setHoveredPriority] = useState<TicketPriority | null>(null);

  // Dropdown variant using shadcn Select
  if (variant === "dropdown") {
    return (
      <div className={cn("space-y-2", className)}>
        {label && (
          <Label className="flex items-center text-sm font-semibold">
            <LucideZap className="h-4 w-4 mr-1.5 text-primary" />
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
        )}

        <Select value={value} onValueChange={(v) => onChange(v as TicketPriority)} disabled={disabled}>
          <SelectTrigger
            className={cn(
              "w-full h-12 rounded-xl border-2 transition-all",
              PRIORITY_STYLES[value].border,
              error && "border-red-500/50"
            )}
          >
            <SelectValue>
              <div className="flex items-center gap-2">
                {(() => {
                  const Icon = PRIORITY_ICONS[value];
                  return <Icon className={cn("h-4 w-4", PRIORITY_STYLES[value].text)} />;
                })()}
                <span className={PRIORITY_STYLES[value].text}>{PRIORITY_CONFIG[value].label}</span>
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="rounded-xl border-2 border-primary/20">
            {TICKET_PRIORITIES.map((priority) => {
              const Icon = PRIORITY_ICONS[priority];
              const styles = PRIORITY_STYLES[priority];
              const config = PRIORITY_CONFIG[priority];
              const isUrgent = priority === "URGENTE";

              return (
                <SelectItem
                  key={priority}
                  value={priority}
                  className={cn(
                    "rounded-lg my-1 cursor-pointer transition-all",
                    "focus:bg-primary/10 data-[highlighted]:bg-primary/10",
                    isUrgent && "data-[highlighted]:bg-red-500/10"
                  )}
                >
                  <div className="flex items-center gap-3 py-1">
                    <div className={cn(
                      "p-1.5 rounded-lg",
                      `bg-gradient-to-br ${styles.gradient}`
                    )}>
                      <Icon className={cn("h-4 w-4", styles.text)} />
                    </div>
                    <div>
                      <p className={cn("font-semibold", styles.text)}>{config.label}</p>
                      <p className="text-xs text-muted-foreground">{config.description}</p>
                    </div>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
    );
  }

  // Buttons variant (inline)
  if (variant === "buttons") {
    return (
      <div className={cn("space-y-2", className)}>
        {label && (
          <Label className="flex items-center text-sm font-semibold">
            <LucideZap className="h-4 w-4 mr-1.5 text-primary" />
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
        )}

        <div className="flex flex-wrap gap-2">
          {TICKET_PRIORITIES.map((priority) => {
            const Icon = PRIORITY_ICONS[priority];
            const styles = PRIORITY_STYLES[priority];
            const config = PRIORITY_CONFIG[priority];
            const isSelected = value === priority;
            const isUrgent = priority === "URGENTE";

            return (
              <TooltipProvider key={priority}>
                <Tooltip delayDuration={200}>
                  <TooltipTrigger asChild>
                    <motion.button
                      type="button"
                      disabled={disabled}
                      onClick={() => onChange(priority)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 font-semibold transition-all",
                        "backdrop-blur-sm",
                        isSelected
                          ? cn(styles.selectedBorder, `bg-gradient-to-r ${styles.gradient}`, styles.text)
                          : cn(styles.border, "text-muted-foreground hover:text-foreground"),
                        isUrgent && isSelected && "shadow-[0_0_20px_rgba(239,68,68,0.3)] ring-2 ring-red-500/30",
                        disabled && "opacity-50 cursor-not-allowed",
                        error && !isSelected && "border-red-500/30"
                      )}
                      whileHover={{ scale: disabled ? 1 : 1.02 }}
                      whileTap={{ scale: disabled ? 1 : 0.98 }}
                    >
                      <Icon className={cn("h-4 w-4", isUrgent && isSelected && "animate-pulse")} />
                      {config.label}
                      {isSelected && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="ml-1"
                        >
                          <LucideCheckCircle2 className="h-4 w-4" />
                        </motion.span>
                      )}
                    </motion.button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">
                    {config.description}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>
      </div>
    );
  }

  // Cards variant (default) - Full featured
  return (
    <motion.div
      className={cn("space-y-4", className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {label && (
        <div className="flex items-center justify-between">
          <Label className="flex items-center text-sm font-semibold tracking-wide">
            <motion.div
              className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-blue-500/20 border border-primary/20 mr-2"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <LucideSparkles className="h-4 w-4 text-primary" />
            </motion.div>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>

          {/* Current selection indicator */}
          <PriorityBadge priority={value} size="sm" showTooltip={false} />
        </div>
      )}

      {/* Priority Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {TICKET_PRIORITIES.map((priority, index) => {
          const config = PRIORITY_CONFIG[priority];
          const styles = PRIORITY_STYLES[priority];
          const isSelected = value === priority;
          const isUrgent = priority === "URGENTE";
          const isHovered = hoveredPriority === priority;
          const Icon = PRIORITY_ICONS[priority];

          return (
            <TooltipProvider key={priority}>
              <Tooltip delayDuration={400}>
                <TooltipTrigger asChild>
                  <motion.button
                    type="button"
                    disabled={disabled}
                    onClick={() => onChange(priority)}
                    onMouseEnter={() => setHoveredPriority(priority)}
                    onMouseLeave={() => setHoveredPriority(null)}
                    className={cn(
                      "relative flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all duration-300",
                      "backdrop-blur-md overflow-hidden group",
                      "bg-gradient-to-br",
                      styles.gradient,
                      isSelected ? styles.selectedBorder : styles.border,
                      isSelected && `ring-2 ring-offset-2 ring-offset-background ${styles.ring}`,
                      disabled && "opacity-50 cursor-not-allowed",
                      error && !isSelected && "border-red-500/30"
                    )}
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      boxShadow: isSelected
                        ? `0 0 30px ${styles.glow}, 0 10px 40px rgba(0,0,0,0.3)`
                        : "0 4px 20px rgba(0,0,0,0.2)"
                    }}
                    whileHover={{
                      scale: disabled ? 1 : 1.03,
                      boxShadow: `0 0 40px ${styles.glow}, 0 15px 50px rgba(0,0,0,0.3)`,
                    }}
                    whileTap={{ scale: disabled ? 1 : 0.97 }}
                    transition={{
                      delay: index * 0.05,
                      type: "spring",
                      stiffness: 300,
                      damping: 25
                    }}
                  >
                    {/* Animated background glow */}
                    <motion.div
                      className="absolute inset-0 opacity-30"
                      style={{
                        backgroundImage: `radial-gradient(circle at 50% 50%, ${styles.glow} 0%, transparent 60%)`,
                      }}
                      animate={isSelected || isHovered ? {
                        scale: [1, 1.3, 1],
                        opacity: [0.3, 0.5, 0.3],
                      } : {}}
                      transition={{ duration: 2, repeat: Infinity }}
                    />

                    {/* Cyber grid pattern */}
                    <div className="absolute inset-0 opacity-10 cyber-grid-dots" />

                    {/* Scanning line for urgent */}
                    {isUrgent && isSelected && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-b from-transparent via-red-500/30 to-transparent"
                        animate={{ y: ["-100%", "100%"] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                      />
                    )}

                    {/* Selection indicator */}
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          className={cn(
                            "absolute -top-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center",
                            styles.bg,
                            "shadow-lg border-2 border-background"
                          )}
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0, rotate: 180 }}
                          transition={{ type: "spring", stiffness: 500, damping: 25 }}
                        >
                          <LucideCheckCircle2 className="w-4 h-4 text-white" />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Icon with glow */}
                    <motion.div
                      className={cn(
                        "relative p-3.5 rounded-xl mb-3",
                        "bg-gradient-to-br from-white/15 to-white/5",
                        "border border-white/20"
                      )}
                      animate={isSelected ? {
                        boxShadow: [
                          `0 0 20px ${styles.glow}`,
                          `0 0 35px ${styles.glow}`,
                          `0 0 20px ${styles.glow}`,
                        ],
                      } : {}}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Icon
                        className={cn(
                          "h-7 w-7 transition-all duration-300",
                          isSelected || isHovered ? styles.text : "text-muted-foreground",
                          isUrgent && isSelected && "animate-pulse"
                        )}
                      />

                      {/* Pulse rings for urgent */}
                      {isUrgent && isSelected && (
                        <>
                          <motion.span
                            className="absolute inset-0 rounded-xl border-2 border-red-500"
                            animate={{ scale: [1, 1.5], opacity: [0.8, 0] }}
                            transition={{ duration: 1.2, repeat: Infinity }}
                          />
                          <motion.span
                            className="absolute inset-0 rounded-xl border-2 border-red-500"
                            animate={{ scale: [1, 1.7], opacity: [0.5, 0] }}
                            transition={{ duration: 1.2, repeat: Infinity, delay: 0.3 }}
                          />
                        </>
                      )}
                    </motion.div>

                    {/* Label */}
                    <motion.span
                      className={cn(
                        "text-sm font-bold tracking-wider uppercase",
                        isSelected || isHovered ? styles.text : "text-muted-foreground",
                        "transition-colors duration-300"
                      )}
                    >
                      {config.label}
                    </motion.span>

                    {/* Bottom accent line */}
                    <motion.div
                      className={cn("absolute bottom-0 left-0 right-0 h-1 rounded-b-xl", styles.bg)}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: isSelected ? 1 : 0 }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.button>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  className={cn(
                    "max-w-[200px] text-center",
                    isUrgent && "border-red-500/50"
                  )}
                >
                  <p className="text-xs">{config.description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>

      {/* Progress bar indicator */}
      <motion.div
        className="relative h-2.5 rounded-full bg-muted/30 overflow-hidden border border-muted/20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <motion.div
          className={cn(
            "absolute inset-y-0 left-0 rounded-full",
            value === "BAIXA" && "bg-gradient-to-r from-slate-600 to-slate-400",
            value === "MEDIA" && "bg-gradient-to-r from-cyan-600 to-cyan-400",
            value === "ALTA" && "bg-gradient-to-r from-amber-600 to-amber-400",
            value === "URGENTE" && "bg-gradient-to-r from-red-600 to-rose-400"
          )}
          initial={{ width: "0%" }}
          animate={{
            width: value === "BAIXA" ? "25%"
                 : value === "MEDIA" ? "50%"
                 : value === "ALTA" ? "75%"
                 : "100%"
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />

        {/* Shimmer */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />

        {/* Level markers */}
        <div className="absolute inset-0 flex justify-between px-0.5">
          {[25, 50, 75].map((pos) => (
            <div
              key={pos}
              className="w-px h-full bg-background/50"
              style={{ marginLeft: `${pos - 1}%` }}
            />
          ))}
        </div>
      </motion.div>

      {/* Description panel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={value}
          initial={{ opacity: 0, y: 10, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -10, height: 0 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "flex items-center gap-3 p-4 rounded-xl",
            "bg-gradient-to-r from-muted/30 via-muted/20 to-muted/30",
            "border border-muted/30",
            "backdrop-blur-sm",
            value === "URGENTE" && "from-red-500/15 via-red-500/10 to-red-500/15 border-red-500/30"
          )}
        >
          <div className={cn(
            "p-2 rounded-lg",
            `bg-gradient-to-br ${PRIORITY_STYLES[value].gradient}`,
            "border border-white/10"
          )}>
            <LucideShield className={cn("h-5 w-5", PRIORITY_STYLES[value].text)} />
          </div>
          <div>
            <p className={cn(
              "text-sm font-semibold",
              PRIORITY_STYLES[value].text
            )}>
              {PRIORITY_CONFIG[value].label}
            </p>
            <p className="text-xs text-muted-foreground">
              {PRIORITY_CONFIG[value].description}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

// Compact inline select
export function PrioritySelectInline({
  value,
  onChange,
  disabled = false,
  className,
}: {
  value: TicketPriority;
  onChange: (priority: TicketPriority) => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <PrioritySelect
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={className}
      variant="buttons"
      label=""
    />
  );
}

// Dropdown variant export
export function PriorityDropdown({
  value,
  onChange,
  disabled = false,
  className,
  label,
}: {
  value: TicketPriority;
  onChange: (priority: TicketPriority) => void;
  disabled?: boolean;
  className?: string;
  label?: string;
}) {
  return (
    <PrioritySelect
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={className}
      variant="dropdown"
      label={label}
    />
  );
}
