// src/app/api/tickets/[ticketId]/attachments/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/features/auth/queries/get-auth";
import { prisma } from "@/lib/prisma";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Config
const S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || "";
const S3_REGION = process.env.AWS_S3_REGION || "us-east-1";
const ATTACHMENT_PREFIX = "ticket-attachments/";

// Initialize S3 client
const s3Client = new S3Client({
  region: S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

/**
 * GET /api/tickets/[ticketId]/attachments
 * Fetch all attachments for a ticket
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    // Authenticate user
    const { user } = await getAuth();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { ticketId } = await params;

    // Get the ticket to check permissions
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      select: { id: true, userId: true },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    // Check if user has permission (admin or ticket owner)
    const isAdmin = user.role === "ADMIN";
    if (!isAdmin && ticket.userId !== user.id) {
      return NextResponse.json(
        { error: "You don't have permission to view these attachments" },
        { status: 403 }
      );
    }

    // Fetch attachments
    const attachments = await prisma.fileAttachment.findMany({
      where: { ticketId },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { username: true },
        },
      },
    });

    return NextResponse.json(attachments);
  } catch (error) {
    console.error("Error fetching attachments:", error);
    return NextResponse.json(
      { error: "Failed to fetch attachments" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tickets/[ticketId]/attachments
 * Upload a new attachment for a ticket
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    // Authenticate user
    const { user } = await getAuth();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { ticketId } = await params;

    // Get the ticket to check permissions
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    // Check if user has permission (admin or ticket owner)
    const isAdmin = user.role === "ADMIN";
    if (!isAdmin && ticket.userId !== user.id) {
      return NextResponse.json(
        {
          error:
            "You don't have permission to upload attachments to this ticket",
        },
        { status: 403 }
      );
    }

    // Parse the form data
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Arquivo ultrapassa os 10MB" },
        { status: 400 }
      );
    }

    // Generate unique filename
    const fileExtension = file.name.split(".").pop() || "";
    const fileName = `${ATTACHMENT_PREFIX}ticket_${ticketId}_${Date.now()}_${Math.floor(
      Math.random() * 10000
    )}.${fileExtension}`;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Upload to S3
    await s3Client.send(
      new PutObjectCommand({
        Bucket: S3_BUCKET_NAME,
        Key: fileName,
        Body: buffer,
        ContentType: file.type,
        Metadata: {
          "x-ticket-id": ticketId,
          "x-user-id": user.id,
        },
      })
    );

    // Generate a pre-signed URL (valid for 7 days)
    const getObjectCommand = new GetObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: fileName,
    });

    const signedUrl = await getSignedUrl(s3Client, getObjectCommand, {
      expiresIn: 604800, // 7 days
    });

    // Create database record
    const attachment = await prisma.fileAttachment.create({
      data: {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        fileUrl: signedUrl,
        s3ObjectKey: fileName, // Store the S3 object key for future reference
        ticketId,
        userId: user.id,
      },
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, attachment });
  } catch (error) {
    console.error("Erro ao enviar arquivo:", error);
    return NextResponse.json(
      {
        error: "Falha ao enviar anexo",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/tickets/[ticketId]/attachments?id=[attachmentId]
 * Delete an attachment
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    // Authenticate user
    const { user } = await getAuth();
    if (!user) {
      return NextResponse.json({ error: "Sem autorização" }, { status: 401 });
    }

    const { ticketId } = await params;
    const { searchParams } = request.nextUrl;
    const attachmentId = searchParams.get("id");

    if (!attachmentId) {
      return NextResponse.json(
        { error: "ID de anexo desconhecido" },
        { status: 400 }
      );
    }

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
      return NextResponse.json(
        { error: "Anexo não encontrado" },
        { status: 404 }
      );
    }

    // Check if ticket matches
    if (attachment.ticketId !== ticketId) {
      return NextResponse.json(
        { error: "Anexo não pertence à este ticket" },
        { status: 400 }
      );
    }

    // Check permission - only attachment creator, ticket owner, or admin can delete
    const isAdmin = user.role === "ADMIN";
    if (
      !isAdmin &&
      attachment.userId !== user.id &&
      attachment.ticket.userId !== user.id
    ) {
      return NextResponse.json(
        { error: "Você não tem permissão para deletar este arquivo" },
        { status: 403 }
      );
    }

    // Delete file from S3 if object key exists
    if (attachment.s3ObjectKey) {
      try {
        await s3Client.send(
          new DeleteObjectCommand({
            Bucket: S3_BUCKET_NAME,
            Key: attachment.s3ObjectKey,
          })
        );
      } catch (s3Error) {
        console.warn("Erro ao deletar arquivo do S3:", s3Error);
        // Continue even if S3 deletion fails
      }
    }

    // Delete database record
    await prisma.fileAttachment.delete({
      where: { id: attachmentId },
    });

    return NextResponse.json({
      success: true,
      message: "Anexo deletado com sucesso",
    });
  } catch (error) {
    console.error("Erro ao deletar anexo:", error);
    return NextResponse.json(
      { error: "Falha ao deletar anexo" },
      { status: 500 }
    );
  }
}
