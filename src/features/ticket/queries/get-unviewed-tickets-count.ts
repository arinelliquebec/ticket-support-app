"use server";

import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

/**
 * Get count of tickets not yet viewed by admin
 * Cached for 30 seconds for better performance
 */
export const getUnviewedTicketsCount = unstable_cache(
  async () => {
    try {
      const count = await prisma.ticket.count({
        where: {
          viewedByAdmin: false,
        },
      });

      return count;
    } catch (error) {
      console.error("Error fetching unviewed tickets count:", error);
      return 0;
    }
  },
  ["unviewed-tickets-count"],
  {
    revalidate: 30, // Revalidate every 30 seconds
    tags: ["tickets", "admin-notifications"],
  }
);

/**
 * Get list of unviewed tickets for admin notification panel
 */
export const getUnviewedTickets = unstable_cache(
  async (limit: number = 10) => {
    try {
      const tickets = await prisma.ticket.findMany({
        where: {
          viewedByAdmin: false,
        },
        select: {
          id: true,
          title: true,
          priority: true,
          status: true,
          createdAt: true,
          user: {
            select: {
              username: true,
            },
          },
          category: {
            select: {
              name: true,
              color: true,
            },
          },
        },
        orderBy: [

          { createdAt: "desc" }, // Newest first
        ],
        take: limit,
      });

      return tickets;
    } catch (error) {
      console.error("Error fetching unviewed tickets:", error);
      return [];
    }
  },
  ["unviewed-tickets-list"],
  {
    revalidate: 30,
    tags: ["tickets", "admin-notifications"],
  }
);

