import { NextRequest } from "next/server";
import { getAuth } from "@/features/auth/queries/get-auth";
import { eventBus } from "@/lib/realtime/event-bus";

// Force dynamic rendering for SSE
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  console.log("[SSE] ========== NEW SSE CONNECTION REQUEST ==========");

  try {
    const { user } = await getAuth();
    console.log("[SSE] User authenticated:", user ? user.username : "none");

    if (!user) {
      console.log("[SSE] ❌ Unauthorized - no user");
      return new Response("Unauthorized", { status: 401 });
    }

    console.log(`[SSE] User role: ${user.role}`);

    // Create SSE response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        const connectionId = `${user.id}-${Date.now()}`;
        console.log(
          `[SSE] ✅ New connection: ${connectionId} (${user.username})`
        );

        // Send initial connection message
        const initialMessage = `data: ${JSON.stringify({
          type: "connected",
          connectionId,
          timestamp: Date.now(),
        })}\n\n`;
        controller.enqueue(encoder.encode(initialMessage));
        console.log(`[SSE] Initial message sent to ${connectionId}`);

        // Subscribe to events
        console.log(`[SSE] Calling eventBus.subscribe for ${connectionId}...`);
        const unsubscribe = eventBus.subscribe(connectionId, (event) => {
          // ===== EVENT FILTERING RULES =====
          // 1. Admin-only events: Only for ADMIN role
          if (event.adminOnly && user.role !== "ADMIN") {
            return;
          }

          // 2. User-specific events: Only for the specific user (owner of the ticket)
          //    This ensures users ONLY get notifications about THEIR OWN tickets
          if (event.userId && event.userId !== user.id) {
            return;
          }

          // 3. Determine if event should be sent
          let shouldSend = false;

          if (user.role === "ADMIN") {
            // Admins see all events (except those targeted to specific users)
            shouldSend = !event.userId || event.adminOnly;
          } else {
            // Regular users only see events explicitly targeted to them
            shouldSend = event.userId === user.id;
          }

          if (shouldSend) {
            const message = `data: ${JSON.stringify(event)}\n\n`;
            controller.enqueue(encoder.encode(message));
          }
        });

        // Keep-alive ping every 30 seconds
        const pingInterval = setInterval(() => {
          try {
            const ping = `: ping\n\n`;
            controller.enqueue(encoder.encode(ping));
          } catch (error) {
            console.log(`[SSE] Connection closed: ${connectionId}`);
            clearInterval(pingInterval);
          }
        }, 30000);

        // Cleanup on connection close
        request.signal.addEventListener("abort", () => {
          console.log(`[SSE] Connection aborted: ${connectionId}`);
          clearInterval(pingInterval);
          unsubscribe();
          controller.close();
        });
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no", // Disable buffering in nginx
      },
    });
  } catch (error) {
    console.error("[SSE] Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
