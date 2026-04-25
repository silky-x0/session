import React from "react";
import { motion } from "framer-motion";

export const FinalCTA: React.FC = () => {
  return (
    <section className="relative w-full px-4 pt-64 pb-12 flex flex-col items-center bg-[#050505] z-10 overflow-hidden">
      
      {/* Huge Faded Brand Background Word */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] w-full flex justify-center pointer-events-none select-none z-0 overflow-hidden">
         <span className="font-display text-[25vw] md:text-[350px] font-black tracking-tighter uppercase text-white/[0.02]" style={{ WebkitTextStroke: "2px rgba(255,255,255,0.03)", color: "transparent" }}>
           SESSION
         </span>
      </div>

      <div className="flex flex-col items-center text-center gap-6 relative z-20 mb-48">
        
        <p className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.2em] text-[#00FF41]/80 mb-2">
          The future of engineering starts now
        </p>

        <h2 className="font-display text-4xl sm:text-5xl md:text-7xl font-bold uppercase tracking-tight text-white/90 leading-[1.05] max-w-4xl flex flex-col items-center gap-1 sm:gap-2">
          <span className="flex flex-wrap justify-center items-center gap-2 md:gap-4">
            Host Outstanding 
            <span className="text-transparent italic drop-shadow-[0_0_30px_rgba(0,255,65,0.4)]" style={{ WebkitTextStroke: "2px #00FF41" }}>
              Sessions
            </span>
          </span>
          <span className="flex items-center gap-3">
            From Anywhere
          </span>
        </h2>

        {/* Floating CTA Button */}
        <motion.button 
           whileHover={{ scale: 1.05 }}
           whileTap={{ scale: 0.95 }}
           className="mt-12 px-8 py-4 rounded-full bg-[#00FF41] text-black font-bold uppercase tracking-widest text-sm shadow-[0_0_30px_rgba(0,255,65,0.3)] hover:shadow-[0_0_50px_rgba(0,255,65,0.5)] transition-shadow"
        >
          Get Started Focus
        </motion.button>
      </div>

      {/* Modern Footer Row */}
      <div className="w-full max-w-7xl pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 relative z-20 px-4 md:px-0">
        
        {/* Left Links */}
        <div className="flex items-center gap-6 text-[10px] font-mono tracking-widest text-white/40 uppercase">
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors">Terms</a>
        </div>

        {/* Center Tagline */}
        <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-white/30 uppercase">
          MADE BY
          <svg width="60" height="10" viewBox="0 0 170 28" fill="none" className="opacity-60">
            <g stroke="#00FF41" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 5 C4 5 4 14 10 14 C16 14 16 23 4 23" />
              <path d="M24 5 H36 M24 5 V23 H36 M24 14 H34" />
              <path d="M56 5 C44 5 44 14 50 14 C56 14 56 23 44 23" />
              <path d="M76 5 C64 5 64 14 70 14 C76 14 76 23 64 23" />
              <path d="M86 5 V23" />
              <path d="M126 23 V5 L140 23 V5" />
            </g>
          </svg>
        </div>

        {/* Right Socials */}
        <div className="flex items-center gap-4 text-white/40">
           <a href="#" className="hover:text-[#00FF41] transition-colors" aria-label="X (Twitter)">
             <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
               <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
             </svg>
           </a>
           <a href="#" className="hover:text-[#00FF41] transition-colors" aria-label="GitHub">
             <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
             </svg>
           </a>
           <a href="#" className="hover:text-[#00FF41] transition-colors" aria-label="LinkedIn">
             <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
               <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
             </svg>
           </a>
        </div>
      </div>
    </section>
  );
};
