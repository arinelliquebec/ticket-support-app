// src/app/api/ticket-categories/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@/features/auth/queries/get-auth";

// GET /api/ticket-categories - Listar todas as categorias
export async function GET(request: NextRequest) {
  try {
    // Verificar se o usuário está autenticado
    const { user } = await getAuth();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Buscar todas as categorias ordenadas por nome
    const categories = await prisma.ticketCategory.findMany({
      orderBy: {
        name: "asc",
      },
      include: {
        // Incluir a contagem de tickets para cada categoria
        _count: {
          select: {
            tickets: true,
          },
        },
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching ticket categories:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch ticket categories",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// POST /api/ticket-categories - Criar uma nova categoria
export async function POST(request: NextRequest) {
  try {
    // Verificar se o usuário é administrador
    const { user } = await getAuth();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Somente administradores podem criar categorias" },
        { status: 403 }
      );
    }

    // Obter dados da requisição
    const data = await request.json();

    // Validar dados
    if (!data.name) {
      return NextResponse.json(
        { error: "Categoria é obrigatória" },
        { status: 400 }
      );
    }

    // Verificar se já existe uma categoria com o mesmo nome
    const existingCategory = await prisma.ticketCategory.findFirst({
      where: {
        name: {
          equals: data.name,
          mode: "insensitive", // Case insensitive para evitar duplicatas
        },
      },
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: "Uma categoria com o mesmo nome já existe" },
        { status: 409 }
      );
    }

    // Criar a categoria
    const category = await prisma.ticketCategory.create({
      data: {
        name: data.name,
        color: data.color || "#6366F1", // Cor padrão se não for fornecida
        icon: data.icon,
        description: data.description,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar categoria:", error);
    return NextResponse.json(
      {
        error: "Falha em criar categoria de tickets",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
