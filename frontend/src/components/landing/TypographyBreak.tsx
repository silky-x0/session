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
    [distanceFromCenter * 30, 0],
  );
  const rotateX = useTransform(
    scrollYProgress,
    [0, 0.5],
    [distanceFromCenter * 20, 0],
  );

  return (
    <motion.span
      className={cn("inline-block", isSpace && "w-4 md:w-8")}
      style={{
        x,
        rotateX,
        color: "transparent",
        WebkitTextStroke: isStroke 
          ? "1px rgba(255,255,255,0.3)" 
          : "2px #00FF41",
        filter: isStroke 
          ? "none" 
          : "drop-shadow(0 0 15px rgba(0,255,65,0.8)) brightness(1.2)",
      }}
    >
      {char}
    </motion.span>
  );
};

export const TypographyBreak: React.FC = () => {
  const targetRef1 = useRef<HTMLDivElement | null>(null);
  const targetRef2 = useRef<HTMLDivElement | null>(null);
  const targetRef3 = useRef<HTMLDivElement | null>(null);

  const { scrollYProgress: scrollYProgress1 } = useScroll({
    target: targetRef1,
    offset: ["start end", "center start"]
  });
  
  const { scrollYProgress: scrollYProgress2 } = useScroll({
    target: targetRef2,
    offset: ["start end", "center start"]
  });

  const { scrollYProgress: scrollYProgress3 } = useScroll({
    target: targetRef3,
    offset: ["start end", "center start"]
  });

  const text1 = "THE NEW STANDARD";
  const chars1 = text1.split("");
  const center1 = Math.floor(chars1.length / 2);

  const text2 = "FOR PAIR PROGRAMMING";
  const chars2 = text2.split("");
  const center2 = Math.floor(chars2.length / 2);

  const text3 = "AND INTERVIEWS";
  const chars3 = text3.split("");
  const center3 = Math.floor(chars3.length / 2);

  return (
    <ReactLenis root>
      <section className="relative w-full py-64 flex flex-col items-center bg-[#050505] z-10 overflow-hidden">
        
        {/* Background grain */}
        <div className="absolute inset-0 opacity-[0.03] bg-[url('/noise.png')] pointer-events-none mix-blend-overlay"></div>

        {/* Top Text - Hollow */}
        <div 
          ref={targetRef1}
          className="font-display text-[6vw] sm:text-[4vw] md:text-6xl lg:text-7xl font-black uppercase tracking-tighter leading-none text-center flex justify-center flex-wrap w-full max-w-6xl z-20 pointer-events-none mb-12 px-4"
          style={{ perspective: "500px" }}
        >
           {chars1.map((char, index) => (
             <CharacterAnim 
               key={`text1-${index}`} 
               char={char} 
               index={index} 
               centerIndex={center1} 
               scrollYProgress={scrollYProgress1} 
               isStroke={true}
             />
           ))}
        </div>

        {/* Center Text - Neon Outline */}
        <div 
          ref={targetRef2}
          className="font-display text-[8vw] sm:text-[6vw] md:text-7xl lg:text-8xl xl:text-9xl font-black italic uppercase tracking-tighter leading-none text-center flex justify-center flex-wrap w-full max-w-[95vw] z-20 pointer-events-none my-12 px-4" 
          style={{ perspective: "600px" }}
        >
           {chars2.map((char, index) => (
             <CharacterAnim 
               key={`text2-${index}`} 
               char={char} 
               index={index} 
               centerIndex={center2} 
               scrollYProgress={scrollYProgress2} 
               isStroke={false}
             />
           ))}
        </div>

        {/* Bottom Text - Hollow */}
        <div 
          ref={targetRef3}
          className="font-display text-[6vw] sm:text-[4vw] md:text-6xl lg:text-7xl font-black uppercase tracking-tighter leading-none text-center flex justify-center flex-wrap w-full max-w-6xl z-20 pointer-events-none mt-12 px-4"
          style={{ perspective: "500px" }}
        >
           {chars3.map((char, index) => (
             <CharacterAnim 
               key={`text3-${index}`} 
               char={char} 
               index={index} 
               centerIndex={center3} 
               scrollYProgress={scrollYProgress3} 
               isStroke={true}
             />
           ))}
        </div>

      </section>
    </ReactLenis>
  );
};
