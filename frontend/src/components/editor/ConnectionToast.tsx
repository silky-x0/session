import { useState, useCallback } from "react";
import { useLostConnectionListener, useErrorListener } from "@liveblocks/react/suspense";
import { motion, AnimatePresence } from "framer-motion";
import { WifiOff, Wifi, AlertTriangle, X } from "lucide-react";

type Toast = {
  id: string;
  type: "warning" | "success" | "error";
  message: string;
  icon: React.ReactNode;
};

/**
 * Listens for Liveblocks connection loss and error events,
 * then renders animated toast notifications.
 *
 * Uses:
 * - useLostConnectionListener — fires "lost" / "restored" / "failed"
 * - useErrorListener — fires on any Liveblocks error (room connection, thread ops, etc.)
 */
export function ConnectionToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev.slice(-4), { ...toast, id }]); // Keep max 5
    // Auto-dismiss after 5s
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ─── Connection Loss Listener ─────────────────────────────
  useLostConnectionListener((event) => {
    switch (event) {
      case "lost":
        addToast({
          type: "warning",
          message: "Connection lost. Trying to reconnect…",
          icon: <WifiOff className="w-4 h-4" />,
        });
        break;
      case "restored":
        addToast({
          type: "success",
          message: "Connection restored!",
          icon: <Wifi className="w-4 h-4" />,
        });
        break;
      case "failed":
        addToast({
          type: "error",
          message: "Could not reconnect. Please refresh the page.",
          icon: <AlertTriangle className="w-4 h-4" />,
        });
        break;
    }
  });

  // ─── Error Listener ───────────────────────────────────────
  useErrorListener((error) => {
    // Don't spam toasts for every error — just show the important ones
    const importantErrors = [
      "CREATE_THREAD_ERROR",
      "DELETE_THREAD_ERROR",
      "CREATE_COMMENT_ERROR",
    ];

    const errorType = error?.context?.type;
    if (errorType && importantErrors.includes(errorType)) {
      addToast({
        type: "error",
        message: error.message || `Error: ${errorType}`,
        icon: <AlertTriangle className="w-4 h-4" />,
      });
    }
  });

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg border shadow-2xl backdrop-blur-xl
              ${
                toast.type === "warning"
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                  : toast.type === "success"
                    ? "bg-green-500/10 border-green-500/30 text-green-400"
                    : "bg-red-500/10 border-red-500/30 text-red-400"
              }`}
          >
            {toast.icon}
            <span className="text-sm font-medium">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-2 opacity-50 hover:opacity-100 transition-opacity cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
