import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";

/**
 * Middleware para validação de API com esquemas Zod
 *
 * @param schema Esquema Zod para validação do corpo da requisição
 * @param handler Função que processa a requisição validada
 * @returns Função de handler de API com validação
 */
export function withApiValidation<T extends z.ZodType<any, any>>(
  schema: T,
  handler: (
    req: NextRequest,
    validData: z.infer<T>,
    params?: any
  ) => Promise<NextResponse>
) {
  return async (
    req: NextRequest,
    context?: { params: any }
  ): Promise<NextResponse> => {
    try {
      // Para requisições GET, não validamos o corpo
      if (req.method === "GET") {
        return await handler(req, {} as z.infer<T>, context?.params);
      }

      // Para outros métodos, validamos o corpo
      let body: any;

      try {
        body = await req.json();
      } catch (error) {
        return NextResponse.json(
          { success: false, error: "Invalid JSON body" },
          { status: 400 }
        );
      }

      // Validar corpo com o esquema Zod
      const parseResult = schema.safeParse(body);

      if (!parseResult.success) {
        return NextResponse.json(
          {
            success: false,
            error: "Validation error",
            details: parseResult.error.flatten(),
          },
          { status: 400 }
        );
      }

      // Se a validação passar, continue com o handler
      return await handler(req, parseResult.data, context?.params);
    } catch (error) {
      console.error("API error:", error);

      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  };
}
