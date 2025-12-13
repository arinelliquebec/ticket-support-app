"use client";

import { LucideLoaderCircle, LucideTrash } from "lucide-react";
import { useState } from "react";
import { useConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { deleteComment } from "../actions/delete-comment";

type CommentDeleteButtonProps = {
  id: string;
  onDeleteComment?: (id: string) => void;
};

const CommentDeleteButton = ({
  id,
  onDeleteComment,
}: CommentDeleteButtonProps) => {
  const [isPending, setIsPending] = useState(false);

  // Fix: Properly integrate with useConfirmDialog
  const [deleteButton, deleteDialog] = useConfirmDialog({
    title: "Delete Comment",
    description:
      "Are you sure you want to delete this comment? This action cannot be undone.",
    action: async () => {
      setIsPending(true);
      try {
        const result = await deleteComment(id);
        if (result.status === "SUCCESS") {
          onDeleteComment?.(id);
        }
        return result;
      } finally {
        setIsPending(false);
      }
    },
    trigger: (
      <Button variant="outline" size="icon" disabled={isPending}>
        {isPending ? (
          <LucideLoaderCircle className="w-4 h-4 animate-spin" />
        ) : (
          <LucideTrash className="w-4 h-4" />
        )}
      </Button>
    ),
  });

  return (
    <>
      {deleteDialog}
      {deleteButton}
    </>
  );
};

export { CommentDeleteButton };
