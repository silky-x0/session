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
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Floating "Run Code" Button - Centered but maybe we don't need it here if Hero has it, 
            but original design had a floating button. We'll keep it near the input or remove if it clashes. 
            For now, removing the central overlay button as it might be redundant with the new Hero layout, 
            or we can position it specifically if requested. 
        */}

        {/* 
            Positioning "cards" around the center. 
            We assume the hero text is in the absolute center.
        */}
        
        {/* Top Left - Large, tilted left */}
        <div className="absolute top-[10%] left-[5%] w-[300px] md:w-[500px] aspect-video rounded-xl overflow-hidden shadow-2xl border border-white/5 -rotate-6 opacity-40 blur-[1px]">
            <img src={placeholders[0]} alt="Visual 1" className="w-full h-full object-cover grayscale opacity-60" />
        </div>

        {/* Top Right - Medium, tilted right */}
        <div className="absolute top-[5%] right-[5%] w-[250px] md:w-[400px] aspect-video rounded-xl overflow-hidden shadow-2xl border border-white/5 rotate-12 opacity-30">
            <img src={placeholders[1]} alt="Visual 2" className="w-full h-full object-cover grayscale opacity-60" />
        </div>

        {/* Middle Left - Small, heavy tilt */}
        <div className="absolute top-[45%] -left-[5%] w-[200px] md:w-[300px] aspect-video rounded-xl overflow-hidden shadow-2xl border border-white/5 rotate-[15deg] opacity-20 blur-[2px]">
            <img src={placeholders[2]} alt="Visual 3" className="w-full h-full object-cover grayscale opacity-50" />
        </div>

        {/* Middle Right - Large, slight tilt */}
        <div className="absolute top-[40%] -right-[5%] w-[300px] md:w-[550px] aspect-video rounded-xl overflow-hidden shadow-2xl border border-white/5 -rotate-3 opacity-40">
            <img src={placeholders[3]} alt="Visual 4" className="w-full h-full object-cover grayscale opacity-70" />
        </div>

        {/* Bottom Left - Medium */}
        <div className="absolute bottom-[5%] left-[10%] w-[250px] md:w-[400px] aspect-video rounded-xl overflow-hidden shadow-2xl border border-white/5 rotate-3 opacity-30">
            <img src={placeholders[4]} alt="Visual 5" className="w-full h-full object-cover grayscale opacity-60" />
        </div>

        {/* Bottom Right - Small */}
        <div className="absolute bottom-[10%] right-[15%] w-[200px] md:w-[350px] aspect-video rounded-xl overflow-hidden shadow-2xl border border-white/5 -rotate-12 opacity-20 blur-[1px]">
            <img src={placeholders[5]} alt="Visual 6" className="w-full h-full object-cover grayscale opacity-50" />
        </div>
        
        {/* Gradient fade to integrate with background */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1c1c1c] via-transparent to-[#1c1c1c] z-10 pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#1c1c1c] via-transparent to-[#1c1c1c] z-10 pointer-events-none"></div>
    </div>
  );
};
