import { NextResponse } from "next/server";
import { eventBus } from "@/lib/realtime/event-bus";
import { getAuth } from "@/features/auth/queries/get-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const { user } = await getAuth();

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[Test] ========== TESTE DE NOTIFICAÇÃO ==========");
    console.log("[Test] Broadcasting test event...");
    console.log("[Test] EventBus listeners:", eventBus.getListenerCount());

    // Broadcast test event
    eventBus.broadcast({
      type: "ticket:created",
      adminOnly: true,
      data: {
        ticketId: "test-123",
        ticket: {
          id: "test-123",
          title: "TESTE DE NOTIFICAÇÃO PUSH",
          priority: "ALTA",
          status: "ABERTO",
          createdAt: new Date(),
          user: {
            username: "Sistema de Teste",
          },
        },
      },
      timestamp: Date.now(),
    });

    console.log("[Test] Test event broadcasted!");
    console.log("[Test] =======================================");

    return NextResponse.json({
      success: true,
      message: "Test notification sent! Check your browser console.",
      listeners: eventBus.getListenerCount(),
    });
  } catch (error) {
    console.error("[Test] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
