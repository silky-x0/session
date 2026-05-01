import React, { useState, useEffect } from "react";
import { SessionInput } from "./SessionInput";
import { LinkPreview } from "../ui/link-preview";
import { motion, AnimatePresence } from "framer-motion";

const WORDS = ["interview", "pairing session", "code review"];

export const Hero: React.FC = () => {
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % WORDS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className='flex flex-col items-center justify-center min-h-[75vh] sm:min-h-[55vh] lg:min-h-[60vh] pt-12 sm:pt-16 lg:pt-20 px-4 relative z-10 gap-10 sm:gap-12'>
      <div className='flex flex-col items-center gap-5 sm:gap-6 max-w-4xl text-center'>
        {/* Eyebrow — orients the visitor instantly */}
        <p className='font-mono text-[10px] sm:text-[11px] text-white/30 border border-white/10 px-3 py-1 rounded-full'>
          the coding room that thinks with you
        </p>

        {/* Main Heading */}
        <h1 className='flex flex-col items-center gap-0 font-display text-4xl sm:text-5xl md:text-[56px] font-bold leading-[1.1] sm:leading-[0.95] tracking-tight lowercase'>
          <span className='text-outline'>stop juggling tabs.</span>
          <motion.span layout className='text-white font-normal italic my-1 -tracking-[0.02em] flex flex-nowrap whitespace-nowrap items-center justify-center gap-x-1.5 sm:gap-x-3 text-[30px] min-[390px]:text-4xl sm:text-inherit'>
            <motion.span layout transition={{ duration: 1, ease: "easeInOut" }}>
              your entire{" "}
            </motion.span>
            <motion.span layout className='relative inline-flex justify-center overflow-hidden pb-1'>
              <AnimatePresence mode='popLayout'>
                <motion.span
                  layout
                  key={wordIndex}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className='text-stroke-green text-transparent whitespace-nowrap'
                  style={{ WebkitTextStroke: "1px #00FF41" }}
                >
                  {WORDS[wordIndex]}
                </motion.span>
              </AnimatePresence>
            </motion.span>
          </motion.span>
          <span className='text-outline' style={{ textTransform: "none" }}>
            ONE{" "}
            <span
              className='text-stroke-green text-transparent'
              style={{ WebkitTextStroke: "1px #00FF41" }}
            >
              session.
            </span>
          </span>
        </h1>

        {/* Subheading — tighter, covers all three personas */}
        <p className='sm:hidden font-sans text-white/50 text-sm max-w-[300px] leading-relaxed text-center'>
          one link. shared IDE, AI questions, video, and post-session analysis.
        </p>
        <p className='hidden sm:block font-sans text-white/50 text-base max-w-[520px] leading-relaxed text-center'>
          Session gives interviewers and engineers a shared{" "}
          <LinkPreview
            url='#'
            isStatic
            imageSrc='/livexec.mp4'
            className='text-cyber-cyan/70 hover:text-cyber-cyan transition-colors font-semibold'
          >
            live IDE
          </LinkPreview>
          ,{" "}
          <LinkPreview
            url='#'
            isStatic
            imageSrc='/realtime.mp4'
            className='text-cyber-cyan/70 hover:text-cyber-cyan transition-colors font-semibold'
          >
            ai-generated questions
          </LinkPreview>{" "}
          tuned to experience level, audio & video, and{" "}
          <LinkPreview
            url='#'
            isStatic
            imageSrc='/cale.mp4'
            className='text-cyber-cyan/70 hover:text-cyber-cyan transition-colors font-semibold'
          >
            post-session analysis
          </LinkPreview>{" "}
          — all from a single link.
        </p>

        {/* Trust / social proof line */}
        <p className='font-mono text-[10px] sm:text-[11px] text-white/20 tracking-wide text-center'>
          no setup · no credit card · just describe your session
        </p>
      </div>

      {/* SessionInput — naturally flows after text */}
      <div className='w-full flex flex-col items-center gap-3 mt-2 sm:mt-0'>
        <SessionInput />
        <p className='font-mono text-[10px] text-white/20 text-center'>
          try: "mid-level backend interview, node.js, 2 yrs exp"
        </p>
      </div>
    </section>
  );
};
