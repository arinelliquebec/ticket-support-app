// scripts/check-s3-config.js
const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
require("dotenv").config();

// Config
const S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || "";
const S3_REGION = process.env.AWS_S3_REGION || "us-east-1";
const AVATAR_PREFIX = "avatars/";

// ANSI color codes for prettier console output
const colors = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
};

// Helper for console messages
const log = {
  info: (msg) => console.log(`${colors.blue}INFO:${colors.reset} ${msg}`),
  success: (msg) =>
    console.log(`${colors.green}SUCCESS:${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}WARNING:${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}ERROR:${colors.reset} ${msg}`),
  title: (msg) =>
    console.log(`\n${colors.bold}${colors.cyan}${msg}${colors.reset}\n`),
};

// Initialize S3 client
const s3Client = new S3Client({
  region: S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

async function checkS3Connectivity() {
  log.title("CHECKING AWS S3 CONFIGURATION");

  try {
    // Check if AWS credentials are set
    log.info("Checking AWS credentials...");
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      log.error("AWS credentials not found in environment variables.");
      log.info("Make sure you have the following in your .env file:");
      log.info("AWS_ACCESS_KEY_ID=your_access_key");
      log.info("AWS_SECRET_ACCESS_KEY=your_secret_key");
      process.exit(1);
    }
    log.success("AWS credentials found");

    // Check if bucket name is set
    log.info("Checking bucket name...");
    if (!S3_BUCKET_NAME) {
      log.error("AWS_S3_BUCKET_NAME not found in environment variables.");
      log.info("Make sure you have the following in your .env file:");
      log.info("AWS_S3_BUCKET_NAME=your_bucket_name");
      process.exit(1);
    }
    log.success(`Using bucket: ${S3_BUCKET_NAME}`);

    // Test S3 connection
    log.info("Testing S3 connection...");
    try {
      const testKey = `${AVATAR_PREFIX}connection-test-${Date.now()}.txt`;

      // Attempt to upload a test file
      log.info("Uploading test file...");
      await s3Client.send(
        new PutObjectCommand({
          Bucket: S3_BUCKET_NAME,
          Key: testKey,
          Body: "Connection test",
          ContentType: "text/plain",
        })
      );
      log.success("Test file uploaded successfully");

      // Try to generate a URL
      log.info("Generating test URL...");
      const testUrl = `https://${S3_BUCKET_NAME}.s3.${S3_REGION}.amazonaws.com/${testKey}`;
      log.success(`Test URL: ${testUrl}`);

      // Attempt public permissions
      log.info("Testing public access permissions...");
      await s3Client.send(
        new PutObjectCommand({
          Bucket: S3_BUCKET_NAME,
          Key: `${testKey}-public`,
          Body: "Public test",
          ContentType: "text/plain",
          ACL: "public-read", // This tests if public-read ACL is allowed
        })
      );
      log.success("Public access test successful");

      // Clean up test files
      log.info("Cleaning up test files...");
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: S3_BUCKET_NAME,
          Key: testKey,
        })
      );
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: S3_BUCKET_NAME,
          Key: `${testKey}-public`,
        })
      );
      log.success("Test files cleaned up");

      log.title("S3 CONFIGURATION CHECK SUCCESSFUL");
      log.success(
        "Your S3 bucket appears to be correctly configured for avatar uploads."
      );
    } catch (error) {
      log.error(`S3 test failed: ${error.message}`);

      // Provide more detailed error diagnosis
      if (error.name === "AccessDenied") {
        log.warn("This appears to be a permissions issue. Check that:");
        log.info("1. Your AWS credentials have the correct permissions");
        log.info(
          "2. The bucket allows the operations you're trying to perform"
        );
        log.info(
          "3. If using public-read ACL, ensure the bucket policy allows this"
        );
      } else if (error.name === "NoSuchBucket") {
        log.warn(`The bucket '${S3_BUCKET_NAME}' does not exist.`);
        log.info("Run the setup-s3.js script to create the bucket first.");
      }

      process.exit(1);
    }
  } catch (error) {
    log.error(`Unhandled error: ${error.message}`);
    process.exit(1);
  }
}

checkS3Connectivity();
