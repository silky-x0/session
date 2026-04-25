import { Header } from "../components/landing/Header";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-hidden font-sans selection:bg-[#00FF41]/30">
      <Header />
      
      <main className="flex flex-col items-center justify-start pt-24 sm:pt-32 px-4 pb-24 relative z-10 gap-16 sm:gap-24 w-full">
        
        {/* Abstract Background Elements */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00FF41] rounded-full mix-blend-screen filter blur-[150px] opacity-10 pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#00FF41] rounded-full mix-blend-screen filter blur-[150px] opacity-5 pointer-events-none"></div>

        <div className="flex flex-col items-center gap-6 max-w-5xl text-center relative z-10 w-full px-2">
          <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-black leading-[0.95] tracking-tight uppercase flex flex-col items-center break-words max-w-full">
            <span className="text-transparent" style={{ WebkitTextStroke: "1px rgba(255, 255, 255, 0.4)" }}>
              The New Standard
            </span>
            <span className="text-[#00FF41] mt-2 italic">
              For Engineering
            </span>
          </h1>
          <p className="font-sans text-white/50 text-base max-w-xl leading-relaxed mt-4">
            Simple, transparent pricing to power your technical sessions. 
            No hidden fees, no complicated tiers.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl relative z-20">
          
          {/* Card 1 */}
          <div className="flex flex-col p-8 rounded-2xl border border-white/10 bg-[#050505]/50 backdrop-blur-sm hover:border-white/20 transition-all duration-300">
            <h3 className="text-white/70 text-sm font-semibold uppercase tracking-widest mb-2 font-mono">Starter</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-bold text-white">Free</span>
            </div>
            <div className="h-px w-full bg-white/5 mb-6"></div>
            <ul className="flex flex-col gap-4 flex-1">
              {['1 Active Room', 'Basic Networking', 'Standard Execution', 'Community Support'].map((ft, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-white/60">
                   <div className="w-1.5 h-1.5 rounded-full bg-white/20"></div>
                   {ft}
                </li>
              ))}
            </ul>
            <button className="mt-8 w-full py-3 rounded-lg border border-white/10 text-white/80 text-sm font-medium hover:bg-white border-white transition-colors duration-300 group">
              <span className="group-hover:text-black">Get Started</span>
            </button>
          </div>

          {/* Card 2 - Pro (Highlighted) */}
          <div className="flex flex-col p-8 rounded-2xl border border-[#00FF41]/40 bg-[#050505] shadow-[0_0_30px_rgba(0,255,65,0.1)] hover:shadow-[0_0_40px_rgba(0,255,65,0.2)] transition-all duration-300 relative transform md:-translate-y-4">
            <div className="absolute top-0 right-8 -translate-y-1/2 bg-[#00FF41] text-black text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
              Most Popular
            </div>
            <h3 className="text-[#00FF41] text-sm font-semibold uppercase tracking-widest mb-2 font-mono">Pro</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-bold text-white">$29</span>
              <span className="text-white/40 text-sm">/mo</span>
            </div>
            <div className="h-px w-full bg-[#00FF41]/20 mb-6"></div>
            <ul className="flex flex-col gap-4 flex-1">
              {['Unlimited Rooms', 'High-Performance Execution', 'Cloud Storage & History', 'Priority Support'].map((ft, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-white/80">
                   <svg className="w-4 h-4 text-[#00FF41]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                     <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                   </svg>
                   {ft}
                </li>
              ))}
            </ul>
            <button className="mt-8 w-full py-3 rounded-lg bg-[#00FF41] text-black text-sm font-bold shadow-[0_0_15px_rgba(0,255,65,0.4)] hover:brightness-110 transition-all duration-300">
              Go Pro
            </button>
          </div>

          {/* Card 3 */}
          <div className="flex flex-col p-8 rounded-2xl border border-white/10 bg-[#050505]/50 backdrop-blur-sm hover:border-white/20 transition-all duration-300">
            <h3 className="text-white/70 text-sm font-semibold uppercase tracking-widest mb-2 font-mono">Enterprise</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-bold text-white">Custom</span>
            </div>
            <div className="h-px w-full bg-white/5 mb-6"></div>
            <ul className="flex flex-col gap-4 flex-1">
              {['Custom SLA', 'Dedicated Infrastructure', 'SSO & Advanced Auth', '24/7 Dedicated Support'].map((ft, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-white/60">
                   <div className="w-1.5 h-1.5 rounded-full bg-white/20"></div>
                   {ft}
                </li>
              ))}
            </ul>
            <button className="mt-8 w-full py-3 rounded-lg border border-white/10 text-white/80 text-sm font-medium hover:bg-white border-white transition-colors duration-300 group">
              <span className="group-hover:text-black">Contact Sales</span>
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}
