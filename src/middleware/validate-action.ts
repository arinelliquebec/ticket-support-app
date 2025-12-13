import { z } from "zod";
import {
  ActionState,
  fromErrorToActionState,
} from "@/components/form/utils/to-action-state";

/**
 * Middleware que aplica validação de esquema Zod em Server Actions
 *
 * @param schema Esquema Zod para validação
 * @param handler Função que processa os dados validados
 * @returns Uma função que aceita formData, valida e executa o handler
 */
export function withValidation<
  T extends z.ZodType<any, any>,
  R extends ActionState
>(
  schema: T,
  handler: (validData: z.infer<T>, formData: FormData) => Promise<R>
) {
  return async (
    prevState: ActionState,
    formData: FormData
  ): Promise<R | ActionState> => {
    try {
      // Extrair dados do FormData para um objeto simples
      const rawData: Record<string, any> = {};
      formData.forEach((value, key) => {
        rawData[key] = value;
      });

      // Validar dados com o esquema Zod
      const parseResult = schema.safeParse(rawData);

      if (!parseResult.success) {
        // Transformar erros do Zod em formato compatível com ActionState
        const fieldErrors: Record<string, string[]> = {};
        parseResult.error.errors.forEach((err) => {
          const path = err.path[0] as string;
          if (!fieldErrors[path]) {
            fieldErrors[path] = [];
          }
          fieldErrors[path].push(err.message);
        });

        return {
          status: "ERROR" as const,
          message: "Por favor, corrija os erros do formulário",
          fieldErrors,
          timestamp: Date.now(),
          success: false,
          data: null,
        };
      }

      // Se a validação passou, continue com o handler
      return await handler(parseResult.data, formData);
    } catch (error) {
      // Capturar exceções e formatar como ActionState
      return fromErrorToActionState(error, formData);
    }
  };
}
