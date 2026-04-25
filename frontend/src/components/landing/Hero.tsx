import React from "react";
import { SessionInput } from "./SessionInput";
import { LinkPreview } from "../ui/link-preview";

export const Hero: React.FC = () => {
  return (
    <section className='flex flex-col items-center justify-center min-h-[75vh] sm:min-h-[55vh] lg:min-h-[60vh] pt-12 sm:pt-16 lg:pt-20 px-4 relative z-10 gap-10 sm:gap-12'>
      <div className='flex flex-col items-center gap-5 sm:gap-6 max-w-4xl text-center'>
        {/* Main Heading */}
        <h1 className='flex flex-col items-center gap-0 font-display text-4xl sm:text-5xl md:text-[56px] font-bold leading-[1.1] sm:leading-[0.95] tracking-tight lowercase'>
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

          <span className='text-outline'>that matters</span>
        </h1>

        {/* Subheading */}
        <p className='font-sans text-white/50 text-sm sm:text-base max-w-[320px] sm:max-w-lg leading-relaxed px-2'>
          Session is a{" "}
          <LinkPreview url="#" isStatic imageSrc="/realtime.mp4" className="text-cyber-cyan/70 hover:text-cyber-cyan transition-colors font-semibold">real-time</LinkPreview>{" "}
          collaborative coding environment built for{" "}
          <LinkPreview url="#" isStatic imageSrc="/realtime.mp4" className="text-cyber-cyan/70 hover:text-cyber-cyan transition-colors font-semibold">pair programming</LinkPreview>
          ,{" "}
          <LinkPreview url="#" isStatic imageSrc="/cale.mp4" className="text-cyber-cyan/70 hover:text-cyber-cyan transition-colors font-semibold">interviews</LinkPreview>
          , and focused technical discussions with audio, video, and 
          {" "}
          <LinkPreview url="#" isStatic imageSrc="/livexec.mp4" className="text-cyber-cyan/70 hover:text-cyber-cyan transition-colors font-semibold">live execution</LinkPreview>
          .
        </p>
      </div>

      {/* Input — naturally flows after text with gap */}
      <div className='w-full flex justify-center mt-4 sm:mt-0'>
        <SessionInput />
      </div>
    </section>
  );
};
