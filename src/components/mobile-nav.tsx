"use client";

import { useState } from "react";
import Link from "next/link";
import {
  LucideLayoutDashboard,
  LucideUsers,
  LucideTicket,
  LucideSettings,
  LucideMenu,
  LucideX,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LucideLayoutDashboard,
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: LucideUsers,
  },
  {
    label: "Tickets",
    href: "/admin/tickets",
    icon: LucideTicket,
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: LucideSettings,
  },
];

export const MobileNav = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleNav = () => setIsOpen(!isOpen);

  return (
    <div className="md:hidden">
      <Button variant="outline" size="icon" onClick={toggleNav}>
        {isOpen ? (
          <LucideX className="h-5 w-5" />
        ) : (
          <LucideMenu className="h-5 w-5" />
        )}
        <span className="sr-only">Toggle menu</span>
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
          <div className="fixed top-0 left-0 h-full w-3/4 max-w-xs bg-background p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Admin Panel</h2>
              <Button variant="ghost" size="icon" onClick={toggleNav}>
                <LucideX className="h-5 w-5" />
              </Button>
            </div>

            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={toggleNav}
                    className="flex items-center gap-x-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-secondary transition-colors"
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
};
