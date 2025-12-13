import { getAuth } from "@/features/auth/queries/get-auth";
import { redirect } from "next/navigation";

/**
 * Verifica se o usuário atual é um administrador e redireciona se não for
 *
 * @param redirectPath Caminho para redirecionar caso não seja administrador (padrão: /)
 * @returns O objeto de usuário verificado para uso adicional
 */
export const requireAdmin = async (redirectPath = "/") => {
  const { user } = await getAuth();

  if (!user) {
    redirect("/sign-in");
  }

  if (user.role !== "ADMIN") {
    redirect(redirectPath);
  }

  return user;
};

/**
 * Verifica se o usuário atual está autenticado e redireciona se não estiver
 *
 * @param redirectPath Caminho para redirecionar caso não esteja autenticado
 * @returns O objeto de usuário verificado para uso adicional
 */
export const requireAuth = async (redirectPath = "/sign-in") => {
  const { user } = await getAuth();

  if (!user) {
    redirect(redirectPath);
  }

  return user;
};

/**
 * Verifica se o usuário tem permissão para acessar um recurso específico
 * Usado para verificar se o usuário é dono de um recurso ou administrador
 *
 * @param ownerId ID do dono do recurso
 * @param redirectPath Caminho para redirecionar se não tiver permissão
 * @returns O objeto de usuário verificado para uso adicional
 */
export const requirePermission = async (
  ownerId: string | null,
  redirectPath = "/"
) => {
  const user = await requireAuth();

  if (user.role !== "ADMIN" && user.id !== ownerId) {
    redirect(redirectPath);
  }

  return user;
};
