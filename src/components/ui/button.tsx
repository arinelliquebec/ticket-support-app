"use client";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 relative overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-primary to-blue-500 text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-700",
        destructive:
          "bg-gradient-to-r from-destructive to-red-600 text-destructive-foreground shadow-lg shadow-destructive/25 hover:shadow-xl hover:shadow-destructive/30",
        outline:
          "border border-primary/30 bg-transparent hover:bg-primary/10 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 backdrop-blur-sm",
        secondary:
          "bg-secondary/80 text-secondary-foreground hover:bg-secondary backdrop-blur-sm border border-primary/10 hover:border-primary/20",
        ghost:
          "hover:bg-primary/10 hover:text-primary",
        link:
          "text-primary underline-offset-4 hover:underline",
        futuristic:
          "bg-gradient-to-r from-primary via-blue-500 to-primary bg-[length:200%_auto] text-white shadow-[0_0_20px_rgba(14,165,233,0.4)] hover:shadow-[0_0_30px_rgba(14,165,233,0.6),0_0_60px_rgba(14,165,233,0.2)] hover:bg-right animate-gradient-shift border border-primary/30",
        neon:
          "bg-transparent border-2 border-primary text-primary shadow-[0_0_10px_rgba(14,165,233,0.3),inset_0_0_10px_rgba(14,165,233,0.1)] hover:shadow-[0_0_20px_rgba(14,165,233,0.5),0_0_40px_rgba(14,165,233,0.2),inset_0_0_20px_rgba(14,165,233,0.2)] hover:bg-primary/10",
        glass:
          "bg-white/5 backdrop-blur-xl border border-white/10 text-foreground hover:bg-white/10 hover:border-primary/30 shadow-lg",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 rounded-lg px-3.5 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        xl: "h-14 rounded-2xl px-10 text-lg",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

// Motion variants for button animations
const buttonMotionVariants = {
  initial: { scale: 1 },
  hover: {
    scale: 1.02,
    transition: { duration: 0.2, ease: "easeOut" }
  },
  tap: {
    scale: 0.98,
    transition: { duration: 0.1 }
  },
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  enableMotion?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, enableMotion = true, ...props }, ref) => {
    if (asChild) {
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        />
      );
    }

    if (enableMotion) {
      return (
        <motion.button
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          variants={buttonMotionVariants}
          initial="initial"
          whileHover="hover"
          whileTap="tap"
          {...(props as HTMLMotionProps<"button">)}
        />
      );
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

// Specialized Futuristic Button with Glow Effect
interface GlowButtonProps extends ButtonProps {
  glowColor?: string;
}

const GlowButton = React.forwardRef<HTMLButtonElement, GlowButtonProps>(
  ({ className, glowColor = "rgba(14, 165, 233, 0.5)", children, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        className={cn(
          buttonVariants({ variant: "futuristic", className }),
          "group"
        )}
        whileHover={{
          scale: 1.02,
          boxShadow: `0 0 30px ${glowColor}, 0 0 60px ${glowColor}`,
        }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
        {...(props as HTMLMotionProps<"button">)}
      >
        {/* Glow effect layer */}
        <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/0 via-primary/30 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />

        {/* Content */}
        <span className="relative z-10 flex items-center gap-2">
          {children}
        </span>

        {/* Shimmer effect */}
        <motion.span
          className="absolute inset-0 rounded-xl"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
          }}
          initial={{ x: "-100%" }}
          whileHover={{ x: "100%" }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        />
      </motion.button>
    );
  }
);
GlowButton.displayName = "GlowButton";

// Pulse Button for important actions
const PulseButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        className={cn(
          buttonVariants({ variant: "default", className }),
          "relative"
        )}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        {...(props as HTMLMotionProps<"button">)}
      >
        {/* Pulse rings */}
        <motion.span
          className="absolute inset-0 rounded-xl border-2 border-primary"
          animate={{
            scale: [1, 1.2, 1.2],
            opacity: [0.5, 0, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
        <motion.span
          className="absolute inset-0 rounded-xl border-2 border-primary"
          animate={{
            scale: [1, 1.4, 1.4],
            opacity: [0.3, 0, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeOut",
            delay: 0.5,
          }}
        />

        <span className="relative z-10">{children}</span>
      </motion.button>
    );
  }
);
PulseButton.displayName = "PulseButton";

export { Button, GlowButton, PulseButton, buttonVariants };
