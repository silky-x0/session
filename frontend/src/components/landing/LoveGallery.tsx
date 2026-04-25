import React from "react";
import { motion } from "framer-motion";

export const LoveGallery: React.FC = () => {
  const captions = [
    "Remote Pairing", "System Architecture", "Interview Sandbox", "Code Review",
    "Component Testing", "Live Debugging", "Whiteboarding", "Team Sync"
  ];

  return (
    <section className="relative w-full px-4 pt-32 pb-32 flex flex-col items-center bg-[#050505] z-10">
      
      {/* Title */}
      <div className="flex flex-col items-center text-center mb-16 z-20">
        <span className="text-warning-amber font-mono text-xs tracking-[0.3em] uppercase mb-4 opacity-70">
          From Sandbox to Production
        </span>
        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold uppercase tracking-widest flex flex-wrap justify-center items-center gap-3">
          <span className="text-white/80">One</span>
          <span className="text-voltage-violet rounded-lg px-3 py-1 drop-shadow-[0_0_15px_rgba(188,0,255,0.4)] bg-voltage-violet/10 border border-voltage-violet/20">Platform</span>
          <span className="text-white/40 mx-2">/</span>
          <span className="text-white/80">Every Workflow</span>
        </h2>
      </div>

      {/* 2x4 Responsive Grid */}
      <div className="w-full max-w-7xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 relative z-20">
        
        {/* Gallery Cards - Unified Cyber-Cyan */}
        {captions.map((caption, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
            className="group relative aspect-[4/3] rounded-2xl bg-[#0a0a0a] border border-white/10 overflow-hidden transform transition-all duration-300 hover:-translate-y-2 hover:border-white/30 cursor-pointer"
          >
             {/* Unified Cyber-Cyan Hover Shadow */}
             <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" 
                  style={{ boxShadow: `0 20px 40px rgba(0, 240, 255, 0.15)` }} />

             {/* Subdued Image Placeholder background */}
             <div className="absolute inset-0 bg-[#111111] group-hover:scale-105 transition-transform duration-700 ease-out flex items-center justify-center overflow-hidden">
                <div className="w-full h-full opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/20 via-[#050505] to-[#050505]"></div>
                {/* Mock abstract geometric element */}
                <div className="absolute w-1/2 h-1/2 border border-white/5 rotate-12 group-hover:rotate-45 transition-transform duration-1000 origin-center rounded-lg"></div>
             </div>

             {/* Caption Top-Left - Consistent Cyan */}
             <div className="absolute top-4 left-4">
                <span className="text-[10px] font-mono tracking-widest uppercase bg-[#050505]/80 px-2 py-1 rounded backdrop-blur-sm border border-white/5 text-cyber-cyan group-hover:border-cyber-cyan/30 transition-colors duration-300">
                  {caption}
                </span>
             </div>
             
             {/* Hover indicator bottom right - Consistent Cyan */}
             <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
               <div className="w-6 h-6 rounded-full bg-cyber-cyan/20 flex items-center justify-center">
                 <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#00F0FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                   <path d="M5 12h14M12 5l7 7-7 7" />
                 </svg>
               </div>
             </div>
          </motion.div>
        ))}
        
      </div>
    </section>
  );
};
