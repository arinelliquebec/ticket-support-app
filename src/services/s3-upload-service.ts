// src/services/s3-upload-service.ts
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { prisma } from "@/lib/prisma";

// Config
const S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || "";
const S3_REGION = process.env.AWS_S3_REGION || "us-east-1";
const TICKET_ATTACHMENTS_PREFIX = "ticket-attachments/";
const DEBUG = true;

// Initialize S3 client
const s3Client = new S3Client({
  region: S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

/**
 * Logger for debugging
 */
const debug = {
  log: (...args: any[]) => {
    if (DEBUG) console.log("[S3UploadService]", ...args);
  },
  error: (...args: any[]) => {
    if (DEBUG) console.error("[S3UploadService ERROR]", ...args);
  },
  info: (...args: any[]) => {
    if (DEBUG) console.info("[S3UploadService INFO]", ...args);
  },
  warn: (...args: any[]) => {
    if (DEBUG) console.warn("[S3UploadService WARN]", ...args);
  },
};

/**
 * Check S3 connection and configuration
 */
export const checkS3Connection = async () => {
  try {
    debug.log("Checking AWS S3 connection...");

    // Check environment variables
    if (
      !process.env.AWS_ACCESS_KEY_ID ||
      !process.env.AWS_SECRET_ACCESS_KEY ||
      !S3_BUCKET_NAME
    ) {
      debug.error("AWS credentials or bucket name not configured");
      return {
        success: false,
        error: "AWS S3 credentials not properly configured",
      };
    }

    // Test connection by listing objects (with a small limit)
    const testKey = `${TICKET_ATTACHMENTS_PREFIX}test-connection-${Date.now()}.txt`;

    try {
      // Upload a small test file
      await s3Client.send(
        new PutObjectCommand({
          Bucket: S3_BUCKET_NAME,
          Key: testKey,
          Body: "Connection test",
          ContentType: "text/plain",
        })
      );

      // Delete the test file
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: S3_BUCKET_NAME,
          Key: testKey,
        })
      );

      debug.info("AWS S3 connection successful");
      return { success: true };
    } catch (error) {
      debug.error("S3 test operation failed:", error);
      return {
        success: false,
        error:
          "Failed to connect to S3 bucket. Please check credentials and permissions.",
        details: error,
      };
    }
  } catch (error) {
    debug.error("Error checking S3 connection:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      details: error,
    };
  }
};

/**
 * Upload file to S3 and save record in database
 */
export const uploadTicketAttachment = async (
  file: File,
  ticketId: string,
  userId: string
): Promise<{
  success: boolean;
  attachment?: any;
  error?: string;
  details?: any;
}> => {
  try {
    debug.log(
      `Starting upload: "${file.name}" (${file.size} bytes, type: ${file.type}) for ticket: ${ticketId}`
    );

    // Step 1: Check file size
    if (file.size > 10 * 1024 * 1024) {
      debug.warn(`File too large: ${file.size} bytes`);
      return {
        success: false,
        error: "File exceeds 10MB limit",
      };
    }

    // Step 2: Check S3 connection
    const connectionCheck = await checkS3Connection();
    if (!connectionCheck.success) {
      return connectionCheck;
    }

    // Step 3: Generate unique filename
    const fileExtension = file.name.split(".").pop() || "";
    const fileName = `${TICKET_ATTACHMENTS_PREFIX}ticket_${ticketId}_${Date.now()}_${Math.floor(
      Math.random() * 10000
    )}.${fileExtension}`;
    debug.log(`Generated filename: ${fileName}`);

    // Step 4: Convert file to buffer
    debug.log("Converting file to buffer...");
    let buffer: Uint8Array;
    try {
      const arrayBuffer = await file.arrayBuffer();
      buffer = new Uint8Array(arrayBuffer);
      debug.log(`File converted: ${buffer.length} bytes`);
    } catch (conversionError) {
      debug.error("Error converting file:", conversionError);
      return {
        success: false,
        error: "Error processing file",
        details: conversionError,
      };
    }

    // Step 5: Upload to S3 with retry
    debug.log(`Starting upload to S3 bucket...`);

    let uploadAttempt = 0;
    let uploadResult = null;
    const maxRetries = 2;

    while (uploadAttempt <= maxRetries) {
      try {
        uploadAttempt++;
        debug.log(`Upload attempt ${uploadAttempt}/${maxRetries + 1}`);

        const command = new PutObjectCommand({
          Bucket: S3_BUCKET_NAME,
          Key: fileName,
          Body: buffer,
          ContentType: file.type,
          // Optional metadata if needed
          Metadata: {
            "x-ticket-id": ticketId,
            "x-user-id": userId,
          },
        });

        const response = await s3Client.send(command);

        uploadResult = response;
        debug.info("Upload successful!", response);
        break;
      } catch (retryError) {
        debug.warn(`Attempt ${uploadAttempt} failed:`, retryError);

        if (uploadAttempt > maxRetries) {
          throw retryError;
        }

        // Wait before next retry (exponential backoff)
        await new Promise((r) => setTimeout(r, 1000 * uploadAttempt));
      }
    }

    if (!uploadResult) {
      throw new Error("All upload attempts failed");
    }

    // Step 6: Generate a pre-signed URL (valid for 7 days)
    debug.log("Generating pre-signed URL...");
    const getObjectCommand = new GetObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: fileName,
    });

    const signedUrl = await getSignedUrl(s3Client, getObjectCommand, {
      expiresIn: 604800,
    }); // 7 days
    debug.log(`Signed URL generated with 7-day expiration`);

    // Step 7: Create database record
    debug.log("Creating database record...");
    const attachment = await prisma.fileAttachment.create({
      data: {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        fileUrl: signedUrl,
        ticketId,
        userId,
      },
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
    });

    debug.info("Record created successfully!", attachment.id);

    return {
      success: true,
      attachment,
    };
  } catch (error) {
    debug.error("Error during upload:", error);

    const errorDetails = {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
    };

    return {
      success: false,
      error: errorDetails.message,
      details: errorDetails,
    };
  }
};

