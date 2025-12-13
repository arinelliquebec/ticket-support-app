import { getAuth } from "@/features/auth/queries/get-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminUsersClientPage from "./client";
import { Prisma } from "@prisma/client";

// Define a type for the serialized user data
export type SerializedUser = {
  id: string;
  username: string;
  email: string;
  role: "ADMIN" | "USER";
  sessions: Array<{
    id: string;
    expiresAt: string;
  }>;
};

const AdminUsersPage = async () => {
  // Server-side authentication check
  const { user } = await getAuth();

  if (!user || user.role !== "ADMIN") {
    redirect("/");
  }

  // Get the current user ID
  const currentUserId = user.id;

  // Fetch all users with sessions
  const usersData = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      sessions: {
        select: {
          id: true,
          expiresAt: true,
        },
        orderBy: {
          expiresAt: "desc",
        },
        take: 1,
      },
    },
    orderBy: {
      username: "asc",
    },
  });

  // Transform the data to ensure it's serializable
  const serializedUsers: SerializedUser[] = usersData.map((user) => ({
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role as "ADMIN" | "USER", // Cast to specific union type
    sessions: user.sessions.map((session) => ({
      id: session.id,
      expiresAt: session.expiresAt.toISOString(), // Convert Date to string
    })),
  }));

  return (
    <AdminUsersClientPage
      initialUsers={serializedUsers}
      currentUserId={currentUserId}
    />
  );
};

export default AdminUsersPage;
