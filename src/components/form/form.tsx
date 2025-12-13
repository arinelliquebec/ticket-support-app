import { toast } from "sonner";
import { useActionFeedback } from "./hooks/use-action-feedback";
import { ActionState } from "./utils/to-action-state";

type FormProps = {
  action: (payload: FormData) => void;
  actionState: ActionState;
  onSuccess?: (actionState: ActionState) => void;
  onError?: (actionState: ActionState) => void;
  children: React.ReactNode;
  className?: string;
  preserveFormState?: boolean; // New option to preserve form state on error
};

const Form = ({
  action,
  actionState,
  children,
  onSuccess,
  onError,
  className,
  preserveFormState = true, // Default to preserving form state
}: FormProps) => {
  useActionFeedback(actionState, {
    onSuccess: ({ actionState }) => {
      if (actionState.message) {
        toast.success(actionState.message);
      }

      onSuccess?.(actionState);
    },
    onError: ({ actionState }) => {
      if (actionState.message) {
        toast.error(actionState.message);
      }

      onError?.(actionState);
    },
  });

  // Create the form action that preserves field values on error
  const handleFormAction = async (formData: FormData) => {
    try {
      await action(formData);
    } catch (error) {
      // If we want to preserve the form state, we pass it to the error handler
      if (preserveFormState) {
        console.error("Form submission error:", error);
        // We can add additional handling here if needed
      }
      throw error; // Re-throw the error to let React Server Actions handle it
    }
  };

  return (
    <form
      action={handleFormAction}
      className={`flex flex-col gap-y-2 ${className || ""}`}
    >
      {children}
    </form>
  );
};

export { Form };
