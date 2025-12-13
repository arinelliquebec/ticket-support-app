import { User as AuthUser } from "lucia";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getAuth } from "../queries/get-auth";

// Estenda a interface AuthUser para incluir o campo avatarUrl
interface ExtendedAuthUser extends AuthUser {
  avatarUrl: string | null;
}

const useAuth = () => {
  const [user, setUser] = useState<ExtendedAuthUser | null>(null);
  const [isFetched, setFetched] = useState(false);

  const pathname = usePathname();

  useEffect(() => {
    const fetchUser = async () => {
      const { user } = await getAuth();
      setUser(user ? { ...user, avatarUrl: user.avatarUrl ?? null } : null);
      setFetched(true);
    };

    fetchUser();
  }, [pathname]);

  return { user, isFetched };
};

export { useAuth };
