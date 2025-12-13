// src/app/api/admin/add-required-categories/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@/features/auth/queries/get-auth";

// Define all required categories
const REQUIRED_CATEGORIES = [
  {
    name: "3CX | Telefonia",
    color: "#EC4899",
    description: "3CX phone system and telephony issues",
  },
  {
    name: "Fone",
    color: "#F87171",
    description: "Issues with headphones or phone devices",
  },
  {
    name: "Monitor",
    color: "#34D399",
    description: "Monitor or display related issues",
  },
  {
    name: "Hardware",
    color: "#60A5FA",
    description: "Computer hardware related issues",
  },
  {
    name: "AlterData",
    color: "#FBBF24",
    description: "AlterData software related issues",
  },
  {
    name: "Internet",
    color: "#8B5CF6",
    description: "Internet connection issues",
  },
  {
    name: "Mouse",
    color: "#A78BFA",
    description: "Mouse and pointing device issues",
  },
  {
    name: "Email",
    color: "#4F46E5",
    description: "Email configuration and issues",
  },
  {
    name: "Domínio Web",
    color: "#0EA5E9",
    description: "Web domain management and issues",
  },
  {
    name: "Sistema Financeiro",
    color: "#10B981",
    description: "Financial system related issues",
  },
  {
    name: "D4SIGN",
    color: "#F59E0B",
    description: "D4SIGN digital signature service issues",
  },
  {
    name: "Criação | Exclusão de Usuário",
    color: "#EF4444",
    description: "User creation and deletion requests",
  },
  {
    name: "CRM",
    color: "#8B5CF6",
    description: "Customer Relationship Management system issues",
  },
  {
    name: "Rock Data",
    color: "#EC4899",
    description: "Rock Data platform related issues",
  },
  {
    name: "Confirme Online",
    color: "#6366F1",
    description: "Confirme Online service issues",
  },
  // New categories added
  {
    name: "Instalar programas",
    color: "#2DD4BF",
    description: "Software installation and setup requests",
  },
  {
    name: "Impressora",
    color: "#FB923C",
    description: "Printer configuration and troubleshooting",
  },
  {
    name: "Certificados",
    color: "#22C55E",
    description: "Digital certificate installation and issues",
  },
  {
    name: "Teclado",
    color: "#C084FC",
    description: "Keyboard-related issues and requests",
  },
  {
    name: "Problema com Sites",
    color: "#38BDF8",
    description: "Website access and functionality issues",
  },
  {
    name: "Outros",
    color: "#9CA3AF",
    description: "Other miscellaneous issues",
  },
];

export async function GET(request: NextRequest) {
  try {
    // Verify if user is authenticated and is admin
    const { user } = await getAuth();

    if (!user || user.role !== "ADMIN") {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 403,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    const results = [];

    // Process each category
    for (const category of REQUIRED_CATEGORIES) {
      // Check if category already exists
      const existing = await prisma.ticketCategory.findFirst({
        where: {
          name: {
            equals: category.name,
            mode: "insensitive", // Case insensitive check
          },
        },
      });

      if (existing) {
        results.push({
          name: category.name,
          status: "exists",
          id: existing.id,
        });
        continue;
      }

      // Create the category
      const newCategory = await prisma.ticketCategory.create({
        data: category,
      });

      results.push({
        name: category.name,
        status: "created",
        id: newCategory.id,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Required categories processed",
      results,
    });
  } catch (error) {
    console.error("Error adding categories:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
