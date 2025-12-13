"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "circular" | "rounded" | "text";
  animation?: "pulse" | "shimmer" | "wave";
}

function Skeleton({
  className,
  variant = "default",
  animation = "shimmer",
  ...props
}: SkeletonProps) {
  const variantStyles = {
    default: "rounded-lg",
    circular: "rounded-full",
    rounded: "rounded-2xl",
    text: "rounded h-4",
  };

  const animationStyles = {
    pulse: "animate-pulse bg-primary/10",
    shimmer: "skeleton-shimmer",
    wave: "skeleton-wave",
  };

  return (
    <div
      className={cn(
        "bg-gradient-to-r from-muted/30 via-primary/5 to-muted/30",
        variantStyles[variant],
        animationStyles[animation],
        className
      )}
      {...props}
    />
  );
}

// Animated Skeleton with Framer Motion
interface AnimatedSkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  variant?: "default" | "circular" | "rounded";
}

function AnimatedSkeleton({
  className,
  width,
  height,
  variant = "default"
}: AnimatedSkeletonProps) {
  const variantStyles = {
    default: "rounded-lg",
    circular: "rounded-full",
    rounded: "rounded-2xl",
  };

  return (
    <motion.div
      className={cn(
        "relative overflow-hidden",
        variantStyles[variant],
        className
      )}
      style={{ width, height }}
    >
      {/* Base layer */}
      <div className="absolute inset-0 bg-muted/20" />

      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(14, 165, 233, 0.1) 50%, transparent 100%)",
        }}
        animate={{
          x: ["-100%", "100%"],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 bg-primary/5"
        animate={{
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </motion.div>
  );
}

// Card Skeleton
function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-primary/10 bg-card/40 backdrop-blur-sm p-6 space-y-4">
      <div className="flex items-center gap-4">
        <AnimatedSkeleton width={48} height={48} variant="rounded" />
        <div className="space-y-2 flex-1">
          <AnimatedSkeleton height={20} className="w-3/4" />
          <AnimatedSkeleton height={14} className="w-1/2" />
        </div>
      </div>
      <AnimatedSkeleton height={80} variant="rounded" />
      <div className="flex gap-2">
        <AnimatedSkeleton height={36} className="w-24" variant="rounded" />
        <AnimatedSkeleton height={36} className="w-24" variant="rounded" />
      </div>
    </div>
  );
}

// List Skeleton
function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="flex items-center gap-4 p-4 rounded-xl border border-primary/10 bg-card/30"
        >
          <AnimatedSkeleton width={40} height={40} variant="circular" />
          <div className="space-y-2 flex-1">
            <AnimatedSkeleton height={16} className="w-1/3" />
            <AnimatedSkeleton height={12} className="w-2/3" />
          </div>
          <AnimatedSkeleton width={80} height={32} variant="rounded" />
        </motion.div>
      ))}
    </div>
  );
}

// Table Skeleton
function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="rounded-xl border border-primary/10 overflow-hidden">
      {/* Header */}
      <div className="flex gap-4 p-4 bg-primary/5 border-b border-primary/10">
        {Array.from({ length: cols }).map((_, i) => (
          <AnimatedSkeleton key={i} height={20} className="flex-1" />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <motion.div
          key={rowIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: rowIndex * 0.05 }}
          className="flex gap-4 p-4 border-b border-primary/5 last:border-0"
        >
          {Array.from({ length: cols }).map((_, colIndex) => (
            <AnimatedSkeleton key={colIndex} height={16} className="flex-1" />
          ))}
        </motion.div>
      ))}
    </div>
  );
}

// Stats Card Skeleton
function StatsCardSkeleton() {
  return (
    <div className="rounded-2xl border border-primary/10 bg-card/40 backdrop-blur-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <AnimatedSkeleton width={100} height={14} />
        <AnimatedSkeleton width={40} height={40} variant="rounded" />
      </div>
      <AnimatedSkeleton width={80} height={36} className="mb-2" />
      <AnimatedSkeleton width={120} height={12} />
    </div>
  );
}

// Form Skeleton
function FormSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="space-y-2"
        >
          <AnimatedSkeleton height={16} className="w-24" />
          <AnimatedSkeleton height={44} variant="rounded" />
        </motion.div>
      ))}
      <div className="flex gap-3 pt-4">
        <AnimatedSkeleton height={44} className="w-32" variant="rounded" />
        <AnimatedSkeleton height={44} className="w-24" variant="rounded" />
      </div>
    </div>
  );
}

// Profile Skeleton
function ProfileSkeleton() {
  return (
    <div className="flex items-center gap-4">
      <AnimatedSkeleton width={64} height={64} variant="circular" />
      <div className="space-y-2">
        <AnimatedSkeleton width={150} height={20} />
        <AnimatedSkeleton width={200} height={14} />
      </div>
    </div>
  );
}

// Dashboard Skeleton
function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <AnimatedSkeleton width={200} height={32} />
          <AnimatedSkeleton width={300} height={16} />
        </div>
        <AnimatedSkeleton width={120} height={40} variant="rounded" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <StatsCardSkeleton />
          </motion.div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}

// Page Loading Skeleton
function PageLoadingSkeleton() {
  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-[400px] gap-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-blue-500/20 border border-primary/20 flex items-center justify-center"
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <motion.div
          className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </motion.div>
      <motion.p
        className="text-muted-foreground text-sm"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        Carregando...
      </motion.p>
    </motion.div>
  );
}

export {
  Skeleton,
  AnimatedSkeleton,
  CardSkeleton,
  ListSkeleton,
  TableSkeleton,
  StatsCardSkeleton,
  FormSkeleton,
  ProfileSkeleton,
  DashboardSkeleton,
  PageLoadingSkeleton,
};
