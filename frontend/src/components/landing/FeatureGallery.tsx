import React from "react";
import { motion } from "framer-motion";

export const FeatureGallery: React.FC = () => {
  type CardData = { caption: string; sub: string };

  const CARDS: CardData[] = [
    { caption: "Remote Pairing", sub: "shared IDE, no latency" },
    { caption: "System Architecture", sub: "whiteboard + code side by side" },
    { caption: "Interview Sandbox", sub: "ai questions, live execution" },
    { caption: "Code Review", sub: "diff, annotate, discuss" },
    { caption: "Component Testing", sub: "run and preview instantly" },
    { caption: "Live Debugging", sub: "two cursors, one bug" },
    { caption: "Whiteboarding", sub: "draw, then implement" },
    { caption: "Team Sync", sub: "async to live in one click" },
  ];

  return (
    <section className='relative w-full px-4 pt-12 flex flex-col items-center bg-[#050505] z-10'>
      <div className='flex flex-col items-center text-center mb-16 z-20'>
        <span className='text-warning-amber font-mono text-xs tracking-[0.3em] uppercase mb-4 opacity-70'>
          built for every session
        </span>
        <h2 className='font-display text-3xl sm:text-4xl md:text-5xl font-bold uppercase tracking-widest flex flex-wrap justify-center items-center gap-3'>
          <span className='text-white/80'>One room.</span>
          <span className='text-white/40 mx-2'>/</span>
          <span className='text-cyber-cyan rounded-lg px-3 py-1 drop-shadow-[0_0_15px_rgba(0,240,255,0.4)] bg-cyber-cyan/10 border border-cyber-cyan/20'>
            every workflow.
          </span>
        </h2>
      </div>

      <div className='w-full max-w-7xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 relative z-20'>
        {CARDS.map((card, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{
              duration: 0.5,
              delay: Math.min(index * 0.08, 0.3),
              ease: "easeOut",
            }}
            className='group relative aspect-[4/3] rounded-2xl bg-[#0a0a0a] border border-white/10 overflow-hidden transform transition-all duration-300 hover:-translate-y-2 hover:border-white/30 cursor-pointer'
          >
            <div
              className='absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none'
              style={{ boxShadow: `0 20px 40px rgba(0, 240, 255, 0.15)` }}
            />

            <div className='absolute inset-0 bg-[#111111] group-hover:scale-105 transition-transform duration-700 ease-out overflow-hidden'>
              <div
                className='absolute inset-0 opacity-[0.04] group-hover:opacity-[0.08] transition-opacity duration-500'
                style={{
                  backgroundImage: `linear-gradient(rgba(0,240,255,0.8) 1px, transparent 1px),
                                     linear-gradient(90deg, rgba(0,240,255,0.8) 1px, transparent 1px)`,
                  backgroundSize: "24px 24px",
                }}
              />
            </div>

            <div className='absolute top-4 left-4 flex flex-col gap-1'>
              <span className='text-[10px] font-mono tracking-widest uppercase bg-[#050505]/80 px-2 py-1 rounded backdrop-blur-sm border border-white/5 text-cyber-cyan group-hover:border-cyber-cyan/30 transition-colors duration-300'>
                {card.caption}
              </span>
              <span className='text-[9px] font-mono text-white/30 group-hover:text-white/50 transition-colors duration-300 px-1'>
                {card.sub}
              </span>
            </div>

            <div className='absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0'>
              <div className='flex items-center gap-1.5 text-cyber-cyan'>
                <span className='text-[9px] font-mono tracking-widest uppercase'>
                  open
                </span>
                <svg
                  width='10'
                  height='10'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='#00F0FF'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <path d='M5 12h14M12 5l7 7-7 7' />
                </svg>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
