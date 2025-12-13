"use client";

import { LucideTickets, LucideMenu, LucideX, LucideLayoutDashboard, LucideUsers, LucideSettings } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, ReactNode } from "react";
import { homePath, ticketsPath } from "@/paths";
import { cn } from "@/lib/utils";

interface HeaderClientProps {
  isAdmin: boolean;
  user: any;
  rightContent: ReactNode;
}

export function HeaderClient({ isAdmin, user, rightContent }: HeaderClientProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Render static nav first, apply animations only after mount
  return (
    <nav
      className={cn(
        "fixed left-0 right-0 top-0 z-50 w-full",
        "transition-all duration-500 ease-out",
        isScrolled ? "py-2" : "py-3",
        // Apply enter animation via CSS class after mount
        isMounted ? "animate-fade-from-top" : ""
      )}
    >
      {/* Background solid */}
      <div className="absolute inset-0 -z-10">
        <div
          className={cn(
            "absolute inset-0 transition-all duration-500 bg-background",
            isScrolled && "shadow-lg shadow-primary/5"
          )}
        />

        {/* Top gradient line */}
        <div
          className={cn(
            "absolute top-0 left-0 right-0 h-px transition-opacity duration-300",
            isScrolled ? "opacity-80" : "opacity-50"
          )}
          style={{
            background: "linear-gradient(90deg, transparent, rgba(14, 165, 233, 0.5), transparent)",
          }}
        />

        {/* Bottom border with glow */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

        {/* Subtle glow effect when scrolled */}
        <div
          className={cn(
            "absolute inset-x-0 -bottom-8 h-16 bg-gradient-to-b from-primary/5 to-transparent blur-2xl transition-opacity duration-300",
            isScrolled ? "opacity-100" : "opacity-0"
          )}
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo and Navigation */}
          <div className="flex items-center gap-x-8">
            <Link href={homePath()} className="group flex items-center gap-3">
              <div className="relative">
                {/* Logo container with futuristic styling */}
                <div className="relative p-2.5 rounded-xl bg-gradient-to-br from-primary/20 via-primary/10 to-blue-500/20 border border-primary/30 group-hover:border-primary/50 transition-all duration-300 overflow-hidden">
                  <LucideTickets className="h-6 w-6 text-primary relative z-10" />

                  {/* Inner glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Shimmer effect */}
                  <div className="absolute inset-0 rounded-xl shimmer-effect opacity-0 group-hover:opacity-100" />
                </div>
              </div>

              <div className="flex flex-col">
                <span className="text-lg font-bold bg-gradient-to-r from-primary via-blue-400 to-primary bg-clip-text text-transparent bg-[length:200%_auto] font-[family-name:var(--font-display)] tracking-wide">
                  Suporte Fradema
                </span>
                <span className="text-[10px] text-muted-foreground/60 tracking-widest uppercase">
                  Sistema de Tickets
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <NavLink href={ticketsPath()} icon={<LucideTickets className="h-4 w-4" />}>
                Tickets
              </NavLink>

              {isAdmin && (
                <>
                  <NavLink href="/admin" icon={<LucideLayoutDashboard className="h-4 w-4" />}>
                    Admin
                  </NavLink>
                  <NavLink href="/admin/users" icon={<LucideUsers className="h-4 w-4" />}>
                    Usuários
                  </NavLink>
                </>
              )}
            </nav>
          </div>

          {/* Right side - Auth and notifications */}
          <div className="flex items-center gap-3">
            {rightContent}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2.5 rounded-xl bg-primary/5 hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all duration-200 border border-primary/10 hover:border-primary/20 active:scale-95"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <LucideX className="h-5 w-5" />
              ) : (
                <LucideMenu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMounted && (
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="md:hidden overflow-hidden"
            >
              <motion.div
                className="px-4 py-4 space-y-1 border-t border-primary/10 mt-2 bg-background/80 backdrop-blur-xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <MobileNavLink
                  href={ticketsPath()}
                  onClick={() => setIsMobileMenuOpen(false)}
                  icon={<LucideTickets className="h-5 w-5" />}
                >
                  Tickets
                </MobileNavLink>

                {isAdmin && (
                  <>
                    <MobileNavLink
                      href="/admin"
                      onClick={() => setIsMobileMenuOpen(false)}
                      icon={<LucideLayoutDashboard className="h-5 w-5" />}
                    >
                      Painel Admin
                    </MobileNavLink>
                    <MobileNavLink
                      href="/admin/users"
                      onClick={() => setIsMobileMenuOpen(false)}
                      icon={<LucideUsers className="h-5 w-5" />}
                    >
                      Gerenciar Usuários
                    </MobileNavLink>
                  </>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </nav>
  );
}

// Navigation Link component
interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

function NavLink({ href, children, icon }: NavLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "relative px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground",
        "hover:text-primary hover:bg-primary/10 transition-all duration-200",
        "flex items-center gap-2 group active:scale-98"
      )}
    >
      {icon && (
        <span className="text-primary/60 group-hover:text-primary transition-colors">
          {icon}
        </span>
      )}
      {children}

      {/* Animated underline via CSS */}
      <span className="absolute bottom-1 left-4 right-4 h-px bg-gradient-to-r from-transparent via-primary to-transparent scale-x-0 group-hover:scale-x-100 opacity-0 group-hover:opacity-100 transition-all duration-200" />
    </Link>
  );
}

// Mobile Navigation Link
interface MobileNavLinkProps extends NavLinkProps {
  onClick?: () => void;
}

function MobileNavLink({ href, children, onClick, icon }: MobileNavLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="px-4 py-3.5 rounded-xl text-muted-foreground hover:text-primary bg-primary/5 hover:bg-primary/10 transition-all duration-200 flex items-center gap-3 border border-primary/5 hover:border-primary/20 hover:translate-x-1"
    >
      {icon && (
        <span className="text-primary/60">
          {icon}
        </span>
      )}
      <span className="font-medium">{children}</span>
    </Link>
  );
}
