"use client";

import { LucideLoaderCircle } from "lucide-react";
import { useFormStatus } from "react-dom";
import { Button } from "../ui/button";

type SubmitButtonProps = {
  label: string;
  className?: string;
};

const SubmitButton = ({ label, className }: SubmitButtonProps) => {
  const { pending } = useFormStatus();

  return (
    <Button
      disabled={pending}
      type="submit"
      className={`relative w-full bg-primary hover:bg-primary/90 transition-all duration-200 font-medium shadow-sm ${className}`}
    >
      {pending && (
        <span className="absolute left-1/2 -translate-x-1/2">
          <LucideLoaderCircle className="h-4 w-4 animate-spin" />
        </span>
      )}
      <span className={pending ? "opacity-0" : "opacity-100"}>{label}</span>
    </Button>
  );
};

export { SubmitButton };
