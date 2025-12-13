"use client";

import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  enableMotion?: boolean;
  variant?: "default" | "glass" | "neon";
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, enableMotion = false, variant = "default", ...props }, ref) => {
    const variantStyles = {
      default: "border-input/50 bg-background/50 focus-visible:border-primary/50 focus-visible:bg-background/80 hover:border-primary/30 hover:bg-background/60",
      glass: "border-primary/20 bg-white/5 backdrop-blur-xl focus-visible:border-primary/50 focus-visible:bg-white/10 hover:border-primary/30",
      neon: "border-primary/30 bg-transparent focus-visible:border-primary focus-visible:shadow-[0_0_20px_rgba(14,165,233,0.3),inset_0_0_10px_rgba(14,165,233,0.1)] hover:border-primary/50",
    };

    const baseStyles = cn(
      "flex h-11 w-full rounded-xl border px-4 py-2.5 text-base backdrop-blur-sm",
      "ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
      "placeholder:text-muted-foreground/60",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "md:text-sm transition-all duration-300",
      variantStyles[variant],
      className
    );

    if (enableMotion) {
      return (
        <motion.input
          type={type}
          className={baseStyles}
          ref={ref}
          whileFocus={{
            boxShadow: "0 0 0 3px rgba(14, 165, 233, 0.15), 0 0 20px rgba(14, 165, 233, 0.1)",
          }}
          transition={{ duration: 0.2 }}
          {...(props as HTMLMotionProps<"input">)}
        />
      );
    }

    return (
      <input
        type={type}
        className={baseStyles}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

// Search Input with icon support
interface SearchInputProps extends InputProps {
  icon?: React.ReactNode;
  onClear?: () => void;
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, icon, onClear, value, ...props }, ref) => {
    return (
      <div className="relative group">
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 group-focus-within:text-primary transition-colors duration-200">
            {icon}
          </div>
        )}
        <Input
          ref={ref}
          className={cn(
            icon && "pl-11",
            onClear && value && "pr-10",
            className
          )}
          value={value}
          {...props}
        />
        {onClear && value && (
          <motion.button
            type="button"
            onClick={onClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </motion.button>
        )}

        {/* Focus glow effect */}
        <motion.div
          className="absolute inset-0 rounded-xl pointer-events-none"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 0.5 }}
          transition={{ duration: 0.2 }}
          style={{
            background: "linear-gradient(90deg, transparent, rgba(14, 165, 233, 0.03), transparent)",
          }}
        />
      </div>
    );
  }
);
SearchInput.displayName = "SearchInput";

// Floating Label Input
interface FloatingInputProps extends InputProps {
  label: string;
}

const FloatingInput = React.forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ className, label, id, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const [hasValue, setHasValue] = React.useState(false);

    const handleFocus = () => setIsFocused(true);
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      setHasValue(e.target.value !== "");
    };
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(e.target.value !== "");
      props.onChange?.(e);
    };

    const isActive = isFocused || hasValue;

    return (
      <div className="relative">
        <Input
          ref={ref}
          id={id}
          className={cn(
            "pt-6 pb-2",
            className
          )}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          {...props}
        />
        <motion.label
          htmlFor={id}
          className="absolute left-4 text-muted-foreground/70 pointer-events-none origin-left"
          initial={false}
          animate={{
            y: isActive ? -8 : 0,
            scale: isActive ? 0.75 : 1,
            color: isFocused ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.7)",
          }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          style={{
            top: "50%",
            translateY: "-50%",
          }}
        >
          {label}
        </motion.label>
      </div>
    );
  }
);
FloatingInput.displayName = "FloatingInput";

// Password Input with toggle visibility
interface PasswordInputProps extends Omit<InputProps, "type"> {}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);

    return (
      <div className="relative">
        <Input
          ref={ref}
          type={showPassword ? "text" : "password"}
          className={cn("pr-10", className)}
          {...props}
        />
        <motion.button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {showPassword ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </motion.button>
      </div>
    );
  }
);
PasswordInput.displayName = "PasswordInput";

export { Input, SearchInput, FloatingInput, PasswordInput };
