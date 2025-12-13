"use client";

import { HashScrollHandler } from "@/components/hash-scroll-handler";
import { ReactNode } from "react";

export function TicketsClientWrapper({ children }: { children: ReactNode }) {
  return (
    <>
      <HashScrollHandler />
      {children}
    </>
  );
}
