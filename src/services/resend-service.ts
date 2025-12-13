// src/services/resend-service.ts
import { Resend } from "resend";

// Create a better Resend service implementation with proper error handling

// Define a singleton instance to avoid multiple instantiations
let resendInstance: Resend | null = null;

// Factory function that provides properly configured Resend instance
export function getResendClient(): Resend {
  if (resendInstance) {
    return resendInstance;
  }

  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.error("RESEND_API_KEY environment variable is not set!");
    throw new Error("Resend API key not configured");
  }

  resendInstance = new Resend(apiKey);
  return resendInstance;
}

// Email template generator for status updates
function generateStatusChangeTemplate(
  ticketId: string,
  ticketTitle: string,
  newStatus: string,
  userName: string,
  adminName: string,
  filial?: string | null
): string {
  // Status color mapping
  const statusColor =
    newStatus === "CONCLUÍDO"
      ? "#10b981"
      : newStatus === "EM_ANDAMENTO"
      ? "#f59e0b"
      : "#3b82f6";

  // Generate timestamp
  const date = new Date();
  const formattedDate = date.toLocaleDateString("pt-BR");
  const formattedTime = date.toLocaleTimeString("pt-BR");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Ticket Status Update</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #0ea5e9; margin-bottom: 5px; font-size: 24px;">Ticket Status Update</h1>
          <p style="margin: 0; color: #666;">Fradema Support System</p>
        </div>

        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px; border-left: 4px solid ${statusColor};">
          <h2 style="margin-top: 0; color: #0ea5e9; font-size: 18px;">Ticket Details</h2>
          <p><strong>Title:</strong> ${ticketTitle}</p>
          <p><strong>ID:</strong> ${ticketId}</p>
          <p><strong>New Status:</strong> <span style="color: ${statusColor}; font-weight: bold;">${newStatus}</span></p>
          ${filial ? `<p><strong>Filial:</strong> ${filial}</p>` : ""}
          <p><strong>Updated by:</strong> ${adminName}</p>
          <p><strong>Updated on:</strong> ${formattedDate} at ${formattedTime}</p>
        </div>

        <div style="margin-bottom: 30px;">
          <p>Hello ${userName},</p>
          <p>Your ticket has been updated to status <strong>${newStatus}</strong>.</p>
          <p>If you have any questions, please contact our support team.</p>
        </div>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #999; text-align: center;">
          <p>This is an automated email from the Fradema ticket system.</p>
          <p>&copy; ${new Date().getFullYear()} Fradema. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Send an email notification about a ticket status change with improved error handling
 */
export async function sendStatusChangeEmail(
  ticketId: string,
  ticketTitle: string,
  newStatus: string,
  userEmail: string,
  userName: string,
  adminEmail: string,
  adminName: string,
  filial?: string | null
): Promise<boolean> {
  try {
    // Skip if no valid recipient
    if (!userEmail || !userEmail.includes("@")) {
      console.warn(`Cannot send email: Invalid recipient email (${userEmail})`);
      return false;
    }

    // Get properly configured Resend client
    const resend = getResendClient();

    // Get proper FROM address, fallback to the specified email
    const fromEmail = process.env.EMAIL_FROM || "suporteti@fradema.com.br";

    // Generate the email HTML content
    const htmlContent = generateStatusChangeTemplate(
      ticketId,
      ticketTitle,
      newStatus,
      userName,
      adminName,
      filial
    );

    // Send the email with proper error handling
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: userEmail,
      subject: `Ticket Update: ${ticketTitle}`,
      html: htmlContent,
      // Add these useful headers for tracking
      headers: {
        "X-Ticket-ID": ticketId,
        "X-Entity-Ref-ID": `ticket-${ticketId}-${Date.now()}`,
      },
    });

    if (error) {
      console.error("Resend API error:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Exception sending email:", error);
    return false;
  }
}

// For direct testing/debugging
export async function sendTestEmail(
  to: string
): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    const resend = getResendClient();
    const fromEmail = process.env.EMAIL_FROM || "suporteti@fradema.com.br";

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to,
      subject: "Fradema Support System - Test Email",
      html: `
        <h1>Test Email</h1>
        <p>This is a test email from the Fradema ticket system.</p>
        <p>Time: ${new Date().toISOString()}</p>
      `,
    });

    if (error) {
      return {
        success: false,
        message: `Resend API error: ${error.message}`,
        data: error,
      };
    }

    return {
      success: true,
      message: "Test email sent successfully",
      data,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      message: `Exception: ${errorMessage}`,
      data: error,
    };
  }
}
