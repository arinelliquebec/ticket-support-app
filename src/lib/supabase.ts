// Simple JavaScript version - save as setup-supabase.js
require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

// Buckets
const TICKET_BUCKET = "ticket-attachments";
const AVATAR_BUCKET = "avatars";

// Console colors
const c = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  blue: "\x1b[34m",
  bold: "\x1b[1m",
};

// Log functions
const log = {
  info: (msg: any) => console.log(`${c.blue}INFO:${c.reset} ${msg}`),
  success: (msg: any) => console.log(`${c.green}SUCCESS:${c.reset} ${msg}`),
  error: (msg: any) => console.log(`${c.red}ERROR:${c.reset} ${msg}`),
  step: (msg: any) => console.log(`\n${c.bold}${msg}${c.reset}`),
};

export const supabase = setupSupabase();
export const TICKET_ATTACHMENTS_BUCKET = "ticket-attachments";

// Main function
async function setupSupabase() {
  log.step("SUPABASE SETUP");

  // 1. Check environment variables
  log.info("Checking environment variables...");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    log.error("Environment variables not found.");
    console.log(`
Create a .env file in the project root with:

NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
`);
    return;
  }

  // 2. Create Supabase client
  log.info("Connecting to Supabase using URL: " + url);
  const supabase = createClient(url, key);

  // 3. Check connection
  try {
    const { data, error } = await supabase.storage.listBuckets();
    if (error) throw new Error(error.message);
    log.success(`Connection established! Buckets found: ${data.length}`);
    if (data.length > 0) {
      log.info(
        "Existing buckets: " + data.map((b: { name: any }) => b.name).join(", ")
      );
    }
  } catch (err: any) {
    log.error(`Connection failed: ${err.message}`);
    return;
  }

  // 4. Create buckets
  await createBucket(supabase, TICKET_BUCKET, false);
  await createBucket(supabase, AVATAR_BUCKET, true);

  // 5. Final instructions
  printInstructions();
}

// Create a bucket
async function createBucket(
  supabase: { storage: any },
  name: string,
  isPublic: boolean
) {
  log.info(`Setting up bucket "${name}"...`);

  try {
    // Check if bucket already exists
    const { data: buckets, error: listError } =
      await supabase.storage.listBuckets();

    if (listError) throw new Error(listError.message);

    const exists = buckets.some((b: { name: string }) => b.name === name);

    if (exists) {
      log.info(`Bucket "${name}" already exists.`);
    } else {
      // Create the bucket
      const { error } = await supabase.storage.createBucket(name, {
        public: isPublic,
      });

      if (error) throw new Error(error.message);
      log.success(`Bucket "${name}" created successfully!`);

      // Test upload
      await testUpload(supabase, name);
    }
  } catch (err: any) {
    log.error(`Error setting up bucket "${name}": ${err.message}`);
  }
}

// Test upload to a bucket
async function testUpload(
  supabase: {
    storage: {
      from: (arg0: any) => {
        (): any;
        new (): any;
        upload: {
          (
            arg0: string,
            arg1: Buffer<ArrayBuffer>,
            arg2: { contentType: string }
          ): PromiseLike<{ error: any }> | { error: any };
          new (): any;
        };
        remove: { (arg0: string[]): any; new (): any };
      };
    };
  },
  bucket: any
) {
  log.info(`Testing upload to "${bucket}"...`);

  try {
    const testFile = "Test file";
    const fileName = `test-${Date.now()}.txt`;

    // Upload
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, Buffer.from(testFile), {
        contentType: "text/plain",
      });

    if (uploadError) throw new Error(uploadError.message);

    log.success("Test upload successful!");

    // Remove test file
    await supabase.storage.from(bucket).remove([fileName]);

    log.info("Test file removed.");
  } catch (err: any) {
    log.error(`Test upload failed: ${err.message}`);
  }
}

// Display final instructions
function printInstructions() {
  console.log(`
${c.bold}${c.green}BASIC SETUP COMPLETE!${c.reset}

${c.bold}NEXT STEPS:${c.reset}

1. You ${c.bold}MUST${c.reset} configure access policies in the Supabase dashboard:
   Go to: ${c.blue}https://app.supabase.com${c.reset} → Storage → Buckets → Policies

   ${c.bold}For the "${TICKET_BUCKET}" bucket:${c.reset}
   - Add policy for INSERT with role 'authenticated'
   - Add policy for SELECT with role 'authenticated'
   - Add policy for DELETE with role 'authenticated'

   ${c.bold}For the "${AVATAR_BUCKET}" bucket:${c.reset}
   - Add policy for INSERT with role 'authenticated'
   - Add policy for SELECT with role 'anon' (to allow public reading)

2. Restart your Next.js server:
   ${c.green}npm run dev${c.reset}

${c.bold}${c.red}COMMON ISSUES:${c.reset}
- 403 Error: Missing access policy
- 500 Error: Bucket does not exist or server problem
- 400 Error: File type not allowed

Good luck! 🚀
`);
}

// Run script
setupSupabase().catch((err) => {
  log.error(`Unhandled error: ${err.message}`);
});
