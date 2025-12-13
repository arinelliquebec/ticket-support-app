import { NextRequest } from "next/server";

// Simple GET handler with minimal typing
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  const { categoryId } = await params;
  return Response.json({ id: categoryId });
}

// Simple PATCH handler with minimal typing
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  const { categoryId } = await params;
  return Response.json({ id: categoryId, updated: true });
}

// Simple DELETE handler with minimal typing
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  const { categoryId } = await params;
  return Response.json({ id: categoryId, deleted: true });
}
