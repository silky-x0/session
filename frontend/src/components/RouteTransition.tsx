import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import HeroText from "./ui/hero-shutter-text";

/** Minimum time the overlay is shown (ms) so the text animation always plays through */
const MIN_DISPLAY_MS = 1700;

interface RouteTransitionProps {
  children: React.ReactNode;
  text: string;
  /**
   * When provided, the overlay stays visible until this becomes `true`.
   * Falls back to the fixed 2-second timer when omitted.
   */
  isReady?: boolean;
}

export function RouteTransition({ children, text, isReady }: RouteTransitionProps) {
  const [isTextExiting, setIsTextExiting] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);
  const mountTimeRef = useRef(Date.now());
  const hasSignaledRef = useRef(false);

  // ── Fixed-timer path (routes with no isReady prop) ─────────────
  useEffect(() => {
    if (isReady !== undefined) return;

    const textExitTimer = setTimeout(() => setIsTextExiting(true), 1700);
    const overlayExitTimer = setTimeout(() => setShowOverlay(false), 2000);

    return () => {
      clearTimeout(textExitTimer);
      clearTimeout(overlayExitTimer);
    };
  }, [isReady]);

  // ── Signal-driven path (routes that pass isReady) ──────────────
  useEffect(() => {
    if (isReady === undefined || !isReady || hasSignaledRef.current) return;
    hasSignaledRef.current = true;

    // Respect minimum display time so the animation always finishes
    const elapsed = Date.now() - mountTimeRef.current;
    const delay = Math.max(0, MIN_DISPLAY_MS - elapsed);

    const textExitTimer = setTimeout(() => setIsTextExiting(true), delay);
    const overlayExitTimer = setTimeout(() => setShowOverlay(false), delay + 300);

    return () => {
      clearTimeout(textExitTimer);
      clearTimeout(overlayExitTimer);
    };
  }, [isReady]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen w-full relative"
    >
      {/* Actual page content rendered underneath the overlay */}
      {children}

      <AnimatePresence>
        {showOverlay && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-[100] bg-session-dark dark:bg-zinc-950 flex items-center justify-center pointer-events-none"
          >
            <HeroText
              text={text}
              hideControls={true}
              isExiting={isTextExiting}
              className="bg-session-dark dark:bg-zinc-950"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
