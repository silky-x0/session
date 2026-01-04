import React from 'react';

// Using placeholder images for now, can be replaced with real assets later.
const placeholders = [
  "https://placehold.co/600x400/1f1f1f/FFF?text=Code+Editor+1",
  "https://placehold.co/600x400/2a2a2a/FFF?text=Terminal+View",
  "https://placehold.co/600x400/151515/FFF?text=Collab+Cursor",
  "https://placehold.co/600x400/333333/FFF?text=Debug+Panel",
  "https://placehold.co/600x400/222222/FFF?text=Git+Graph",
  "https://placehold.co/600x400/111111/FFF?text=Deploy+Logs",
];

export const ImageGrid: React.FC = () => {
  return (
    <section className="relative w-full py-20 overflow-hidden">
        {/* Floating "Run Code" Button Overlay */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
             <button className="flex items-center gap-2 px-5 py-3 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white font-condensed font-bold uppercase tracking-wider shadow-2xl hover:bg-white/20 transition-all group">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-session-green">
                    <path d="M5 3l14 9-14 9V3z" />
                </svg>
                Run Code
             </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 px-4 opacity-50 relative z-10 scale-110 pointer-events-none select-none">
            {placeholders.map((src, i) => (
                <div key={i} className="rounded-xl overflow-hidden shadow-2xl border border-white/5">
                    <img src={src} alt={`Visual ${i}`} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" />
                </div>
            ))}
        </div>
        
        {/* Gradient fade to integrate with background */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1c1c1c] via-transparent to-[#1c1c1c] z-10"></div>
    </section>
  );
};
