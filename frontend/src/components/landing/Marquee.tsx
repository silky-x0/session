import React from "react";

const LOGOS = [
  { name: "Airbnb", path: "/markeLOGO/airbnb.svg" },
  { name: "Apple", path: "/markeLOGO/apple-11.svg" },
  { name: "FedEx", path: "/markeLOGO/fedex-express-6.svg" },
  { name: "Google Pay", path: "/markeLOGO/google-pay-or-tez.svg" },
  { name: "Minecraft", path: "/markeLOGO/minecraft.svg" },
  { name: "Puma", path: "/markeLOGO/puma-logo.svg" },
  { name: "Red Bull", path: "/markeLOGO/redbullenergydrink.svg" },
];

const MarqueeItem = ({ logo }: { logo: { name: string; path: string } }) => (
  <div className='opacity-40 grayscale invert hover:grayscale-0 hover:invert-0 hover:opacity-100 transition-all duration-500 shrink-0 flex items-center justify-center px-6 sm:px-10 min-w-[120px] sm:min-w-[200px]'>
    <img
      src={logo.path}
      alt={`${logo.name} logo`}
      className='h-6 sm:h-8 w-auto object-contain pointer-events-none select-none'
    />
  </div>
);

export const Marquee: React.FC = () => {
  return (
    <section className='pt-6 sm:pt-8 lg:pt-12 pb-6 sm:pb-10 overflow-hidden w-full relative'>
      <h2 className='text-center font-bold font-sans uppercase text-[10px] sm:text-xs tracking-widest text-white/40 mb-2 sm:mb-4 px-4'>
        Trusted by top engineering teams
      </h2>


      <div className='flex w-full overflow-hidden mask-gradient relative'>
        <div 
          className='flex flex-nowrap min-w-max animate-marquee py-2 items-center'
          style={{ animationDuration: '30s' }}
        >
          {/* First set of logos */}
          {LOGOS.map((logo, idx) => (
            <MarqueeItem key={`logo-1-${idx}`} logo={logo} />
          ))}
          {/* Duplicate set for seamless -50% translation loop */}
          {LOGOS.map((logo, idx) => (
            <MarqueeItem key={`logo-2-${idx}`} logo={logo} />
          ))}
        </div>
      </div>
    </section>
  );
};
