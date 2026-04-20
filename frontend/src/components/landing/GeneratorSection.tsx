import React from "react";
import { motion } from "framer-motion";

export const GeneratorSection: React.FC = () => {
  return (
    <section className="relative w-full px-4 pt-24 pb-32 flex flex-col items-center bg-transparent z-10">
      
      {/* Heavy Headline */}
      <div className="flex flex-col items-center text-center gap-1 mb-12 relative z-20">
        <h2 className="font-sans text-3xl md:text-5xl font-medium tracking-wide text-white uppercase">
          Everything to host
        </h2>
        <h2 
          className="font-display text-5xl md:text-7xl font-black uppercase tracking-widest mt-1"
          style={{ 
            color: "transparent", 
            WebkitTextStroke: "2px #00FF41",
            textShadow: "0 0 10px rgba(0,255,65,0.1)"
          }}
        >
          Awesome Sessions
        </h2>
      </div>

      {/* Tabbed Mini Navigation */}
      <div className="flex flex-wrap items-center justify-center gap-6 mb-16 relative z-20">
        {[
          { label: "INITIALIZATION", active: true },
          { label: "EXECUTION", active: false },
          { label: "MULTIPLAYER", active: false },
          { label: "INTEGRATION", active: false },
          { label: "REVIEW", active: false }
        ].map((tab, idx) => (
          <button
            key={idx}
            className={`px-4 py-1.5 rounded-full text-[10px] font-mono font-semibold uppercase tracking-widest transition-all duration-300 ${
              tab.active 
                ? "bg-[#1c1c1c] text-white/90" 
                : "bg-transparent text-white/40 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Two Column Layout container */}
      <div className="w-full max-w-6xl relative z-20 flex flex-col md:flex-row items-center justify-center gap-10 md:gap-32">
        
        {/* Left Card: Generator UI */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full md:w-[600px] h-[500px] bg-[#111111] rounded-[24px] border border-white/5 relative overflow-hidden shadow-2xl"
        >
           {/* Decorative right border line inside box */}
           <div className="absolute right-32 top-0 bottom-0 w-px bg-[#00FF41]/30"></div>

           {/* Top abstract mock UI elements */}
           <div className="absolute top-6 left-6 flex items-center gap-2">
              <div className="w-6 h-3 rounded bg-white/5"></div>
              <div className="w-12 h-3 rounded bg-white/5"></div>
              <div className="w-10 h-3 rounded bg-white/5"></div>
           </div>
           
           <div className="absolute top-6 right-6 flex items-center gap-3">
              <span className="text-[#00FF41] text-[10px] font-bold">+ 330</span>
              <div className="w-5 h-5 rounded-full bg-white/10"></div>
              <div className="px-3 py-1 bg-white/5 rounded-full text-[10px] text-white/30 hidden sm:block">Publish</div>
           </div>

           {/* Wireframe bg elements */}
           <div className="absolute top-16 left-6 flex gap-4 w-[60%]">
              <div className="w-16 h-4 bg-white/5 rounded"></div>
              <div className="w-16 h-4 bg-white/5 rounded"></div>
              <div className="w-16 h-4 bg-white/5 rounded"></div>
           </div>
           <div className="absolute bottom-10 left-6 w-48 h-10 bg-white/5 rounded"></div>
           <div className="absolute bottom-24 left-6 w-32 h-2 bg-white/5 rounded"></div>
           <div className="absolute bottom-6 right-40 w-32 h-40 bg-white/5 rounded-xl"></div>


           {/* Center Content */}
           <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex flex-col items-center">
             <h3 className="text-xl sm:text-2xl font-medium text-white mb-1">
               Generating
             </h3>
             <h3 className="text-xl sm:text-2xl font-medium text-[#00FF41] mb-6">
               your environment
             </h3>

             <div className="flex flex-col gap-2 relative left-6">
               <div className="flex items-center gap-3">
                 <svg width="12" height="12" viewBox="0 0 24 24" fill="#00FF41" className="shrink-0"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                 <span className="text-[10px] sm:text-xs text-white uppercase tracking-wider font-semibold">Configuring container</span>
               </div>
               <div className="flex items-center gap-3">
                 <svg width="12" height="12" viewBox="0 0 24 24" fill="#00FF41" className="shrink-0"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                 <span className="text-[10px] sm:text-xs text-white uppercase tracking-wider font-semibold">Mounting file system</span>
               </div>
               <div className="flex items-center gap-3 opacity-30 mt-1">
                 <span className="text-[10px] sm:text-xs text-white uppercase tracking-wider pl-6">Booting workspace</span>
               </div>
               <div className="flex items-center gap-3 opacity-30 mt-1">
                 <span className="text-[10px] sm:text-xs text-white uppercase tracking-wider pl-6">Establishing WebSocket</span>
               </div>
               <div className="flex items-center gap-3 opacity-30 mt-1">
                 <span className="text-[10px] sm:text-xs text-white uppercase tracking-wider pl-6">Final touches</span>
               </div>
             </div>
           </div>
        </motion.div>

        {/* Right Card: Sticky Note */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.2, type: "spring", bounce: 0.4 }}
          className="relative w-full max-w-[380px]"
        >
           {/* Tilted Sticky Card */}
           <div className="bg-[#1a1a1a] rounded-[24px] p-8 sm:p-10 shadow-[0_20px_40px_rgba(0,0,0,0.5)] transform rotate-2">
             <h4 className="font-sans text-xl sm:text-2xl font-medium tracking-wide uppercase mb-4 leading-snug">
               <span className="text-white">Your perfect environment,</span>
               <br />
               <span className="text-white/40">Ready in seconds</span>
             </h4>
             <p className="text-white/60 text-sm leading-relaxed">
               Type a thought, drop a brief, or paste a repository
               — get a fully-configured multiplayer coding session tuned to your framework and needs.
             </p>
           </div>

           {/* Curved Arrow Pointing Left */}
           <motion.div 
              className="absolute -left-20 -bottom-16 hidden lg:block"
           >
             <svg width="150" height="120" viewBox="0 0 150 120" fill="none" xmlns="http://www.w3.org/2000/svg">
               <path d="M130 10 C 130 80, 80 100, 20 100" stroke="#00FF41" strokeWidth="2" strokeLinecap="round" />
               <path d="M35 85 L 15 100 L 25 115" stroke="#00FF41" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
             </svg>
           </motion.div>
        </motion.div>

      </div>
    </section>
  );
};
