export type ToastType = "success" | "error" | "warning" | "info";

export type ToastPayload = {
  type?: ToastType;
  title: string;
  message?: string;
  duration?: number;
};

export const toastEventName = "gitfusion:toast";

export function notify(payload: ToastPayload) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent<ToastPayload>(toastEventName, { detail: payload }));
}
