import { ZodError } from "zod";

export type ActionState = {
  success: any;
  data: any;
  status?: "SUCCESS" | "ERROR";
  message: string;
  payload?: FormData;
  fieldErrors: Record<string, string[] | undefined>;
  timestamp: number;
};

export const EMPTY_ACTION_STATE: ActionState = {
  success: undefined,
  data: undefined,
  message: "",
  fieldErrors: {},
  timestamp: Date.now(),
};

export const fromErrorToActionState = (
  error: unknown,
  formData?: FormData
): ActionState => {
  if (error instanceof ZodError) {
    return {
      success: false,
      data: undefined,
      status: "ERROR",
      message: "",
      payload: formData,
      fieldErrors: error.flatten().fieldErrors,
      timestamp: Date.now(),
    };
  } else if (error instanceof Error) {
    return {
      success: false,
      data: undefined,
      status: "ERROR",
      message: error.message,
      payload: formData,
      fieldErrors: {},
      timestamp: Date.now(),
    };
  } else {
    return {
      success: false,
      data: undefined,
      status: "ERROR",
      message: "Ocorreu um erro desconhecido",
      payload: formData,
      fieldErrors: {},
      timestamp: Date.now(),
    };
  }
};

export const toActionState = (
  status: ActionState["status"],
  message: string,
  formData?: FormData
): ActionState => {
  return {
    success: status === "SUCCESS",
    data: undefined,
    status,
    message,
    fieldErrors: {},
    payload: formData,
    timestamp: Date.now(),
  };
};