/**
 * Get ticket attachments with access control
 */
export const getTicketAttachments = async (
  ticketId: string,
  userId: string,
  isAdmin: boolean
) => {
  try {
    debug.log(
      `Fetching attachments for ticket: ${ticketId}, user: ${userId}, isAdmin: ${isAdmin}`
    );

    // Check if ticket exists and user has permission
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      select: { id: true, userId: true },
    });

    if (!ticket) {
      debug.warn(`Ticket not found: ${ticketId}`);
      return {
        success: false,
        error: "Ticket not found",
      };
    }

    // Check permission - only ticket creator or admin can see attachments
    if (!isAdmin && ticket.userId !== userId) {
      debug.warn(
        `Access denied for user: ${userId}, ticketUserId: ${ticket.userId}`
      );
      return {
        success: false,
        error: "You don't have permission to view these attachments",
      };
    }

    // Get attachments from database
    const attachments = await prisma.fileAttachment.findMany({
      where: { ticketId },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { username: true },
        },
      },
    });

    // Generate fresh signed URLs for each attachment if needed
    const refreshedAttachments = await Promise.all(
      attachments.map(async (attachment) => {
        // Check if URL is expired or missing (implementation may vary)
        const needsRefresh = isUrlExpired(attachment.fileUrl);

        if (needsRefresh) {
          try {
            // Extract the key from fileUrl or use a separate field in your DB schema
            const key = extractKeyFromUrl(attachment.fileUrl);

            if (!key) {
              throw new Error("Could not extract key from URL");
            }
            // Generate fresh URL
            const command = new GetObjectCommand({
              Bucket: S3_BUCKET_NAME,
              Key: key,
            });

            const signedUrl = await getSignedUrl(s3Client, command, {
              expiresIn: 604800,
            });

            // Update the attachment record
            await prisma.fileAttachment.update({
              where: { id: attachment.id },
              data: { fileUrl: signedUrl },
            });

            return {
              ...attachment,
              fileUrl: signedUrl,
            };
          } catch (error) {
            debug.error(
              `Error refreshing URL for attachment ${attachment.id}:`,
              error
            );
            return attachment; // Return original if refresh fails
          }
        }

        return attachment;
      })
    );

    debug.info(
      `${refreshedAttachments.length} attachments found for ticket ${ticketId}`
    );

    return {
      success: true,
      attachments: refreshedAttachments,
    };
  } catch (error) {
    debug.error("Error fetching attachments:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      details: error,
    };
  }
};

