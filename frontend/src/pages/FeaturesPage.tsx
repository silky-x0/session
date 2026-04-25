
import { Header } from "../components/landing/Header";

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-hidden font-sans selection:bg-[#00FF41]/30">
      <Header />
      
      <main className="flex flex-col items-center justify-start pt-24 sm:pt-32 px-4 pb-24 relative z-10 gap-16 sm:gap-24 w-full">
        
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-50"></div>
        
        {/* Hero Section of Features */}
        <div className="flex flex-col items-center gap-6 max-w-5xl text-center relative z-10 w-full">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-4 shadow-[0_0_15px_rgba(0,255,65,0.15)]">
            <span className="w-2 h-2 rounded-full bg-[#00FF41] animate-pulse"></span>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-white/80">Features Overview</span>
          </div>
          
          <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-black leading-[0.95] tracking-tight uppercase flex flex-col items-center text-center break-words max-w-full">
            <span className="text-white/90">First AI-Native</span>
            <span className="text-transparent" style={{ WebkitTextStroke: "1px #00FF41" }}>
              Collaborative IDE
            </span>
          </h1>
          
          <p className="font-sans text-white/50 text-base sm:text-lg max-w-2xl leading-relaxed mt-4">
            Experience real-time pairing with built-in execution, seamless video integration, and an intelligent assistant that anticipates your next move.
          </p>
        </div>

        {/* Massive Editor Placeholder */}
        <div className="relative w-full max-w-6xl mx-auto mt-8 z-20">
          <div className="absolute -inset-1 bg-gradient-to-r from-[#00FF41]/20 to-transparent blur-2xl rounded-[32px] opacity-70"></div>
          
          <div className="relative aspect-[16/9] md:aspect-[21/9] w-full rounded-2xl md:rounded-[32px] overflow-hidden border border-[#00FF41]/30 bg-black/80 backdrop-blur-xl shadow-[0_0_50px_rgba(0,255,65,0.1)] flex items-center justify-center group">
            
            {/* Minimalist OS header for IDE */}
            <div className="absolute top-0 left-0 right-0 h-10 border-b border-white/5 bg-white/5 flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-white/20"></div>
              <div className="w-3 h-3 rounded-full bg-white/20"></div>
              <div className="w-3 h-3 rounded-full bg-white/20"></div>
            </div>

            <div className="flex flex-col items-center gap-4 mt-10">
              <div className="w-16 h-16 rounded-2xl bg-[#00FF41]/10 border border-[#00FF41]/20 flex items-center justify-center shadow-[0_0_20px_rgba(0,255,65,0.2)] group-hover:scale-110 transition-transform duration-500">
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00FF41" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                   <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                   <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                   <line x1="12" y1="22.08" x2="12" y2="12"></line>
                 </svg>
              </div>
              <span className="text-[#00FF41] font-mono text-sm tracking-widest uppercase">Editor Instance</span>
            </div>
          </div>

          {/* Floating Feature Cards */}
          <div className="absolute -left-10 md:-left-20 top-1/4 w-48 md:w-64 p-4 rounded-xl bg-[#050505] border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.8)] -rotate-6 hidden lg:block transform transition-transform hover:-rotate-3">
             <div className="text-xs text-white/50 mb-2 font-mono uppercase tracking-wider">Live Execution</div>
             <div className="h-1.5 w-3/4 bg-white/10 rounded-full mb-2"></div>
             <div className="h-1.5 w-1/2 bg-[#00FF41]/60 rounded-full"></div>
          </div>

          <div className="absolute -right-10 md:-right-16 bottom-1/4 w-56 md:w-72 p-5 rounded-xl bg-[#050505] border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.8)] rotate-3 hidden lg:block transform transition-transform hover:rotate-6">
             <div className="flex items-center gap-3 mb-3">
               <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[10px]">A</div>
               <div className="flex-1">
                 <div className="h-2 w-full bg-white/10 rounded-full mb-1"></div>
                 <div className="h-2 w-2/3 bg-white/5 rounded-full"></div>
               </div>
             </div>
             <div className="text-[#00FF41] text-[10px] uppercase tracking-widest font-bold">Multiplayer Active</div>
          </div>
        </div>

        {/* Secondary Title */}
        <div className="mt-20 flex flex-col items-center gap-4 text-center px-2">
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold uppercase tracking-tight text-white/90 break-words max-w-full">
            Everything to ship <br/>
            <span className="text-[#00FF41] italic font-normal">awesome sessions</span>
          </h2>
        </div>

      </main>
    </div>
  );
}
