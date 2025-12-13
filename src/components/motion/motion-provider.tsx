"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ReactNode } from "react";

interface MotionProviderProps {
  children: ReactNode;
}

export function MotionProvider({ children }: MotionProviderProps) {
  return (
    <AnimatePresence mode="wait">
      {children}
    </AnimatePresence>
  );
}

// Variantes de animação reutilizáveis
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

export const slideInLeft = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

export const slideInRight = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

// Transições padrão
export const springTransition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
};

export const smoothTransition = {
  duration: 0.4,
  ease: [0.4, 0, 0.2, 1],
};

export const fastTransition = {
  duration: 0.2,
  ease: "easeOut",
};

// Componentes de animação pré-configurados
export const MotionDiv = motion.div;
export const MotionSpan = motion.span;
export const MotionSection = motion.section;
export const MotionArticle = motion.article;
export const MotionNav = motion.nav;
export const MotionUl = motion.ul;
export const MotionLi = motion.li;

// Componente de página animada
interface AnimatedPageProps {
  children: ReactNode;
  className?: string;
}

export function AnimatedPage({ children, className }: AnimatedPageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Componente de card animado
interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function AnimatedCard({ children, className, delay = 0 }: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.4, 0, 0.2, 1],
      }}
      whileHover={{
        y: -4,
        transition: { duration: 0.2 },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Componente de lista animada
interface AnimatedListProps {
  children: ReactNode;
  className?: string;
}

export function AnimatedList({ children, className }: AnimatedListProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Componente de item de lista animado
interface AnimatedListItemProps {
  children: ReactNode;
  className?: string;
}

export function AnimatedListItem({ children, className }: AnimatedListItemProps) {
  return (
    <motion.div
      variants={staggerItem}
      transition={smoothTransition}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Componente de texto animado (caracter por caracter)
interface AnimatedTextProps {
  text: string;
  className?: string;
  delay?: number;
}

export function AnimatedText({ text, className, delay = 0 }: AnimatedTextProps) {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay }}
      className={className}
    >
      {text.split("").map((char, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: delay + index * 0.03,
            duration: 0.3,
          }}
        >
          {char}
        </motion.span>
      ))}
    </motion.span>
  );
}

// Componente de botão com efeito de glow
interface GlowButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function GlowButton({ children, className, onClick }: GlowButtonProps) {
  return (
    <motion.button
      whileHover={{
        scale: 1.02,
        boxShadow: "0 0 30px rgba(14, 165, 233, 0.5), 0 0 60px rgba(14, 165, 233, 0.2)",
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className={className}
      onClick={onClick}
    >
      {children}
    </motion.button>
  );
}

// Componente de loading spinner animado
interface LoadingSpinnerProps {
  size?: number;
  className?: string;
}

export function LoadingSpinner({ size = 40, className }: LoadingSpinnerProps) {
  return (
    <motion.div
      className={className}
      style={{ width: size, height: size }}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: "linear",
      }}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: "100%", height: "100%" }}
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="rgba(14, 165, 233, 0.2)"
          strokeWidth="3"
        />
        <path
          d="M12 2C6.47715 2 2 6.47715 2 12"
          stroke="url(#gradient)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="gradient" x1="2" y1="12" x2="12" y2="2">
            <stop stopColor="#0ea5e9" />
            <stop offset="1" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
      </svg>
    </motion.div>
  );
}

// Componente de skeleton animado
interface AnimatedSkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
}

export function AnimatedSkeleton({ className, width, height }: AnimatedSkeletonProps) {
  return (
    <motion.div
      className={`bg-gradient-to-r from-muted/30 via-primary/10 to-muted/30 rounded-lg ${className}`}
      style={{ width, height }}
      animate={{
        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  );
}

// Componente de entrada com efeito de foco
interface AnimatedInputWrapperProps {
  children: ReactNode;
  className?: string;
}

export function AnimatedInputWrapper({ children, className }: AnimatedInputWrapperProps) {
  return (
    <motion.div
      className={className}
      whileFocus={{
        boxShadow: "0 0 0 3px rgba(14, 165, 233, 0.2), 0 0 20px rgba(14, 165, 233, 0.15)",
      }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

// Componente de pulse indicator
interface PulseIndicatorProps {
  color?: string;
  size?: number;
}

export function PulseIndicator({ color = "#0ea5e9", size = 12 }: PulseIndicatorProps) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ backgroundColor: color }}
        animate={{
          scale: [1, 1.5, 1],
          opacity: [1, 0, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <div
        className="absolute inset-0 rounded-full"
        style={{ backgroundColor: color }}
      />
    </div>
  );
}

// Componente de notificação badge animado
interface AnimatedBadgeProps {
  count: number;
  className?: string;
}

export function AnimatedBadge({ count, className }: AnimatedBadgeProps) {
  return (
    <motion.span
      key={count}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={className}
    >
      {count}
    </motion.span>
  );
}

// Componente de hover card com efeito 3D
interface HoverCard3DProps {
  children: ReactNode;
  className?: string;
}

export function HoverCard3D({ children, className }: HoverCard3DProps) {
  return (
    <motion.div
      className={className}
      whileHover={{
        rotateX: 5,
        rotateY: 5,
        scale: 1.02,
        transition: { duration: 0.3 },
      }}
      style={{
        transformStyle: "preserve-3d",
        perspective: 1000,
      }}
    >
      {children}
    </motion.div>
  );
}

