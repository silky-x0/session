"use client";
import { motion, AnimatePresence } from "framer-motion";

interface HeroTextProps {
  text?: string;
  className?: string;
  isExiting?: boolean;
}

export default function HeroText({
  text = "SESSION",
  className = "",
  isExiting = false,
}: HeroTextProps) {
  const characters = text.split("");

  return (
    <div
      className={`relative flex flex-col items-center justify-center w-full bg-transparent ${className}`}
    >
      <div className='absolute left-1/2 top-1/2 h-[250px] w-[60vw] max-w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgba(0,255,65,0.07)_0%,rgba(0,240,255,0.03)_40%,transparent_70%)] blur-[60px] pointer-events-none z-0' />

      <div className='relative z-10 w-full px-4 flex flex-col items-center'>
        <AnimatePresence mode='wait'>
          {!isExiting && (
            <motion.div className='flex flex-wrap justify-center items-center w-full'>
              {characters.map((char, i) => (
                <div
                  key={i}
                  className='relative px-[0.2vw] overflow-hidden group'
                >
                  <motion.span
                    initial={{ opacity: 0, filter: "blur(10px)", scale: 0.95 }}
                    animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
                    exit={{ opacity: 0, filter: "blur(10px)" }}
                    transition={{
                      delay: i * 0.05 + 0.3,
                      duration: 0.8,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className='leading-none font-black font-display text-white tracking-tighter'
                    style={{
                      fontSize: `min(15vw, ${100 / characters.length}vw)`,
                    }}
                  >
                    {char === " " ? "\u00A0" : char}
                  </motion.span>

                  <motion.span
                    initial={{ x: "-100%", opacity: 0 }}
                    animate={{ x: "100%", opacity: [0, 1, 0] }}
                    exit={{ x: ["100%", "-100%"], opacity: [0, 1, 0] }}
                    transition={{
                      duration: 0.9,
                      delay: i * 0.04,
                      ease: "easeInOut",
                    }}
                    className='absolute inset-0 leading-none font-black font-display text-[#00F0FF] z-10 pointer-events-none tracking-tighter mix-blend-screen'
                    style={{
                      clipPath: "polygon(0 0, 100% 0, 100% 35%, 0 35%)",
                      fontSize: `min(15vw, ${100 / characters.length}vw)`,
                    }}
                  >
                    {char}
                  </motion.span>

                  <motion.span
                    initial={{ x: "100%", opacity: 0 }}
                    animate={{ x: "-100%", opacity: [0, 1, 0] }}
                    exit={{ x: ["-100%", "100%"], opacity: [0, 1, 0] }}
                    transition={{
                      duration: 0.9,
                      delay: i * 0.04 + 0.1,
                      ease: "easeInOut",
                    }}
                    className='absolute inset-0 leading-none font-black font-display text-white z-10 pointer-events-none tracking-tighter drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]'
                    style={{
                      clipPath: "polygon(0 35%, 100% 35%, 100% 65%, 0 65%)",
                      fontSize: `min(15vw, ${100 / characters.length}vw)`,
                    }}
                  >
                    {char}
                  </motion.span>

                  <motion.span
                    initial={{ x: "-100%", opacity: 0 }}
                    animate={{ x: "100%", opacity: [0, 1, 0] }}
                    exit={{ x: ["100%", "-100%"], opacity: [0, 1, 0] }}
                    transition={{
                      duration: 0.9,
                      delay: i * 0.04 + 0.2,
                      ease: "easeInOut",
                    }}
                    className='absolute inset-0 leading-none font-black font-display text-[#00FF41] z-10 pointer-events-none tracking-tighter mix-blend-screen'
                    style={{
                      clipPath: "polygon(0 65%, 100% 65%, 100% 100%, 0 100%)",
                      fontSize: `min(15vw, ${100 / characters.length}vw)`,
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
    </div>
  );
}
