/**
 * Utilitário para garantir tratamento consistente de valores nulos/indefinidos
 * em todo o projeto
 */

/**
 * Converte valores possivelmente nulos ou vazios para null explícito
 *
 * @param value Valor para normalizar
 * @returns null se o valor for falsy, "null", ou string vazia; caso contrário, retorna o valor original
 */
export const toNullable = <T>(
  value: T | null | undefined | string
): T | null => {
  if (
    value === null ||
    value === undefined ||
    value === "" ||
    value === "null"
  ) {
    return null;
  }
  return value as T;
};

/**
 * Converte valores possivelmente nulos para string "null" para uso em formulários
 *
 * @param value Valor para normalizar
 * @returns "null" se o valor for null ou undefined; caso contrário, retorna o valor como string
 */
export const fromNullable = <T>(value: T | null | undefined): string => {
  if (value === null || value === undefined) {
    return "null";
  }
  return String(value);
};

/**
 * Extrai valores de FormData para um objeto, tratando valores nulos adequadamente
 *
 * @param formData FormData para extrair valores
 * @param fields Array de nomes de campos para extrair
 * @returns Objeto com valores extraídos, com valores nulos normalizados
 */
export const extractFormValues = (
  formData: FormData,
  fields: string[]
): Record<string, any> => {
  const values: Record<string, any> = {};

  for (const field of fields) {
    const value = formData.get(field);
    values[field] = toNullable(value);
  }

  return values;
};