/**
 * Delete an attachment with permission verification
 */
export const deleteTicketAttachment = async (
  attachmentId: string,
  userId: string,
  isAdmin: boolean
) => {
  try {
    debug.log(
      `Attempting to delete attachment: ${attachmentId}, user: ${userId}, isAdmin: ${isAdmin}`
    );

    // Get the attachment with ticket info
    const attachment = await prisma.fileAttachment.findUnique({
      where: { id: attachmentId },
      include: {
        ticket: {
          select: { userId: true },
        },
      },
    });

    if (!attachment) {
      debug.warn(`Attachment not found: ${attachmentId}`);
      return {
        success: false,
        error: "Attachment not found",
      };
    }

    // Check permission - only attachment creator, ticket owner, or admin can delete
    if (
      !isAdmin &&
      attachment.userId !== userId &&
      attachment.ticket.userId !== userId
    ) {
      debug.warn(`Permission denied for user: ${userId}`);
      return {
        success: false,
        error: "You don't have permission to delete this attachment",
      };
    }

    // Extract key from URL
    const key = extractKeyFromUrl(attachment.fileUrl);

    if (!key) {
      debug.warn(`Couldn't extract file key from URL: ${attachment.fileUrl}`);
      return {
        success: false,
        error: "Invalid URL format",
      };
    }

    debug.log(`Deleting file from S3: ${key}`);

    // Delete file from S3
    try {
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: S3_BUCKET_NAME,
          Key: key,
        })
      );
    } catch (s3Error) {
      debug.warn(
        `Error deleting file from S3: ${
          s3Error instanceof Error ? s3Error.message : "Unknown error"
        }`
      );
      // Continue even with error - file might not exist
    }

    // Delete database record
    debug.log(`Deleting database record: ${attachmentId}`);
    await prisma.fileAttachment.delete({
      where: { id: attachmentId },
    });

    debug.info(`Attachment ${attachmentId} deleted successfully`);

    return {
      success: true,
      message: "Attachment deleted successfully",
    };
  } catch (error) {
    debug.error("Error deleting attachment:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      details: error,
    };
  }
};

/**
 * Utility: Check if a URL is likely expired
 */
const isUrlExpired = (url: string): boolean => {
  // If URL contains AWS signature parameters
  if (!url.includes("X-Amz-Date") || !url.includes("X-Amz-Expires")) {
    return true; // Not a valid signed URL or format changed
  }

  try {
    // Extract expiration from URL
    const urlObj = new URL(url);
    const dateParam = urlObj.searchParams.get("X-Amz-Date");
    const expiresParam = urlObj.searchParams.get("X-Amz-Expires");

    if (!dateParam || !expiresParam) return true;

    // Parse date and expiration
    const dateValue = dateParam.substring(0, 8); // Format: YYYYMMDD
    const year = parseInt(dateValue.substring(0, 4));
    const month = parseInt(dateValue.substring(4, 6)) - 1; // JS months are 0-indexed
    const day = parseInt(dateValue.substring(6, 8));

    const signedDate = new Date(Date.UTC(year, month, day));
    const expiresSeconds = parseInt(expiresParam);

    const expirationDate = new Date(
      signedDate.getTime() + expiresSeconds * 1000
    );
    const now = new Date();

    return now > expirationDate;
  } catch (e) {
    debug.warn("Error checking URL expiration:", e);
    return true; // Assume expired on error
  }
};

/**
 * Utility: Extract file key from a signed URL
 */
const extractKeyFromUrl = (url: string): string | null => {
  try {
    // For pre-signed URLs, extract the path portion
    const urlObj = new URL(url);
    let path = urlObj.pathname;

    // Remove leading slash and domain parts
    if (path.startsWith("/")) {
      path = path.substring(1);
    }

    // If path contains bucket name, remove it
    if (path.startsWith(S3_BUCKET_NAME + "/")) {
      path = path.substring(S3_BUCKET_NAME.length + 1);
    }

    return decodeURIComponent(path);
  } catch (e) {
    debug.warn("Error extracting key from URL:", e);
    return null;
  }
};

// Export default configuration values for use in other parts of the application
export const S3_CONFIG = {
  BUCKET_NAME: S3_BUCKET_NAME,
  REGION: S3_REGION,
  TICKET_ATTACHMENTS_PREFIX,
};
