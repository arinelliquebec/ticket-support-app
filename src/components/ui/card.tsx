"use client";

import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

// Motion variants for card animations
const cardMotionVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1],
    }
  },
  hover: {
    y: -4,
    scale: 1.01,
    transition: {
      duration: 0.2,
      ease: "easeOut",
    }
  },
};

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  enableMotion?: boolean;
  variant?: "default" | "glass" | "neon" | "holographic";
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, enableMotion = true, variant = "default", ...props }, ref) => {
    const variantStyles = {
      default: "bg-card/60 border-primary/10 hover:border-primary/20 shadow-lg shadow-black/10",
      glass: "glass-ultra hover:border-primary/30",
      neon: "bg-card/40 border-primary/30 hover:border-primary/50 neon-border shadow-[0_0_15px_rgba(14,165,233,0.1)] hover:shadow-[0_0_25px_rgba(14,165,233,0.2)]",
      holographic: "bg-card/50 holographic border-primary/20 hover:border-primary/40",
    };

    const baseStyles = cn(
      "rounded-2xl border text-card-foreground backdrop-blur-md relative overflow-hidden transition-all duration-300",
      variantStyles[variant],
      className
    );

    if (enableMotion) {
      return (
        <motion.div
          ref={ref}
          className={baseStyles}
          variants={cardMotionVariants}
          initial="initial"
          animate="animate"
          whileHover="hover"
          {...(props as HTMLMotionProps<"div">)}
        >
          {/* Shimmer effect on hover */}
          <motion.div
            className="absolute inset-0 opacity-0 pointer-events-none"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(14, 165, 233, 0.05), transparent)",
            }}
            whileHover={{
              opacity: 1,
              x: ["0%", "100%"],
            }}
            transition={{ duration: 0.6 }}
          />
          {props.children}
        </motion.div>
      );
    }

    return (
      <div
        ref={ref}
        className={baseStyles}
        {...props}
      />
    );
  }
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col space-y-1.5 p-6 border-b border-primary/10 relative",
      "after:absolute after:left-0 after:right-0 after:bottom-0 after:h-px",
      "after:bg-gradient-to-r after:from-transparent after:via-primary/30 after:to-transparent",
      className
    )}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      "bg-gradient-to-r from-primary via-blue-400 to-primary bg-clip-text text-transparent bg-[length:200%_auto]",
      "font-[family-name:var(--font-display)]",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground mt-1", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center p-6 pt-0 border-t border-primary/10 mt-auto relative",
      "after:absolute after:left-0 after:right-0 after:top-0 after:h-px",
      "after:bg-gradient-to-r after:from-transparent after:via-primary/30 after:to-transparent",
      className
    )}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

// Specialized Cards
interface GlassCardProps extends CardProps {
  glowIntensity?: "low" | "medium" | "high";
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, glowIntensity = "medium", ...props }, ref) => {
    const glowStyles = {
      low: "shadow-[0_8px_30px_rgba(0,0,0,0.2)]",
      medium: "shadow-[0_8px_30px_rgba(0,0,0,0.3),0_0_20px_rgba(14,165,233,0.1)]",
      high: "shadow-[0_8px_30px_rgba(0,0,0,0.4),0_0_40px_rgba(14,165,233,0.15)]",
    };

    return (
      <Card
        ref={ref}
        variant="glass"
        className={cn(glowStyles[glowIntensity], className)}
        {...props}
      />
    );
  }
);
GlassCard.displayName = "GlassCard";

// Stats Card with animation
interface StatsCardProps extends CardProps {
  delay?: number;
}

const StatsCard = React.forwardRef<HTMLDivElement, StatsCardProps>(
  ({ className, delay = 0, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: 0.5,
          delay,
          ease: [0.4, 0, 0.2, 1],
        }}
        whileHover={{
          y: -6,
          scale: 1.02,
          transition: { duration: 0.2 },
        }}
        className={cn(
          "rounded-2xl border border-primary/15 bg-card/60 backdrop-blur-md p-6",
          "shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-primary/5",
          "hover:border-primary/25 transition-colors duration-300",
          className
        )}
        {...(props as HTMLMotionProps<"div">)}
      />
    );
  }
);
StatsCard.displayName = "StatsCard";

export {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  GlassCard,
  StatsCard,
};
