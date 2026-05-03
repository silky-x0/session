import React, { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionTemplate,
} from "framer-motion";
import ReactLenis from "lenis/react";

export const TypographyBreak: React.FC = () => {
  const targetRef = useRef<HTMLDivElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"],
  });

  const yMotionValue = useTransform(scrollYProgress, [0, 1], [250, -250]);
  const transform = useMotionTemplate`rotateX(45deg) translateY(${yMotionValue}px) translateZ(10px)`;

  return (
    <ReactLenis root>
      <section
        ref={targetRef}
        className='relative z-10 w-full pb-10 sm:pb-22 bg-gradient-to-b from-transparent via-[#050505] via-50% to-[#050505] overflow-clip'
      >
        <div className="absolute inset-0 opacity-[0.03] bg-[url('/noise.png')] pointer-events-none mix-blend-overlay z-0"></div>

        <div
          className='mx-auto flex items-center justify-center bg-transparent z-10'
          style={{
            transformStyle: "preserve-3d",
            perspective: "250px",
          }}
        >
          <motion.div
            style={{
              transformStyle: "preserve-3d",
              transform,
              transformOrigin: "center center",
            }}
            className='relative flex flex-col items-center justify-center text-center font-display w-full max-w-6xl px-4 pointer-events-none'
          >
            <div
              className='text-[12vw] sm:text-[4vw] md:text-6xl lg:text-7xl font-black uppercase tracking-tighter leading-none'
              style={{
                WebkitTextStroke: "1px rgba(0,212,255,0.4)",
                color: "transparent",
              }}
            >
              ONE ROOM.
            </div>

            <div className='my-4 flex flex-col items-center gap-2 sm:gap-4'>
              <div
                className='text-[18vw] sm:text-[6vw] md:text-7xl lg:text-8xl xl:text-9xl font-black italic uppercase tracking-tighter leading-none'
                style={{
                  color: "#00FF41",
                  filter:
                    "drop-shadow(0 0 10px rgba(0,255,65,0.6)) brightness(1.2)",
                }}
              >
                EVERY
              </div>
              <div
                className='text-[18vw] sm:text-[6vw] md:text-7xl lg:text-8xl xl:text-9xl font-black italic uppercase tracking-tighter leading-none'
                style={{
                  color: "#00FF41",
                  filter:
                    "drop-shadow(0 0 10px rgba(0,255,65,0.6)) brightness(1.2)",
                }}
              >
                TOOL.
              </div>
            </div>

            <div
              className='text-[12vw] sm:text-[4vw] md:text-6xl lg:text-7xl font-black uppercase tracking-tighter leading-none'
              style={{
                WebkitTextStroke: "1px rgba(0,212,255,0.4)",
                color: "transparent",
              }}
            >
              ZERO SETUP.
            </div>

            <div className='absolute bottom-[-20%] left-0 h-[40vh] w-full bg-gradient-to-b from-transparent to-[#050505] pointer-events-none' />
          </motion.div>
        </div>
      </section>
    </ReactLenis>
  );
};
