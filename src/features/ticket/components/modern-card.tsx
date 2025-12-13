// src/components/modern-card.tsx
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { HTMLAttributes, forwardRef } from "react";

interface ModernCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "hover" | "glow" | "gradient";
  intensity?: "low" | "medium" | "high";
}

const ModernCard = forwardRef<HTMLDivElement, ModernCardProps>(
  ({ className, variant = "default", intensity = "medium", ...props }, ref) => {
    const getEffectClasses = () => {
      const baseClasses = "transition-all duration-300 border-muted/30";

      switch (variant) {
        case "hover":
          return `${baseClasses} hover:shadow-lg hover:-translate-y-1 hover:border-primary/20`;
        case "glow":
          return `${baseClasses} ${
            intensity === "high"
              ? "shadow-glow-intense"
              : intensity === "low"
              ? "hover:shadow-glow"
              : "shadow-glow"
          }`;
        case "gradient":
          return `${baseClasses} card-gradient futuristic-border`;
        default:
          return baseClasses;
      }
    };

    return (
      <Card
        ref={ref}
        className={cn(getEffectClasses(), className)}
        {...props}
      />
    );
  }
);

ModernCard.displayName = "ModernCard";

export { ModernCard };
