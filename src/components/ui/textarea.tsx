import * as React from "react";
import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input/50 bg-background/50 backdrop-blur-sm px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground/70 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:border-primary/30 focus-visible:bg-background/80 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-all duration-300 hover:border-primary/20 hover:bg-background/60 scrollbar-modern",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
