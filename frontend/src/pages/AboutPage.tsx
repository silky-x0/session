
import { Header } from "../components/landing/Header";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-hidden font-sans selection:bg-[#00FF41]/30">
      <Header />
      
      <main className="flex flex-col items-center justify-start pt-24 sm:pt-32 px-4 pb-24 relative z-10 w-full">
        
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none opacity-30"></div>

        <div className="flex flex-col items-center gap-12 max-w-4xl text-center relative z-10 w-full mb-32 px-2">
          <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-black leading-[0.9] tracking-tight uppercase flex flex-col items-center gap-2 break-words max-w-full">
            <span className="text-white/40">Made in</span>
            <span className="text-[#00FF41] text-5xl sm:text-7xl md:text-8xl italic pr-2">
              Session
            </span>
            <span className="text-white/40">With Love</span>
          </h1>
          
          <p className="font-sans text-white/50 text-lg sm:text-xl max-w-2xl leading-relaxed">
            We built Session to scratch our own itch. A collaborative environment where code executes securely, pairing feels real, and distractions fade away.
          </p>
        </div>

        {/* Team / Story Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-6xl relative z-20">
          
          {[1, 2, 3, 4, 5, 6, 7, 8].map((item, index) => (
             <div key={index} className="aspect-square rounded-2xl border border-white/5 bg-[#050505] relative overflow-hidden group hover:border-white/10 transition-colors">
               <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                 <div className="text-xs text-white/60 font-mono tracking-wider uppercase">Team // {item}</div>
               </div>
               
               {/* Decorative corner accents */}
               <div className="absolute top-2 left-2 w-1.5 h-1.5 rounded-full bg-white/10 group-hover:bg-[#00FF41]/60 transition-colors"></div>
               <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-white/10 group-hover:bg-[#00FF41]/60 transition-colors"></div>
               <div className="absolute bottom-2 left-2 w-1.5 h-1.5 rounded-full bg-white/10 group-hover:bg-[#00FF41]/60 transition-colors"></div>
               <div className="absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full bg-white/10 group-hover:bg-[#00FF41]/60 transition-colors"></div>
             </div>
          ))}

        </div>

        {/* Closing Banner */}
        <div className="mt-40 flex flex-col items-center gap-8 text-center max-w-3xl px-2">
          <p className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.2em] text-[#00FF41]/80">The future of real-time coding</p>
          <h2 className="font-display text-3xl sm:text-5xl md:text-6xl font-bold uppercase tracking-tight text-white/90 leading-[1.1] break-words max-w-full">
            Ship outstanding sessions
            <br />
            <span className="text-[#00FF41] italic font-normal">From anywhere</span>
          </h2>
          
          {/* Main Logo Silhouette */}
          <div className="mt-16 opacity-10 blur-[1px]">
             <svg width="280" height="80" viewBox="0 0 170 28" fill="none" xmlns="http://www.w3.org/2000/svg">
               <g stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                 <path d="M16 5 C4 5 4 14 10 14 C16 14 16 23 4 23" />
                 <path d="M24 5 H36 M24 5 V23 H36 M24 14 H34" />
                 <path d="M56 5 C44 5 44 14 50 14 C56 14 56 23 44 23" />
                 <path d="M76 5 C64 5 64 14 70 14 C76 14 76 23 64 23" />
                 <path d="M86 5 V23" />
                 <path d="M126 23 V5 L140 23 V5" />
               </g>
             </svg>
          </div>
        </div>

      </main>
    </div>
  );
}
