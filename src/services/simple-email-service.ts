// src/services/simple-email-service.ts
// This file is the one being imported by update-ticket-status.ts

import { sendStatusChangeEmail as sendEmail } from "./resend-service";

// Export the function with the exact signature that's being imported
export function sendStatusChangeEmail(
  ticketId: string,
  ticketTitle: string,
  newStatus: string,
  userEmail: string,
  userName: string,
  adminEmail: string,
  adminName: string,
  filial?: string | null
): Promise<boolean> {
  // Just forward to our implementation
  return sendEmail(
    ticketId,
    ticketTitle,
    newStatus,
    userEmail,
    userName,
    adminEmail,
    adminName,
    filial
  );
}

// This ensures backward compatibility if any other code uses this module
