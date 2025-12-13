"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  label?: string;
}

export function Spinner({ size = "md", className, label }: SpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  return (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      <div className={cn("relative", sizeClasses[size])}>
        {/* Outer ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-primary/20"
          animate={{ rotate: 360 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* Inner spinning gradient */}
        <motion.svg
          viewBox="0 0 24 24"
          className="absolute inset-0 w-full h-full"
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <defs>
            <linearGradient id="spinnerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(195, 85%, 50%)" />
              <stop offset="100%" stopColor="hsl(217, 91%, 60%)" />
            </linearGradient>
          </defs>
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="url(#spinnerGradient)"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            strokeDasharray="50 50"
          />
        </motion.svg>

        {/* Center glow */}
        <motion.div
          className="absolute inset-2 rounded-full bg-primary/10"
          animate={{
            scale: [0.8, 1, 0.8],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {label && (
        <motion.span
          className="text-sm text-muted-foreground"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {label}
        </motion.span>
      )}
    </div>
  );
}

// Dots Spinner
export function DotsSpinner({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full bg-primary"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// Pulse Spinner
export function PulseSpinner({ size = "md", className }: SpinnerProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-14 h-14",
    xl: "w-20 h-20",
  };

  return (
    <div className={cn("relative", sizeClasses[size], className)}>
      {/* Pulsing rings */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute inset-0 rounded-full border border-primary"
          initial={{ scale: 1, opacity: 0.6 }}
          animate={{
            scale: [1, 1.5 + i * 0.3],
            opacity: [0.6, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.3,
            ease: "easeOut",
          }}
        />
      ))}

      {/* Center dot */}
      <motion.div
        className="absolute inset-1/4 rounded-full bg-gradient-to-br from-primary to-blue-500"
        animate={{
          scale: [0.9, 1.1, 0.9],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}

// Bar Spinner
export function BarSpinner({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-end gap-1 h-8", className)}>
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          className="w-1.5 bg-gradient-to-t from-primary to-blue-500 rounded-full"
          animate={{
            height: ["8px", "32px", "8px"],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.1,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// Full Page Loading
interface PageLoaderProps {
  message?: string;
}

export function PageLoader({ message = "Carregando..." }: PageLoaderProps) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="flex flex-col items-center gap-6 p-8 rounded-2xl bg-card/50 border border-primary/20 backdrop-blur-xl"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 20 }}
      >
        {/* Logo-style loader */}
        <div className="relative w-20 h-20">
          <motion.div
            className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 to-blue-500/20 border border-primary/30"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute inset-3 rounded-xl border-2 border-primary/50"
            animate={{ rotate: 360 }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
          />
          <motion.div
            className="absolute inset-6 rounded-lg bg-primary/30"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>

        {/* Message */}
        <div className="flex items-center gap-2">
          <motion.span
            className="text-foreground font-medium"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {message}
          </motion.span>
          <DotsSpinner />
        </div>
      </motion.div>
    </motion.div>
  );
}

// Button Loading State
export function ButtonLoader({ className }: { className?: string }) {
  return (
    <motion.div
      className={cn("w-4 h-4", className)}
      animate={{ rotate: 360 }}
      transition={{
        duration: 0.8,
        repeat: Infinity,
        ease: "linear",
      }}
    >
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="2"
          strokeOpacity="0.25"
        />
        <path
          d="M12 2C6.47715 2 2 6.47715 2 12"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </motion.div>
  );
}
