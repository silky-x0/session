import React from "react";
import { motion } from "framer-motion";

export const EditorShowcase: React.FC = () => {
  return (
    <section className="relative w-full px-4 pt-32 pb-16 flex flex-col items-center bg-[#050505] z-10 overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-[#00FF41]/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Headlines */}
      <div className="flex flex-col items-center text-center gap-4 mb-20 relative z-20">
        <h2 className="font-display text-5xl md:text-7xl font-black leading-[1.0] tracking-tight uppercase flex flex-col items-center">
          <span className="text-white/90">First AI-Native</span>
          <span className="text-transparent mt-2" style={{ WebkitTextStroke: "2px #00FF41", filter: "drop-shadow(0 0 15px rgba(0,255,65,0.4))" }}>
            Collaborative IDE
          </span>
        </h2>
        <p className="font-sans text-white/50 text-base md:text-lg max-w-xl mx-auto mt-2">
          Create sessions, execute code, and pair program faster than ever before.
        </p>
      </div>

      {/* Product Mockup Panel */}
      <div 
        className="w-full max-w-6xl relative z-20 rounded-[2rem] border border-white/10 bg-black/60 backdrop-blur-2xl shadow-[0_0_80px_rgba(0,255,65,0.1)] overflow-hidden flex flex-col"
      >
        {/* Mock OS Header */}
        <div className="flex items-center px-6 py-4 border-b border-white/5 bg-white/5 gap-2">
          <div className="w-3 h-3 rounded-full bg-white/20"></div>
          <div className="w-3 h-3 rounded-full bg-white/20"></div>
          <div className="w-3 h-3 rounded-full bg-white/20"></div>
          <div className="mx-auto text-[10px] uppercase tracking-widest font-mono text-white/40">Session // Editor-V1</div>
        </div>

        {/* 3-Column Mockup Interface */}
        <div className="flex w-full h-[500px] md:h-[600px] relative">
          
          {/* Left Sidebar (Files / Sections) */}
          <div className="w-64 border-r border-white/5 p-4 flex-col gap-4 hidden md:flex">
             <div className="text-xs uppercase tracking-widest text-[#00FF41] font-mono mb-4 border-b border-white/5 pb-2">Workspace</div>
             
             {['main.py', 'utils.py', 'app.ts', 'server.js', 'package.json'].map((file, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-white/50 hover:text-white/80 cursor-default transition-colors">
                  <div className="w-4 h-4 rounded-sm border border-white/20"></div>
                  {file}
                </div>
             ))}
          </div>

          {/* Center Main Canvas */}
          <div className="flex-1 bg-[#0a0a0a] relative overflow-hidden flex items-center justify-center p-8">
             <div className="w-full h-full border border-white/10 rounded-xl bg-black flex flex-col relative">
                {/* Code Lines Mock */}
                <div className="p-6 font-mono text-sm leading-loose w-full max-w-full overflow-hidden text-white/40 select-none">
                  <div className="flex gap-4"><span className="text-white/20">1</span><span className="text-pink-500">import</span> <span className="text-blue-300">React</span> <span className="text-pink-500">from</span> <span className="text-green-300">"react"</span>;</div>
                  <div className="flex gap-4"><span className="text-white/20">2</span></div>
                  <div className="flex gap-4"><span className="text-white/20">3</span><span className="text-pink-500">export const</span> <span className="text-blue-300">MockComponent</span> = () =&gt; {'{'}</div>
                  <div className="flex gap-4 pl-4"><span className="text-white/20">4</span><span className="text-[#00FF41]">console</span>.log(<span className="text-green-300">"Real-time execution running..."</span>);</div>
                  <div className="flex gap-4 pl-4"><span className="text-white/20">5</span><span className="text-pink-500">return</span> (</div>
                  <div className="flex gap-4 pl-8"><span className="text-white/20">6</span>&lt;<span className="text-blue-400">div</span> <span className="text-yellow-200">className</span>=<span className="text-green-300">"absolute inset-0"</span>&gt;</div>
                  <div className="flex gap-4 pl-12"><span className="text-white/20">7</span>Collaborative IDE </div>
                  <div className="flex gap-4 pl-8"><span className="text-white/20">8</span>&lt;/<span className="text-blue-400">div</span>&gt;</div>
                  <div className="flex gap-4 pl-4"><span className="text-white/20">9</span>);</div>
                  <div className="flex gap-4"><span className="text-white/20">10</span>{'}'};</div>
                </div>

                {/* Floating cursor mock */}
                <motion.div 
                  className="absolute top-1/2 left-1/3 flex flex-col items-start pointer-events-none"
                  animate={{ x: [0, 50, 20, 0], y: [0, 20, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <svg width="18" height="19" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-md origin-top-left z-10">
                    <path d="M1.2001 0.700012L15.3001 6.80001L8.7001 9.40001L6.1001 16L1.2001 0.700012Z" fill="#00FF41" stroke="white" strokeWidth="1.2" strokeLinejoin="round"/>
                  </svg>
                  <div className="bg-[#00FF41] text-black text-[10px] font-bold px-2 py-0.5 rounded-sm rounded-tl-none whitespace-nowrap shadow-lg ml-3 mt-0.5">Guest User</div>
                </motion.div>
             </div>
          </div>

          {/* Right Properties Panel (Terminal/Console) */}
          <div className="w-64 border-l border-white/5 bg-[#050505] p-4 flex-col gap-4 hidden lg:flex relative">
             <div className="text-xs uppercase tracking-widest text-white/50 font-mono mb-4 border-b border-white/5 pb-2">Terminal Output</div>
             
             <div className="font-mono text-xs text-white/40 space-y-3">
               <div>&gt; Build started...</div>
               <div className="text-[#00FF41]">&gt; Compilation successful (0ms)</div>
               <div>&gt; Listening on port 3000</div>
               <div className="w-1/2 h-2 bg-white/10 mt-6 rounded-full animate-pulse"></div>
               <div className="w-3/4 h-2 bg-white/10 mt-2 rounded-full animate-pulse"></div>
               <div className="w-2/3 h-2 bg-white/10 mt-2 rounded-full animate-pulse"></div>
             </div>

             <div className="absolute bottom-6 left-4 right-4">
               <button className="w-full bg-white/5 border border-white/10 rounded-lg py-2 text-xs font-mono text-white/60 hover:text-white hover:bg-white/10 transition-colors">
                  Clear Output
               </button>
             </div>
          </div>

        </div>
      </div>

    </section>
  );
};
