"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  variant?: "default" | "gradient" | "neon" | "striped";
  showValue?: boolean;
  animated?: boolean;
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, variant = "default", showValue = false, animated = true, ...props }, ref) => {
  const variantStyles = {
    default: "bg-primary",
    gradient: "bg-gradient-to-r from-primary via-blue-500 to-primary bg-[length:200%_auto]",
    neon: "bg-primary shadow-[0_0_10px_rgba(14,165,233,0.5),0_0_20px_rgba(14,165,233,0.3)]",
    striped: "bg-gradient-to-r from-primary via-blue-400 to-primary bg-[length:30px_30px]",
  };

  return (
    <div className="relative w-full">
      <ProgressPrimitive.Root
        ref={ref}
        className={cn(
          "relative h-3 w-full overflow-hidden rounded-full bg-primary/10 border border-primary/20",
          className
        )}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className={cn(
            "h-full flex-1 transition-all duration-500 ease-out rounded-full",
            variantStyles[variant],
            variant === "striped" && "animate-[progress-stripes_1s_linear_infinite]"
          )}
          style={{
            transform: `translateX(-${100 - (value || 0)}%)`,
          }}
        />

        {/* Glow effect for neon variant */}
        {variant === "neon" && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: `linear-gradient(90deg, transparent, rgba(14, 165, 233, 0.3), transparent)`,
              width: `${value}%`,
            }}
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}
      </ProgressPrimitive.Root>

      {showValue && (
        <motion.span
          className="absolute -right-1 -top-6 text-xs font-medium text-primary"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          key={value}
        >
          {value}%
        </motion.span>
      )}
    </div>
  );
});
Progress.displayName = ProgressPrimitive.Root.displayName;

// Circular Progress
interface CircularProgressProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  showValue?: boolean;
  variant?: "default" | "gradient";
}

function CircularProgress({
  value,
  size = 64,
  strokeWidth = 4,
  className,
  showValue = true,
  variant = "gradient",
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-primary/10"
        />

        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={variant === "gradient" ? "url(#progressGradient)" : "currentColor"}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={variant === "default" ? "text-primary" : ""}
          style={{
            filter: "drop-shadow(0 0 6px rgba(14, 165, 233, 0.4))",
          }}
        />

        {variant === "gradient" && (
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(195, 85%, 50%)" />
              <stop offset="100%" stopColor="hsl(217, 91%, 60%)" />
            </linearGradient>
          </defs>
        )}
      </svg>

      {showValue && (
        <motion.span
          className="absolute text-sm font-bold text-primary"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {Math.round(value)}%
        </motion.span>
      )}
    </div>
  );
}

// Stats Progress (for dashboard cards)
interface StatsProgressProps {
  label: string;
  value: number;
  total: number;
  color?: string;
  className?: string;
}

function StatsProgress({ label, value, total, color, className }: StatsProgressProps) {
  const percentage = total > 0 ? (value / total) * 100 : 0;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-sm font-medium">
          {value} / {total}
        </span>
      </div>
      <div className="h-2 rounded-full bg-primary/10 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: color || "linear-gradient(90deg, hsl(195, 85%, 50%), hsl(217, 91%, 60%))",
          }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

// Step Progress
interface StepProgressProps {
  steps: string[];
  currentStep: number;
  className?: string;
}

function StepProgress({ steps, currentStep, className }: StepProgressProps) {
  return (
    <div className={cn("flex items-center w-full", className)}>
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const isLast = index === steps.length - 1;

        return (
          <React.Fragment key={index}>
            <div className="flex flex-col items-center">
              <motion.div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm border-2 transition-colors",
                  isCompleted && "bg-primary border-primary text-primary-foreground",
                  isCurrent && "border-primary text-primary bg-primary/10",
                  !isCompleted && !isCurrent && "border-muted text-muted-foreground"
                )}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                {isCompleted ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  index + 1
                )}
              </motion.div>
              <span className={cn(
                "mt-2 text-xs text-center max-w-[80px]",
                isCurrent ? "text-primary font-medium" : "text-muted-foreground"
              )}>
                {step}
              </span>
            </div>

            {!isLast && (
              <div className="flex-1 h-0.5 mx-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: isCompleted ? "100%" : "0%" }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export { Progress, CircularProgress, StatsProgress, StepProgress };
