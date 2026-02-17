import React from "react";
import { SessionInput } from "./SessionInput";

export const Hero: React.FC = () => {
  return (
    <section className='flex flex-col items-center justify-center min-h-[85vh] sm:min-h-[60vh] lg:min-h-[65vh] pt-20 sm:pt-20 lg:pt-25 px-4 relative z-10 gap-10 sm:gap-12'>
      <div className='flex flex-col items-center gap-5 sm:gap-6 max-w-4xl text-center'>
        {/* Main Heading */}
        <h1 className='flex flex-col items-center gap-0 font-display text-[40px] sm:text-5xl md:text-6xl lg:text-[64px] font-bold leading-[1.1] sm:leading-[0.95] tracking-tight lowercase'>
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
        <p className='font-sans text-text-secondary text-sm sm:text-base max-w-[320px] sm:max-w-lg leading-relaxed px-2'>
          Session is a real-time collaborative coding environment built for pair
          programming, interviews, and focused technical discussions with audio,
          video, and live execution.
        </p>
      </div>

      {/* Input — naturally flows after text with gap */}
      <div className='w-full flex justify-center mt-4 sm:mt-0'>
        <SessionInput />
      </div>
    </section>
  );
};
