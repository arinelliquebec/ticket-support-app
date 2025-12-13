// src/services/email-service.ts
import { Resend } from "resend";

// Initialize Resend with your API key
const resendApiKey = process.env.RESEND_API_KEY;

// Check if API key is available
if (!resendApiKey) {
  console.warn("RESEND_API_KEY is not defined in environment variables");
}

const resend = new Resend(resendApiKey || "dummy_key_for_dev");

/**
 * Sends ticket completion notification emails to relevant stakeholders
 *
 * @param userEmail Email of the ticket creator
 * @param userName Name of the ticket creator
 * @param adminEmail Email of the admin who marked the ticket as done
 * @param adminName Name of the admin who marked the ticket as done
 * @param ticketTitle Title of the completed ticket
 * @param ticketId ID of the completed ticket
 * @param ticketContent Content of the completed ticket
 * @param filial Branch/location of the ticket
 * @param additionalRecipients Optional list of additional email recipients
 */
export async function sendTicketCompletedEmails(
  userEmail: string,
  userName: string,
  adminEmail: string,
  adminName: string,
  ticketTitle: string,
  ticketId: string,
  ticketContent: string,
  filial?: string | null,
  additionalRecipients: string[] = []
) {
  if (!userEmail && !adminEmail && additionalRecipients.length === 0) {
    console.warn(
      "No email recipients provided for ticket completion notification"
    );
    return;
  }

  // Format current date and time for the email with Brasília timezone
  const now = new Date();
  const formattedDate = now.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "America/Sao_Paulo", // Brasília time zone (UTC-3)
  });
  const formattedTime = now.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo", // Brasília time zone (UTC-3)
  });

  // Create the completion timestamp
  const completionTimestamp = `${formattedDate} às ${formattedTime}`;

  // Prepare email content for user
  const userEmailHTML = `
    <html>
      <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
          <div style="background-color: #0ea5e9; color: white; padding: 10px 20px; border-radius: 5px 5px 0 0;">
            <h2 style="margin: 0;">Ticket Concluído</h2>
          </div>
          <div style="padding: 20px;">
            <p>Olá ${userName},</p>
            <p>Seu ticket foi marcado como <strong>CONCLUÍDO</strong> pelo administrador ${adminName}.</p>
            
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <h3 style="margin-top: 0; color: #0ea5e9;">Detalhes do Ticket</h3>
              <p><strong>Título:</strong> ${ticketTitle}</p>
              <p><strong>ID:</strong> ${ticketId}</p>
              ${filial ? `<p><strong>Filial:</strong> ${filial}</p>` : ""}
              <p><strong>Status:</strong> <span style="color: #10b981; font-weight: bold;">CONCLUÍDO</span></p>
              <p><strong>Concluído em:</strong> ${completionTimestamp}</p>
            </div>
            
            <p>Se você tiver alguma dúvida ou o problema não estiver completamente resolvido, por favor responda a este email ou abra um novo ticket.</p>
            
            <div style="margin-top: 25px; padding-top: 15px; border-top: 1px solid #eaeaea;">
              <p style="font-size: 12px; color: #666;">Este é um email automático. Por favor, não responda diretamente a este email.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  // Prepare email content for admin/staff (slightly different)
  const adminEmailHTML = `
    <html>
      <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
          <div style="background-color: #0ea5e9; color: white; padding: 10px 20px; border-radius: 5px 5px 0 0;">
            <h2 style="margin: 0;">Ticket Marcado Como Concluído</h2>
          </div>
          <div style="padding: 20px;">
            <p>Olá ${adminName},</p>
            <p>Um ticket foi marcado como <strong>CONCLUÍDO</strong> por você.</p>
            
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <h3 style="margin-top: 0; color: #0ea5e9;">Detalhes do Ticket</h3>
              <p><strong>Título:</strong> ${ticketTitle}</p>
              <p><strong>ID:</strong> ${ticketId}</p>
              <p><strong>Criado por:</strong> ${userName}</p>
              ${filial ? `<p><strong>Filial:</strong> ${filial}</p>` : ""}
              <p><strong>Status:</strong> <span style="color: #10b981; font-weight: bold;">CONCLUÍDO</span></p>
              <p><strong>Concluído em:</strong> ${completionTimestamp}</p>
            </div>
            
            <p>Uma notificação foi enviada ao usuário informando sobre a conclusão do ticket.</p>
            
            <div style="margin-top: 25px; padding-top: 15px; border-top: 1px solid #eaeaea;">
              <p style="font-size: 12px; color: #666;">Este é um email automático do sistema de tickets.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    // Check if Resend API key is available
    if (!process.env.RESEND_API_KEY) {
      console.warn("Cannot send emails: RESEND_API_KEY is not configured");
      return false;
    }

    const fromEmail = process.env.EMAIL_FROM || "suporteti@fradema.com.br";
    const results = [];

    // Send email to user
    if (userEmail && userEmail.includes("@")) {
      console.log(`Sending user completion email to: ${userEmail}`);
      try {
        const result = await resend.emails.send({
          from: fromEmail,
          to: userEmail,
          subject: `Ticket Concluído: ${ticketTitle}`,
          html: userEmailHTML,
        });
        console.log("User email sent:", result);
        results.push({ recipient: "user", success: true });
      } catch (err) {
        console.error(`Failed to send user email to ${userEmail}:`, err);
        results.push({ recipient: "user", success: false, error: err });
      }
    } else {
      console.log("No valid user email available, skipping user notification");
    }

    // Send email to admin
    if (adminEmail && adminEmail.includes("@")) {
      console.log(`Sending admin completion email to: ${adminEmail}`);
      try {
        const result = await resend.emails.send({
          from: fromEmail,
          to: adminEmail,
          subject: `Confirmação: Ticket Concluído - ${ticketTitle}`,
          html: adminEmailHTML,
        });
        console.log("Admin email sent:", result);
        results.push({ recipient: "admin", success: true });
      } catch (err) {
        console.error(`Failed to send admin email to ${adminEmail}:`, err);
        results.push({ recipient: "admin", success: false, error: err });
      }
    } else {
      console.log(
        "No valid admin email available, skipping admin notification"
      );
    }

    // Send to additional recipients if any
    if (additionalRecipients.length > 0) {
      const validRecipients = additionalRecipients.filter(
        (email) => email && email.includes("@")
      );

      if (validRecipients.length > 0) {
        console.log(
          `Sending notification to ${validRecipients.length} additional recipients`
        );
        try {
          const result = await resend.emails.send({
            from: fromEmail,
            to: validRecipients,
            subject: `[Notificação] Ticket Concluído: ${ticketTitle}`,
            html: adminEmailHTML, // Use the admin template for additional staff
          });
          console.log("Additional recipients email sent:", result);
          results.push({ recipient: "additional", success: true });
        } catch (err) {
          console.error(`Failed to send emails to additional recipients:`, err);
          results.push({ recipient: "additional", success: false, error: err });
        }
      } else {
        console.log("No valid additional recipients, skipping notifications");
      }
    }

    const allSuccessful = results.every((r) => r.success);
    console.log(
      `Email sending complete for ticket ${ticketId}. All successful: ${allSuccessful}`
    );
    return allSuccessful;
  } catch (error) {
    console.error("Error in email sending process:", error);
    // Don't throw error, just return false to indicate failure
    return false;
  }
}
