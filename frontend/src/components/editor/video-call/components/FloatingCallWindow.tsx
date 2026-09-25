import type { ReactNode } from "react";
import type { CallMode } from "../types";

interface FloatingCallWindowProps {
  mode: CallMode;
  focusW: number;
  header: ReactNode;
  children: ReactNode;
  controls: ReactNode;
}

/** Floating preview/focus panel shell: header + scrollable body + hover controls. */
export function FloatingCallWindow({
  mode,
  focusW,
  header,
  children,
  controls,
}: FloatingCallWindowProps) {
  return (
    <div
      className={`glass-panel rounded-2xl overflow-hidden border border-glass-border/40 flex flex-col ${
        mode === "focus" ? "max-h-[calc(100vh-16px)]" : "w-[264px]"
      }`}
      style={mode === "focus" ? { width: focusW } : undefined}
    >
      {header}
      <div className="p-2 flex flex-col gap-2 overflow-y-auto min-h-0">
        {children}
        <div className="flex items-center justify-center gap-2 pt-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 lg:focus-within:opacity-100 transition-opacity hover:opacity-100 focus-within:opacity-100">
          {controls}
        </div>
      </div>
    </div>
  );
}
