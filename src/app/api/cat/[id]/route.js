// Using plain JavaScript to avoid TypeScript issues
export async function GET(request, { params }) {
  return Response.json({ id: params.id });
}

export async function PATCH(request, { params }) {
  return Response.json({ id: params.id, updated: true });
}

export async function DELETE(request, { params }) {
  return Response.json({ id: params.id, deleted: true });
}
