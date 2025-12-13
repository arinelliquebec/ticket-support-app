import { getAuth } from "@/features/auth/queries/get-auth";
import { AdminTicketNotifications } from "./admin-ticket-notifications";
import { UserNotifications } from "./user-notifications";
import { PushNotificationButton } from "./push-notification-button";
import { AuthButton } from "./auth-button";
import {
  getUnviewedTicketsCount,
  getUnviewedTickets,
} from "@/features/ticket/queries/get-unviewed-tickets-count";
import { Suspense } from "react";
import { HeaderClient } from "./header-client";

export async function Header() {
  const { user } = await getAuth();
  const isAdmin = user?.role === "ADMIN";

  // Fetch notifications data for admins
  let unviewedCount = 0;
  let unviewedTickets: any[] = [];

  if (isAdmin) {
    try {
      [unviewedCount, unviewedTickets] = await Promise.all([
        getUnviewedTicketsCount(),
        getUnviewedTickets(10),
      ]);
    } catch (error) {
      console.error("Error loading admin notifications:", error);
    }
  }

  return (
    <HeaderClient
      isAdmin={isAdmin}
      user={user}
      rightContent={
        <div className="flex items-center gap-3">
          {isAdmin ? (
            <>
              <PushNotificationButton />
              <Suspense fallback={<div className="w-10 h-10 rounded-xl bg-primary/10 animate-pulse" />}>
                <AdminTicketNotifications
                  initialCount={unviewedCount}
                  initialTickets={unviewedTickets}
                />
              </Suspense>
            </>
          ) : user ? (
            <UserNotifications />
          ) : null}
          <AuthButton />
        </div>
      }
    />
  );
}
