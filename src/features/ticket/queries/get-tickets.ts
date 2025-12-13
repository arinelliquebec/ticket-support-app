// src/features/ticket/queries/get-tickets.ts
"use server";

import { getAuth } from "@/features/auth/queries/get-auth";
import { prisma } from "@/lib/prisma";
import { PaginatedData } from "@/types/pagination";
import { TicketStatus } from "@prisma/client";

export type GetTicketsOptions = {
  page?: number;
  size?: number;
  search?: string | null;
  status?: string | null;
  categoryId?: string | null;
  dateFrom?: string | null;
  dateTo?: string | null;
  filial?: string | null;
  priority?: string | null;
  sortBy?: string | null;
  sortOrder?: string | null;
};

export const getTickets = async (
  options: GetTicketsOptions = {}
): Promise<PaginatedData<any>> => {
  try {
    // Get authenticated user
    const { user } = await getAuth();

    // If no user is authenticated, return empty list
    if (!user) {
      return {
        list: [],
        metadata: {
          count: 0,
          hasNextPage: false,
        },
      };
    }

    // Extract pagination parameters with defaults
    const page = options.page || 0;
    const size = options.size || 5;

    // Build the where clause based on filters and user role
    const where: any = {};

    // Base condition - admins can see all tickets, users only their own
    if (user.role !== "ADMIN") {
      where.userId = user.id;
    }

    // Apply search filter if provided
    if (options.search && options.search.trim() !== "") {
      where.OR = [
        { title: { contains: options.search, mode: "insensitive" } },
        { content: { contains: options.search, mode: "insensitive" } },
      ];
    }

    // Apply status filter - simple direct approach
    if (options.status && options.status.trim() !== "") {
      // Valid statuses are: "ABERTO", "EM_ANDAMENTO", "CONCLUÍDO"
      const validStatus = ["ABERTO", "EM_ANDAMENTO", "CONCLUÍDO"].includes(
        options.status
      );
      if (validStatus) {
        where.status = options.status;
      }
    }

    // Apply category filter if provided
    if (options.categoryId && options.categoryId.trim() !== "") {
      where.categoryId = options.categoryId;
    }

    // Apply filial filter if provided
    if (options.filial && options.filial.trim() !== "") {
      where.filial = options.filial;
    }

    // Apply priority filter if provided
    if (options.priority && options.priority.trim() !== "") {
      const validPriorities = ["BAIXA"];
      if (validPriorities.includes(options.priority)) {
        where.priority = options.priority;
      }
    }

    // Apply date range filters if provided
    if (options.dateFrom || options.dateTo) {
      where.deadline = {};

      if (options.dateFrom && options.dateFrom.trim() !== "") {
        where.deadline.gte = options.dateFrom;
      }

      if (options.dateTo && options.dateTo.trim() !== "") {
        where.deadline.lte = options.dateTo;
      }
    }

    // Build orderBy clause based on sortBy and sortOrder parameters
    let orderBy: any = { createdAt: "desc" }; // Default sorting by newest first

    if (options.sortBy && options.sortOrder) {
      const validSortFields = [
        "createdAt",
        "updatedAt",
        "deadline",
        "title",
        "priority",
      ];
      const validSortOrders = ["asc", "desc"];

      if (
        validSortFields.includes(options.sortBy) &&
        validSortOrders.includes(options.sortOrder)
      ) {
        orderBy = { [options.sortBy]: options.sortOrder };
        console.log("Applied sorting:", {
          sortBy: options.sortBy,
          sortOrder: options.sortOrder,
          orderBy,
        });
      } else {
        console.log("Invalid sorting parameters:", {
          sortBy: options.sortBy,
          sortOrder: options.sortOrder,
        });
      }
    } else {
      console.log("No sorting parameters provided, using default:", orderBy);
    }

    // Execute queries in parallel for better performance
    const [count, tickets] = await Promise.all([
      // Get total count for pagination (with same filters)
      prisma.ticket.count({ where }),

      // Fetch tickets with pagination, sorting, and relationships
      prisma.ticket.findMany({
        where,
        orderBy,
        include: {
          user: {
            select: {
              username: true,
              email: true, // Added email field
              avatarUrl: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
          _count: {
            select: {
              attachments: true,
              comments: true,
            },
          },
        },
        skip: page * size,
        take: size,
      }),
    ]);

    // Check if there's a next page
    const hasNextPage = (page + 1) * size < count;

    return {
      list: tickets,
      metadata: {
        count,
        hasNextPage,
      },
    };
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return {
      list: [],
      metadata: {
        count: 0,
        hasNextPage: false,
      },
    };
  }
};
