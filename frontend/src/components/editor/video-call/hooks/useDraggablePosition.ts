import {
  useCallback,
  useLayoutEffect,
  useEffect,
  useRef,
  useState,
} from "react";
import type { CallMode } from "../types";
import { POS_KEY } from "../constants";

export interface Viewport {
  w: number;
  h: number;
}

export interface DragHandlers {
  onDragStart: (e: React.PointerEvent) => void;
  onDragMove: (e: React.PointerEvent) => void;
  onDragEnd: () => void;
}

function readSavedPos(): { x: number; y: number } | null {
  try {
    const raw = localStorage.getItem(POS_KEY);
    return raw ? (JSON.parse(raw) as { x: number; y: number }) : null;
  } catch {
    return null;
  }
}

/**
 * Owns the floating window position: drag handling, viewport clamping,
 * persistence to localStorage, and viewport tracking.
 * Re-clamps when the box resizes (mode switch, camera toggle, video load).
 */
export function useDraggablePosition(mode: CallMode) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(readSavedPos);
  const [viewport, setViewport] = useState<Viewport>(() => ({
    w: typeof window !== "undefined" ? window.innerWidth : 1280,
    h: typeof window !== "undefined" ? window.innerHeight : 800,
  }));
  const boxRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    dx: number;
    dy: number;
    sx: number;
    sy: number;
    th: number;
  } | null>(null);
  const suppressClickRef = useRef(false);

  const clampPos = useCallback((x: number, y: number) => {
    const el = boxRef.current;
    const w = el?.offsetWidth ?? 280;
    const h = el?.offsetHeight ?? 48;
    // Free drag across the whole viewport, including over the right rail.
    const reserve = 8;
    return {
      x: Math.min(Math.max(8, x), Math.max(8, window.innerWidth - reserve - w)),
      y: Math.min(Math.max(8, y), Math.max(8, window.innerHeight - h - 8)),
    };
  }, []);

  const onDragStart = useCallback((e: React.PointerEvent) => {
    const el = boxRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    dragRef.current = {
      dx: e.clientX - r.left,
      dy: e.clientY - r.top,
      sx: e.clientX,
      sy: e.clientY,
      // Fingers jitter more than mice — bigger tap-vs-drag threshold.
      th: e.pointerType === "touch" ? 12 : 6,
    };
    suppressClickRef.current = false;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }, []);

  const onDragMove = useCallback(
    (e: React.PointerEvent) => {
      const d = dragRef.current;
      if (!d) return;
      if (Math.abs(e.clientX - d.sx) + Math.abs(e.clientY - d.sy) > d.th) {
        suppressClickRef.current = true;
      }
      setPos(clampPos(e.clientX - d.dx, e.clientY - d.dy));
    },
    [clampPos],
  );

  const onDragEnd = useCallback(() => {
    dragRef.current = null;
    try {
      const el = boxRef.current;
      if (el) {
        const r = el.getBoundingClientRect();
        localStorage.setItem(
          POS_KEY,
          JSON.stringify({ x: Math.round(r.left), y: Math.round(r.top) }),
        );
      }
    } catch {
      /* storage unavailable */
    }
  }, []);

  // Re-clamp whenever box size changes (mode switch, camera on/off, video load).
  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      setPos((p) => {
        if (!p) return p;
        const c = clampPos(p.x, p.y);
        return c.x === p.x && c.y === p.y ? p : c;
      });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [clampPos, mode]);

  // Reset a stale saved position on resize + track viewport for fit sizing.
  useEffect(() => {
    const onResize = () => {
      setViewport({ w: window.innerWidth, h: window.innerHeight });
      setPos((p) => {
        if (!p) return p;
        const c = clampPos(p.x, p.y);
        return c.x === p.x && c.y === p.y ? p : null;
      });
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [clampPos]);

  const dragHandlers: DragHandlers = { onDragStart, onDragMove, onDragEnd };

  return { boxRef, pos, viewport, dragHandlers, suppressClickRef };
}
