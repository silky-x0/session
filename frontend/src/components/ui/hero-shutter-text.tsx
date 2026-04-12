"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw } from "lucide-react";

interface HeroTextProps {
  text?: string;
  className?: string;
  hideControls?: boolean;
  isExiting?: boolean;
}

export default function HeroText({
  text = "SESSION",
  className = "",
  hideControls = false,
  isExiting = false,
}: HeroTextProps) {
  const [count, setCount] = useState(0);
  const characters = text.split("");

  return (
    <div
      className={`relative flex flex-col items-center justify-center h-full w-full 
      bg-white dark:bg-zinc-950 transition-colors duration-700 ${className}`}
    >
      {/* Immersive Background Grid */}
      <div
        className="absolute inset-0 opacity-[0.05] dark:opacity-[0.15] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, #888 1px, transparent 1px), linear-gradient(to bottom, #888 1px, transparent 1px)`,
          backgroundSize: "clamp(20px, 5vw, 60px) clamp(20px, 5vw, 60px)",
        }}
      />

      {/* Main Text Container */}
      <div className="relative z-10 w-full px-4 flex flex-col items-center">
        <AnimatePresence mode="wait">
          {!isExiting && (
            <motion.div
              key={count}
              className="flex flex-wrap justify-center items-center w-full"
            >
              {characters.map((char, i) => (
                <div
                  key={i}
                  className="relative px-[0.1vw] overflow-hidden group"
                >
                  {/* Main Character */}
                  <motion.span
                    initial={{ opacity: 0, filter: "blur(10px)" }}
                    animate={{ opacity: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, filter: "blur(10px)" }}
                    transition={{ delay: i * 0.04 + 0.3, duration: 0.8 }}
                    className="leading-none font-black text-zinc-900 dark:text-white tracking-tighter"
                    style={{ fontSize: `min(10vw, ${85 / characters.length}vw)` }}
                  >
                    {char === " " ? "\u00A0" : char}
                  </motion.span>

                  {/* Top Slice Layer */}
                  <motion.span
                    initial={{ x: "-100%", opacity: 0 }}
                    animate={{ x: "100%", opacity: [0, 1, 0] }}
                    exit={{ x: ["100%", "-100%"], opacity: [0, 1, 0] }}
                    transition={{
                      duration: 0.7,
                      delay: i * 0.04,
                      ease: "easeInOut",
                    }}
                    className="absolute inset-0 leading-none font-black text-indigo-600 dark:text-emerald-400 z-10 pointer-events-none tracking-tighter"
                    style={{ 
                      clipPath: "polygon(0 0, 100% 0, 100% 35%, 0 35%)",
                      fontSize: `min(10vw, ${85 / characters.length}vw)`
                    }}
                  >
                    {char}
                  </motion.span>

                  {/* Middle Slice Layer */}
                  <motion.span
                    initial={{ x: "100%", opacity: 0 }}
                    animate={{ x: "-100%", opacity: [0, 1, 0] }}
                    exit={{ x: ["-100%", "100%"], opacity: [0, 1, 0] }}
                    transition={{
                      duration: 0.7,
                      delay: i * 0.04 + 0.1,
                      ease: "easeInOut",
                    }}
                    className="absolute inset-0 leading-none font-black text-zinc-800 dark:text-zinc-200 z-10 pointer-events-none tracking-tighter"
                    style={{
                      clipPath: "polygon(0 35%, 100% 35%, 100% 65%, 0 65%)",
                      fontSize: `min(10vw, ${85 / characters.length}vw)`
                    }}
                  >
                    {char}
                  </motion.span>

                  {/* Bottom Slice Layer */}
                  <motion.span
                    initial={{ x: "-100%", opacity: 0 }}
                    animate={{ x: "100%", opacity: [0, 1, 0] }}
                    exit={{ x: ["100%", "-100%"], opacity: [0, 1, 0] }}
                    transition={{
                      duration: 0.7,
                      delay: i * 0.04 + 0.2,
                      ease: "easeInOut",
                    }}
                    className="absolute inset-0 leading-none font-black text-indigo-600 dark:text-emerald-400 z-10 pointer-events-none tracking-tighter"
                    style={{
                      clipPath: "polygon(0 65%, 100% 65%, 100% 100%, 0 100%)",
                      fontSize: `min(10vw, ${85 / characters.length}vw)`
                    }}
                  >
                    {char}
                  </motion.span>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!hideControls && (
        <>
          {/* Floating UI Controls */}
          <div className="absolute bottom-12 flex flex-col items-center gap-6 z-20">
            <motion.button
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setCount((c) => c + 1)}
              className="p-4 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-full shadow-2xl transition-colors duration-300"
            >
              <RefreshCw size={24} />
            </motion.button>

            <p className="text-[10px] uppercase tracking-[0.5em] font-bold text-zinc-400 dark:text-zinc-500">
              Click to re-shutter
            </p>
          </div>

          {/* Corner Accents */}
          <div className="absolute top-8 left-8 border-l border-t border-zinc-200 dark:border-zinc-800 w-12 h-12" />
          <div className="absolute bottom-8 right-8 border-r border-b border-zinc-200 dark:border-zinc-800 w-12 h-12" />
        </>
      )}
    </div>
  );
}
