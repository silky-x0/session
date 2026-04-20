import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import ReactLenis from "lenis/react";
import { cn } from "@/lib/utils";

type CharacterProps = {
  char: string;
  index: number;
  centerIndex: number;
  scrollYProgress: any;
  isStroke?: boolean;
};


const CharacterAnim = ({
  char,
  index,
  centerIndex,
  scrollYProgress,
  isStroke
}: CharacterProps) => {
  const isSpace = char === " ";
  const distanceFromCenter = index - centerIndex;

  const x = useTransform(
    scrollYProgress,
    [0, 0.5],
    [distanceFromCenter * 50, 0],
  );
  const rotateX = useTransform(
    scrollYProgress,
    [0, 0.5],
    [distanceFromCenter * 50, 0],
  );

  return (
    <motion.span
      className={cn("inline-block", isSpace && "w-6 md:w-12")}
      style={{
        x,
        rotateX,
        color: isStroke ? "transparent" : "#00FF41",
        WebkitTextStroke: isStroke ? "1px rgba(255,255,255,0.3)" : "4px #00FF41",
        ...(isStroke ? {} : { 
          backgroundColor: "#00FF41",
          WebkitBackgroundClip: "text",
          filter: "brightness(1.5)"
        })
      }}
    >
      {char}
    </motion.span>
  );
};

export const TypographyBreak: React.FC = () => {
  const targetRef1 = useRef<HTMLDivElement | null>(null);
  const targetRef2 = useRef<HTMLDivElement | null>(null);

  const { scrollYProgress: scrollYProgress1 } = useScroll({
    target: targetRef1,
    offset: ["start end", "center center"]
  });
  
  const { scrollYProgress: scrollYProgress2 } = useScroll({
    target: targetRef2,
    offset: ["start end", "center center"]
  });

  const text1 = "THE NEW STANDARD";
  const chars1 = text1.split("");
  const center1 = Math.floor(chars1.length / 2);

  const text2 = "FOR ENGINEERING";
  const chars2 = text2.split("");
  const center2 = Math.floor(chars2.length / 2);

  return (
    <ReactLenis root>
      <section className="relative w-full py-48 flex flex-col items-center bg-[#050505] z-10 overflow-hidden">
        
        {/* Background grain */}
        <div className="absolute inset-0 opacity-[0.03] bg-[url('/noise.png')] pointer-events-none mix-blend-overlay"></div>

        {/* Top Text - Hollow */}
        <div 
          ref={targetRef1}
          className="font-display text-[8vw] sm:text-[6vw] md:text-8xl lg:text-9xl font-black uppercase tracking-tighter leading-none text-center flex justify-center w-full max-w-6xl z-20 pointer-events-none"
          style={{ perspective: "500px" }}
        >
           {chars1.map((char, index) => (
             <CharacterAnim 
               key={index} 
               char={char} 
               index={index} 
               centerIndex={center1} 
               scrollYProgress={scrollYProgress1} 
               isStroke={true}
             />
           ))}
        </div>

        {/* Empty Frame Structure */}
        <div className="w-full max-w-5xl h-48 sm:h-64 md:h-96 border border-white/5 rounded-3xl mt-16 mb-16 relative flex items-center justify-center z-20">
           <div className="absolute top-4 left-4 w-2 h-2 rounded-full border border-white/20"></div>
           <div className="absolute top-4 right-4 w-2 h-2 rounded-full border border-white/20"></div>
           <div className="absolute bottom-4 left-4 w-2 h-2 rounded-full border border-white/20"></div>
           <div className="absolute bottom-4 right-4 w-2 h-2 rounded-full border border-white/20"></div>
           
           <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/[0.03]"></div>
           <div className="absolute left-0 right-0 top-1/2 h-px bg-white/[0.03]"></div>
        </div>

        {/* Bottom Text - Heavy Neon */}
        <div 
          ref={targetRef2}
          className="font-display text-[8vw] sm:text-[6vw] md:text-8xl lg:text-9xl font-black italic uppercase tracking-tighter leading-none drop-shadow-[0_0_80px_rgba(0,255,65,0.4)] text-center flex justify-center w-full max-w-6xl z-20 pointer-events-none" 
          style={{ perspective: "500px" }}
        >
           {chars2.map((char, index) => (
             <CharacterAnim 
               key={index} 
               char={char} 
               index={index} 
               centerIndex={center2} 
               scrollYProgress={scrollYProgress2} 
               isStroke={false}
             />
           ))}
        </div>

      </section>
    </ReactLenis>
  );
};
