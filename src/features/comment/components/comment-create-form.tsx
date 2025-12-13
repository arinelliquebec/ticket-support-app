"use client";

import { useActionState } from "react";
import { FieldError } from "@/components/form/field-error";
import { Form } from "@/components/form/form";
import { SubmitButton } from "@/components/form/submit-button";
import {
  ActionState,
  EMPTY_ACTION_STATE,
} from "@/components/form/utils/to-action-state";
import { Textarea } from "@/components/ui/textarea";
import { createComment } from "../actions/create-comment";
import { CommentWithMetadata } from "../types";

type CommentCreateFormProps = {
  ticketId: string;
  onCreateComment?: (comment: CommentWithMetadata | undefined) => void;
};

// Define a proper interface that extends ActionState
interface CommentActionState extends ActionState {
  data: CommentWithMetadata | undefined;
}

const CommentCreateForm = ({
  ticketId,
  onCreateComment,
}: CommentCreateFormProps) => {
  const [actionState, action] = useActionState(
    createComment.bind(null, ticketId),
    EMPTY_ACTION_STATE
  );

  const handleSuccess = (actionState: ActionState) => {
    // Safely cast to our extended type and access the data property
    const commentState = actionState as CommentActionState;
    if (commentState.data) {
      onCreateComment?.(commentState.data);
    }
  };

  return (
    <Form action={action} actionState={actionState} onSuccess={handleSuccess}>
      <Textarea
        name="content"
        placeholder="O que mais gostaria de adicionar?"
      />
      <FieldError actionState={actionState} name="content" />

      <SubmitButton label="Comentar" />
    </Form>
  );
};

export { CommentCreateForm };
