// src/components/confirm-dialog.tsx

import { cloneElement, useActionState, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Form } from "./form/form";
import { SubmitButton } from "./form/submit-button";
import { ActionState, EMPTY_ACTION_STATE } from "./form/utils/to-action-state";

type UseConfirmDialogArgs = {
  title?: string;
  description?: string;
  action: () => Promise<ActionState>;
  trigger: React.ReactElement & {
    props: {
      onSelect?: (e: React.MouseEvent) => void;
      onClick?: (e: React.MouseEvent) => void;
    };
  };
};

const useConfirmDialog = ({
  title = "Are you absolutely sure?",
  description = "This action cannot be undone. Make sure you understand the consequences.",
  action,
  trigger,
}: UseConfirmDialogArgs) => {
  const [isOpen, setIsOpen] = useState(false);

  // Use cloneElement with proper types to avoid TypeScript errors
  const dialogTrigger = cloneElement(trigger, {
    onClick: (e: React.MouseEvent) => {
      // Prevent default if it's a dropdown menu item to stop menu closing
      if (trigger.props.onSelect) {
        trigger.props.onSelect(e);
      }

      setIsOpen((state) => !state);

      // Call the original onClick if it exists
      if (trigger.props.onClick) {
        trigger.props.onClick(e);
      }
    },
  });

  const [actionState, formAction] = useActionState(action, EMPTY_ACTION_STATE);

  const handleSuccess = () => {
    setIsOpen(false);
  };

  const dialog = (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Form
              action={formAction}
              actionState={actionState}
              onSuccess={handleSuccess}
            >
              <SubmitButton label="Confirmar" />
            </Form>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return [dialogTrigger, dialog] as const;
};

export { useConfirmDialog };
