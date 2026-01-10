import React from "react";
import { SessionInput } from "./SessionInput";


export const Hero: React.FC = () => {
  return (
    <section className='flex flex-col items-center justify-center min-h-[65vh] pt-25 px-4 relative z-10'>
      <div className='flex flex-col items-center gap-6 max-w-4xl text-center'>
        {/* Main Heading */}
        <h1 className='flex flex-col items-center gap-0 font-display text-4xl md:text-5xl lg:text-[64px] font-bold leading-[0.95] tracking-tight lowercase'>
          <span className='text-outline'>real-time</span>

          <span className='text-white font-normal italic my-1 -tracking-[0.02em]'>
            coding{" "}
            <span
              className='text-stroke-green text-transparent'
              style={{ WebkitTextStroke: "1px #00FF41" }}
            >
              session
            </span>
          </span>

          <span className='text-outline'>that matter</span>
        </h1>

        {/* Subheading */}
        <p className='font-sans text-text-secondary text-base max-w-lg leading-relaxed'>
          Session is a real-time collaborative coding environment built for pair
          programming, interviews, and focused technical discussions with audio,
          video, and live execution.
        </p>

        {/* Input Form Area */}
        <SessionInput />
      </div>
    </section>
  );
};
