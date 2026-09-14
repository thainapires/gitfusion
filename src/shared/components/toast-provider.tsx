"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FiAlertCircle, FiAlertTriangle, FiCheckCircle, FiInfo, FiX } from "react-icons/fi";
import { ToastPayload, ToastType, toastEventName } from "@/lib/notifications/toast";

type ToastItem = Required<Pick<ToastPayload, "type" | "duration">> & {
  id: string;
  title: string;
  message?: string;
};

const toastStyles: Record<ToastType, { icon: typeof FiInfo; accent: string; iconClass: string }> = {
  success: { icon: FiCheckCircle, accent: "bg-emerald-500", iconClass: "text-emerald-400" },
  error: { icon: FiAlertCircle, accent: "bg-red-500", iconClass: "text-red-400" },
  warning: { icon: FiAlertTriangle, accent: "bg-amber-400", iconClass: "text-amber-300" },
  info: { icon: FiInfo, accent: "bg-primary", iconClass: "text-primary" },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const handleToast = (event: Event) => {
      const payload = (event as CustomEvent<ToastPayload>).detail;
      const toast: ToastItem = {
        id: crypto.randomUUID(),
        type: payload.type || "info",
        title: payload.title,
        message: payload.message,
        duration: payload.duration || 5200,
      };

      setToasts((current) => [toast, ...current].slice(0, 4));
    };

    window.addEventListener(toastEventName, handleToast);
    return () => window.removeEventListener(toastEventName, handleToast);
  }, []);

  const dismiss = (id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  };

  return (
    <>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3 sm:right-6 sm:top-6" aria-live="polite" aria-atomic="false">
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </div>
    </>
  );
}

function ToastCard({ toast, onDismiss }: { toast: ToastItem; onDismiss: (id: string) => void }) {
  const [remaining, setRemaining] = useState(toast.duration);
  const [progress, setProgress] = useState(100);
  const startedAtRef = useRef(Date.now());
  const remainingRef = useRef(toast.duration);
  const timeoutRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);
  const isPausedRef = useRef(false);
  const style = toastStyles[toast.type];
  const Icon = style.icon;

  const clearTimer = useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (frameRef.current) {
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  }, []);

  const tick = useCallback(() => {
    if (isPausedRef.current) {
      return;
    }

    const elapsed = Date.now() - startedAtRef.current;
    const nextRemaining = Math.max(remainingRef.current - elapsed, 0);
    setRemaining(nextRemaining);
    setProgress((nextRemaining / toast.duration) * 100);

    if (nextRemaining > 0) {
      frameRef.current = window.requestAnimationFrame(tick);
    }
  }, [toast.duration]);

  const startTimer = useCallback((duration: number) => {
    clearTimer();
    isPausedRef.current = false;
    remainingRef.current = duration;
    startedAtRef.current = Date.now();
    timeoutRef.current = window.setTimeout(() => onDismiss(toast.id), duration);
    frameRef.current = window.requestAnimationFrame(tick);
  }, [clearTimer, onDismiss, tick, toast.id]);

  useEffect(() => {
    startTimer(remainingRef.current);

    return () => {
      clearTimer();
    };
  }, [clearTimer, startTimer]);

  const pauseTimer = () => {
    if (isPausedRef.current) {
      return;
    }

    const elapsed = Date.now() - startedAtRef.current;
    const nextRemaining = Math.max(remainingRef.current - elapsed, 0);
    clearTimer();
    isPausedRef.current = true;
    remainingRef.current = nextRemaining;
    setRemaining(nextRemaining);
    setProgress((nextRemaining / toast.duration) * 100);
  };

  const resumeTimer = () => {
    if (!isPausedRef.current || remaining <= 0) {
      return;
    }

    startTimer(remainingRef.current);
  };

  return (
    <article
      className="pointer-events-auto overflow-hidden rounded-lg border border-gray-200 bg-card text-foreground shadow-2xl dark:border-gray-800"
      onMouseEnter={pauseTimer}
      onMouseLeave={resumeTimer}
      role={toast.type === "error" ? "alert" : "status"}
    >
      <div className="flex gap-3 p-4">
        <Icon className={`mt-0.5 size-5 shrink-0 ${style.iconClass}`} aria-hidden />
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-extrabold">{toast.title}</h2>
          {toast.message && <p className="mt-1 text-sm leading-5 text-muted-foreground">{toast.message}</p>}
        </div>
        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          className="grid size-7 shrink-0 place-items-center rounded-md text-muted-foreground transition hover:bg-background hover:text-foreground"
          aria-label="Dismiss notification"
        >
          <FiX className="size-4" aria-hidden />
        </button>
      </div>
      <div className="h-1 bg-background">
        <div className={`h-full ${style.accent}`} style={{ width: `${progress}%` }} />
      </div>
    </article>
  );
}
