"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  ActionState,
  fromErrorToActionState,
} from "@/components/form/utils/to-action-state";
import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-redirect";
import { prisma } from "@/lib/prisma";
import { ticketPath } from "@/paths";
import { CommentWithMetadata } from "../types";
import { eventBus } from "@/lib/realtime/event-bus";

const createCommentSchema = z.object({
  content: z.string().min(1).max(1024),
});

export const createComment = async (
  ticketId: string,
  _actionState: ActionState,
  formData: FormData
) => {
  const { user } = await getAuthOrRedirect();

  if (!user) {
    return {
      success: false,
      data: undefined,
      status: "ERROR",
      message: "User not authenticated",
      fieldErrors: {},
      timestamp: Date.now(),
    } satisfies ActionState;
  }

  let comment;

  try {
    const data = createCommentSchema.parse(Object.fromEntries(formData));

    // Corrigido de prisma.comments para prisma.comment
    comment = await prisma.comment.create({
      data: {
        userId: user.id,
        ticketId: ticketId,
        ...data,
      },
      include: {
        user: true,
      },
    });
  } catch (error) {
    return fromErrorToActionState(error);
  }

  // Get ticket to find the owner
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    select: { userId: true },
  });

  // ===== REAL-TIME NOTIFICATION TO TICKET OWNER =====
  // Only notify the SPECIFIC owner of THIS ticket
  // userId: ticket.userId ensures ONLY the ticket owner gets the notification
  // This prevents users from seeing comments on other people's tickets
  if (ticket?.userId && ticket.userId !== user.id) {
    eventBus.broadcast({
      type: "comment:created",
      userId: ticket.userId, // 🔒 CRITICAL: Target ONLY the ticket owner
      data: {
        ticketId,
        commentId: comment.id,
        comment: {
          content: comment.content,
          user: {
            username: comment.user.username,
          },
          createdAt: comment.createdAt,
        },
      },
      timestamp: Date.now(),
    });
  }

  // ===== REAL-TIME NOTIFICATION TO ADMINS =====
  // Separate notification for admins to track all comment activity
  // adminOnly: true ensures only admins receive this
  eventBus.broadcast({
    type: "comment:created",
    adminOnly: true, // 🔒 Only admins see this notification
    data: {
      ticketId,
      commentId: comment.id,
      comment: {
        content: comment.content,
        user: {
          username: comment.user.username,
        },
        createdAt: comment.createdAt,
      },
    },
    timestamp: Date.now(),
  });

  revalidatePath(ticketPath(ticketId));

  // Create a custom ActionState object with additional data
  const actionState: ActionState & { data?: CommentWithMetadata } = {
    success: true,
    data: {
      ...comment,
      isOwner: true,
    },
    status: "SUCCESS",
    message: "Comment created",
    fieldErrors: {},
    timestamp: Date.now(),
  };

  return actionState;
};
