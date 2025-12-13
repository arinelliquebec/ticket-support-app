// scripts/setup-s3-buckets.js
const {
  S3Client,
  CreateBucketCommand,
  PutObjectCommand,
  ListBucketsCommand,
  HeadBucketCommand,
  PutBucketCorsCommand,
  PutBucketPolicyCommand,
  PutPublicAccessBlockCommand,
} = require("@aws-sdk/client-s3");
require("dotenv").config();

// Configure the AWS S3 client
const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Bucket name
const S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

// Folders to create in the bucket
const folders = ["ticket-attachments/", "avatars/"];

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

// Check if AWS credentials are configured
async function checkCredentials() {
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    log.error("AWS credentials not found in environment variables.");
    log.info("Make sure you have the following in your .env file:");
    log.info("AWS_ACCESS_KEY_ID=your_access_key");
    log.info("AWS_SECRET_ACCESS_KEY=your_secret_key");
    log.info("AWS_S3_REGION=your_region (optional, defaults to us-east-1)");
    log.info("AWS_S3_BUCKET_NAME=your_bucket_name");
    process.exit(1);
  }

  if (!S3_BUCKET_NAME) {
    log.error("AWS_S3_BUCKET_NAME not found in environment variables.");
    process.exit(1);
  }

  try {
    log.info("Testing AWS credentials...");
    const data = await s3Client.send(new ListBucketsCommand({}));
    log.success("AWS credentials are valid!");
    log.info(`Found ${data.Buckets.length} existing buckets in your account`);
    return true;
  } catch (err) {
    log.error(`AWS credentials test failed: ${err.message}`);
    process.exit(1);
  }
}

// Check if bucket exists
async function checkBucket() {
  try {
    log.info(`Checking if bucket "${S3_BUCKET_NAME}" exists...`);
    await s3Client.send(new HeadBucketCommand({ Bucket: S3_BUCKET_NAME }));
    log.success(`Bucket "${S3_BUCKET_NAME}" already exists!`);
    return true;
  } catch (err) {
    if (err.name === "NotFound") {
      log.info(`Bucket "${S3_BUCKET_NAME}" does not exist. Will create it.`);
      return false;
    }
    log.error(`Error checking bucket: ${err.message}`);
    return false;
  }
}

// Create bucket if it doesn't exist
async function createBucket() {
  try {
    const bucketExists = await checkBucket();
    if (bucketExists) return true;

    log.info(`Creating bucket "${S3_BUCKET_NAME}"...`);

    // For regions other than us-east-1, we need to specify the location constraint
    const region = process.env.AWS_S3_REGION || "us-east-1";
    const createBucketParams = {
      Bucket: S3_BUCKET_NAME,
    };

    if (region !== "us-east-1") {
      createBucketParams.CreateBucketConfiguration = {
        LocationConstraint: region,
      };
    }

    await s3Client.send(new CreateBucketCommand(createBucketParams));

    log.success(`Bucket "${S3_BUCKET_NAME}" created successfully!`);
    return true;
  } catch (err) {
    log.error(`Failed to create bucket: ${err.message}`);
    return false;
  }
}

