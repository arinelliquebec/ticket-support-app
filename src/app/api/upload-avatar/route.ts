// src/app/api/upload-avatar/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/features/auth/queries/get-auth";
import { prisma } from "@/lib/prisma";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

// S3 Configuration
const S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || "";
const S3_REGION = process.env.AWS_S3_REGION || "us-east-1";
const AVATAR_PREFIX = "avatars/";

// Base URL for S3 objects - adjust this according to your S3 bucket region
const S3_BASE_URL = `https://${S3_BUCKET_NAME}.s3.${S3_REGION}.amazonaws.com/`;

// Debug flag to enable detailed logging
const DEBUG = true;

// Simple logger for debugging
const log = {
  info: (...args: any[]) => {
    if (DEBUG) console.log("[AvatarUpload]", ...args);
  },
  error: (...args: any[]) => {
    if (DEBUG) console.error("[AvatarUpload ERROR]", ...args);
  },
};

// Initialize S3 client
const s3Client = new S3Client({
  region: S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

// Test S3 connection and configuration
const checkS3Config = async () => {
  if (
    !process.env.AWS_ACCESS_KEY_ID ||
    !process.env.AWS_SECRET_ACCESS_KEY ||
    !S3_BUCKET_NAME
  ) {
    log.error("AWS credentials or bucket name not properly configured");
    return { success: false, error: "AWS configuration incomplete" };
  }

  try {
    // Try a simple operation to test connection
    const testKey = `${AVATAR_PREFIX}connection-test-${Date.now()}.txt`;
    await s3Client.send(
      new PutObjectCommand({
        Bucket: S3_BUCKET_NAME,
        Key: testKey,
        Body: "Connection test",
        ContentType: "text/plain",
      })
    );

    // Clean up test file
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: S3_BUCKET_NAME,
        Key: testKey,
      })
    );

    return { success: true };
  } catch (error) {
    log.error("S3 connection test failed:", error);
    return {
      success: false,
      error: `S3 connection error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const { user } = await getAuth();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Process form with the image
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Verify file is an image
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 }
      );
    }

    // Limit file size (5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "Image size must be less than 5MB" },
        { status: 400 }
      );
    }

    // Check AWS S3 configuration
    const configCheck = await checkS3Config();
    if (!configCheck.success) {
      return NextResponse.json(
        {
          error: configCheck.error || "Storage service not properly configured",
        },
        { status: 503 }
      );
    }

    // Generate unique filename
    const fileExtension = file.name.split(".").pop() || "jpg";
    const fileName = `${AVATAR_PREFIX}avatar_${
      user.id
    }_${Date.now()}.${fileExtension}`;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Delete previous avatar if exists
    if (user.avatarUrl) {
      try {
        // Try to extract the object key from the URL
        let oldKey = null;

        // Check if the URL contains our S3 bucket URL pattern
        if (user.avatarUrl.includes(S3_BUCKET_NAME)) {
          // Extract just the path part after the bucket URL
          oldKey = user.avatarUrl.split(S3_BUCKET_NAME + ".s3")[1];
          if (oldKey) {
            // Remove any query parameters and the leading slash/domain part
            oldKey = oldKey.split("?")[0].replace(/^[^\/]*\//, "");

            log.info("Attempting to delete old avatar with key:", oldKey);

            await s3Client.send(
              new DeleteObjectCommand({
                Bucket: S3_BUCKET_NAME,
                Key: oldKey,
              })
            );

            log.info("Successfully deleted old avatar");
          }
        }
      } catch (error) {
        log.error("Error removing old avatar:", error);
        // Continue even if we fail to remove old avatar
      }
    }

    // Upload file to S3 with retry logic
    let uploadError = null;
    let uploadResult = null;
    const maxRetries = 2;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        log.info(`Upload attempt ${attempt + 1}/${maxRetries + 1}`);

        // IMPORTANT: Set the ACL to public-read for avatars
        const command = new PutObjectCommand({
          Bucket: S3_BUCKET_NAME,
          Key: fileName,
          Body: buffer,
          ContentType: file.type,
          ACL: "public-read", // Make the object publicly accessible
          Metadata: {
            "x-user-id": user.id,
          },
        });

        const response = await s3Client.send(command);

        uploadResult = response;
        uploadError = null;
        log.info("Upload successful:", response);
        break;
      } catch (error) {
        uploadError = error;
        log.error(`Attempt ${attempt + 1} failed with exception:`, error);

        // If last attempt, break to handle error
        if (attempt === maxRetries) break;

        // Wait before next retry (exponential backoff)
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
      }
    }

    if (uploadError || !uploadResult) {
      log.error("All upload attempts failed:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload avatar after multiple attempts" },
        { status: 500 }
      );
    }

    // Create a direct URL to the uploaded object
    // This works because we set ACL to public-read
    const avatarUrl = `${S3_BASE_URL}${fileName}?v=${Date.now()}`;

    log.info("Generated avatar URL:", avatarUrl);

    // Update user with new avatar URL
    await prisma.user.update({
      where: { id: user.id },
      data: { avatarUrl },
    });

    return NextResponse.json({
      success: true,
      avatarUrl,
    });
  } catch (error) {
    log.error("Error uploading avatar:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to upload avatar",
      },
      { status: 500 }
    );
  }
}
