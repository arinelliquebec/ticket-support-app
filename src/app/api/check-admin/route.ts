import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAuth } from "@/features/auth/queries/get-auth";

export async function GET(request: NextRequest) {
  try {
    // Verificar se o usuário está autenticado e é um administrador
    const { user } = await getAuth();

    // Se não houver usuário ou não for um administrador, retornar erro 403
    if (!user || user.role !== "ADMIN") {
      return new NextResponse(null, {
        status: 403,
        statusText: "Forbidden",
      });
    }

    // Usuário é administrador, retornar 200 OK com os dados do usuário
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    // Qualquer erro, retornar 500
    return new NextResponse(null, {
      status: 500,
      statusText: "Internal Server Error",
    });
  }
}
