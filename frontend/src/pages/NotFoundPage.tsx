import React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col relative overflow-hidden font-sans">
      {/* Background grain texture */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('/noise.png')] pointer-events-none mix-blend-overlay"></div>

      {/* Top Status Label */}
      <div className="p-8 sm:p-12 z-20">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-white/40">
            404 ERROR. PAGE NOT FOUND
          </span>
        </div>
      </div>

      {/* Main Narrative Area */}
      <div className="flex-1 flex flex-col justify-start px-8 sm:px-12 pt-8 sm:pt-16 z-20 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold leading-[1.1] tracking-tight mb-12">
            If you're reading this, <br />
            this page has literally <br />
            <span className="text-cyber-cyan italic">ghosted us fr fr.</span>
          </h1>

          <a 
            href="/" 
            className="group flex items-center gap-3 px-6 py-4 bg-white/5 border border-white/10 rounded-xl w-fit hover:bg-white/10 hover:border-white/20 transition-all duration-300 backdrop-blur-sm"
          >
            <span className="text-sm font-medium tracking-wide">Return home</span>
            <ArrowUpRight size={20} className="text-white/30 group-hover:text-cyber-cyan group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </a>
        </motion.div>
      </div>

      {/* Massive Layered "404" Background Effect */}
      <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-full select-none pointer-events-none z-10 flex flex-col items-center">
        <div className="relative w-full flex flex-col items-center">
          {/* Top Sliced Layer (Darkest) */}
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 0.15 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-[40vw] font-black leading-[0.7] text-white h-[15vw] overflow-hidden"
          >
            404
          </motion.div>
          
          {/* Middle Sliced Layer (Medium) */}
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 0.4 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-[40vw] font-black leading-[0.7] text-white h-[15vw] overflow-hidden"
          >
            404
          </motion.div>
          
          {/* Bottom Full Layer (Brightest) */}
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 0.9 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="text-[40vw] font-black leading-[0.7] text-white"
          >
            404
          </motion.div>
        </div>
      </div>
      
      {/* Ambient Cyber-Cyan Glow in corner */}
      <div className="absolute -bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-cyber-cyan/5 rounded-full blur-[120px] -z-10" />
    </div>
  );
};

export default NotFoundPage;
