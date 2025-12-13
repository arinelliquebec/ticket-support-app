// scripts/check-aws-config.ts
import { S3Client, ListBucketsCommand } from "@aws-sdk/client-s3";

async function checkS3Connection() {
  try {
    const client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
      },
    });

    const command = new ListBucketsCommand({});
    const response = await client.send(command);

    console.log("S3 Connection Successful");
    console.log(
      "Buckets:",
      response.Buckets?.map((bucket) => bucket.Name)
    );
  } catch (error) {
    console.error("S3 Connection Failed:", error);
  }
}

checkS3Connection();
