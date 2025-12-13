// app/api/upload/route.ts
import { s3Client } from "@/lib/aws";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = request.body;
    if (!body) {
      return NextResponse.json(
        { success: false, error: "No body provided" },
        { status: 400 }
      );
    }

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: "example-key",
      Body: body,
    });

    const response = await s3Client.send(command);
    return NextResponse.json({ success: true, response });
  } catch (error) {
    console.error("S3 Upload Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to upload to S3",
      },
      { status: 500 }
    );
  }
}
