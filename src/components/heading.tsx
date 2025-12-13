"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface HeadingProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  className?: string;
  badge?: string;
}

export function Heading({ title, description, icon, className, badge }: HeadingProps) {
  return (
    <motion.div
      className={cn("flex items-start gap-4", className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
    >
      {icon && (
        <motion.div
          className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-blue-500/20 border border-primary/20"
          whileHover={{ scale: 1.05, rotate: 5 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <span className="text-primary">{icon}</span>
        </motion.div>
      )}

      <div className="flex-1">
        <div className="flex items-center gap-3 flex-wrap">
          <motion.h1
            className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-display)] tracking-tight bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            {title}
          </motion.h1>

          {badge && (
            <motion.span
              className="px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary border border-primary/20"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              {badge}
            </motion.span>
          )}
        </div>

        {description && (
          <motion.p
            className="mt-2 text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {description}
          </motion.p>
        )}

        {/* Decorative line */}
        <motion.div
          className="mt-4 h-px bg-gradient-to-r from-primary/50 via-primary/20 to-transparent"
          initial={{ scaleX: 0, originX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        />
      </div>
    </motion.div>
  );
}
