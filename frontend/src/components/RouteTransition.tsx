import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import HeroText from "./ui/hero-shutter-text";

interface RouteTransitionProps {
  children: React.ReactNode;
  text: string;
}

export function RouteTransition({ children, text }: RouteTransitionProps) {
  const [isTextExiting, setIsTextExiting] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);

  useEffect(() => {
    // 1. Let the text animate in and hold for a moment (approx 1.5s to finish + 0.2s hold)
    const textExitTimer = setTimeout(() => {
      setIsTextExiting(true);
    }, 1700);

    // 2. Start fading out the background slightly after the text starts its glitch out
    const overlayExitTimer = setTimeout(() => {
      setShowOverlay(false);
    }, 2000);

    return () => {
      clearTimeout(textExitTimer);
      clearTimeout(overlayExitTimer);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen w-full relative"
    >
      {/* We render the actual page content under the overlay */}
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