// Configure bucket for public access to avatars
async function configureBucketForPublicAccess() {
  try {
    log.info(`Configuring bucket "${S3_BUCKET_NAME}" for public access...`);

    // Step 1: Update the bucket's block public access settings
    // We need to allow public access for the avatars folder
    await s3Client.send(
      new PutPublicAccessBlockCommand({
        Bucket: S3_BUCKET_NAME,
        PublicAccessBlockConfiguration: {
          BlockPublicAcls: false,
          IgnorePublicAcls: false,
          BlockPublicPolicy: false,
          RestrictPublicBuckets: false,
        },
      })
    );

    log.success("Public access block configuration updated");

    // Step 2: Set up a bucket policy to allow public read access to the avatars folder
    const bucketPolicy = {
      Version: "2012-10-17",
      Statement: [
        {
          Sid: "PublicReadForAvatars",
          Effect: "Allow",
          Principal: "*",
          Action: ["s3:GetObject"],
          Resource: [`arn:aws:s3:::${S3_BUCKET_NAME}/avatars/*`],
        },
      ],
    };

    await s3Client.send(
      new PutBucketPolicyCommand({
        Bucket: S3_BUCKET_NAME,
        Policy: JSON.stringify(bucketPolicy),
      })
    );

    log.success("Bucket policy updated to allow public read access to avatars");

    // Step 3: Set up CORS rules
    const corsRules = {
      CORSRules: [
        {
          AllowedHeaders: ["*"],
          AllowedMethods: ["GET", "PUT", "POST", "DELETE", "HEAD"],
          AllowedOrigins: ["*"], // In production, replace with your domain
          ExposeHeaders: ["ETag"],
          MaxAgeSeconds: 3000,
        },
      ],
    };

    await s3Client.send(
      new PutBucketCorsCommand({
        Bucket: S3_BUCKET_NAME,
        CORSConfiguration: corsRules,
      })
    );

    log.success("CORS configuration updated");

    return true;
  } catch (err) {
    log.error(`Failed to configure bucket for public access: ${err.message}`);
    console.error(err);
    return false;
  }
}

// Create folders in the bucket
async function createFolders() {
  log.info(`Creating folders in bucket "${S3_BUCKET_NAME}"...`);

  for (const folder of folders) {
    try {
      log.info(`Creating folder "${folder}"...`);

      // In S3, folders are actually zero-byte objects with a trailing slash
      const isAvatarFolder = folder === "avatars/";

      await s3Client.send(
        new PutObjectCommand({
          Bucket: S3_BUCKET_NAME,
          Key: folder,
          Body: "",
          // Make avatars publicly readable by default
          ACL: isAvatarFolder ? "public-read" : "private",
        })
      );

      log.success(`Folder "${folder}" created successfully!`);

      // For the avatars folder, create a test file to verify permissions
      if (isAvatarFolder) {
        const testFile = "avatars/test-avatar.txt";
        await s3Client.send(
          new PutObjectCommand({
            Bucket: S3_BUCKET_NAME,
            Key: testFile,
            Body: "This is a test file to verify public read permissions",
            ContentType: "text/plain",
            ACL: "public-read",
          })
        );

        log.info(`Created test file: ${testFile}`);
        log.info(
          `You can verify public access at: https://${S3_BUCKET_NAME}.s3.${
            process.env.AWS_S3_REGION || "us-east-1"
          }.amazonaws.com/${testFile}`
        );
      }
    } catch (err) {
      log.error(`Failed to create folder "${folder}": ${err.message}`);
    }
  }
}

// Setup the S3 bucket and folders
async function setupS3() {
  log.title("SETTING UP AWS S3 BUCKET");

  // Check AWS credentials
  await checkCredentials();

  // Create bucket
  const bucketCreated = await createBucket();
  if (!bucketCreated) {
    log.error("Failed to setup bucket. Exiting.");
    process.exit(1);
  }

  // Configure bucket for public access
  await configureBucketForPublicAccess();

  // Create folders
  await createFolders();

  log.title("S3 SETUP COMPLETE!");
  log.info("Your S3 bucket is now ready with the following structure:");
  log.info(`Bucket: ${S3_BUCKET_NAME}`);
  log.info("Folders:");
  folders.forEach((folder) => {
    if (folder === "avatars/") {
      log.info(`  - ${folder} (public-read access)`);
    } else {
      log.info(`  - ${folder} (private access)`);
    }
  });

  log.info("\nYou can now use the following paths in your application:");
  log.info(`For ticket attachments: ${S3_BUCKET_NAME}/ticket-attachments/`);
  log.info(`For user avatars: ${S3_BUCKET_NAME}/avatars/`);

  log.title("NEXT STEPS");
  log.info("1. Test public access to your avatars folder");
  log.info(
    "2. Make sure your IAM user has the necessary permissions for the bucket"
  );
  log.info(
    "3. Update your .env file with the correct AWS credentials and bucket name"
  );
  log.info("4. Restart your application");
}

// Run the setup
setupS3().catch((err) => {
  log.error(`Unhandled error: ${err.message}`);
  process.exit(1);
});
