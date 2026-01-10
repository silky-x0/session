import React from 'react';

// Using a simplified list of logo SVGs as "companies"
const MarqueeItem = ({ children }: { children: React.ReactNode }) => (
  <span className="mx-6 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300">
    {children}
  </span>
);

export const Marquee: React.FC = () => {
  return (
    <section className="pt-24 pb-10 py-6 overflow-hidden w-full relative">
      <h2 className="text-center font-bold font-sans uppercase text-xs tracking-widest text-white/40 mb-6">
        Trusted by top engineering teams
      </h2>
      
      <div className="flex w-full overflow-hidden mask-gradient">
        {/* We need duplicate content for the infinite scroll illusion */}
        <div className="flex whitespace-nowrap animate-marquee">
            {/* Placeholder SVGs for logos */}
            <MarqueeItem><SvgLogo1 /></MarqueeItem>
            <MarqueeItem><SvgLogo2 /></MarqueeItem>
            <MarqueeItem><SvgLogo3 /></MarqueeItem>
            <MarqueeItem><SvgLogo4 /></MarqueeItem>
            <MarqueeItem><SvgLogo5 /></MarqueeItem>
            <MarqueeItem><SvgLogo1 /></MarqueeItem>
            <MarqueeItem><SvgLogo2 /></MarqueeItem>
            <MarqueeItem><SvgLogo3 /></MarqueeItem>
            <MarqueeItem><SvgLogo4 /></MarqueeItem>
            <MarqueeItem><SvgLogo5 /></MarqueeItem>
        </div>
        <div className="flex whitespace-nowrap animate-marquee" aria-hidden="true">
            <MarqueeItem><SvgLogo1 /></MarqueeItem>
            <MarqueeItem><SvgLogo2 /></MarqueeItem>
            <MarqueeItem><SvgLogo3 /></MarqueeItem>
            <MarqueeItem><SvgLogo4 /></MarqueeItem>
            <MarqueeItem><SvgLogo5 /></MarqueeItem>
            <MarqueeItem><SvgLogo1 /></MarqueeItem>
            <MarqueeItem><SvgLogo2 /></MarqueeItem>
            <MarqueeItem><SvgLogo3 /></MarqueeItem>
            <MarqueeItem><SvgLogo4 /></MarqueeItem>
            <MarqueeItem><SvgLogo5 /></MarqueeItem>
        </div>
      </div>
    </section>
  );
};

// Simple placeholder SVGs to mimic the "tech logo" look
const SvgLogo1 = () => (
    <svg width="80" height="24" viewBox="0 0 100 32" fill="currentColor">
        <path d="M10 16a6 6 0 100-12 6 6 0 000 12zm10 0h60v-4h-60v4z" />
    </svg>
)
const SvgLogo2 = () => (
    <svg width="80" height="24" viewBox="0 0 100 32" fill="currentColor">
        <rect x="5" y="5" width="20" height="20" rx="5" />
        <rect x="35" y="10" width="60" height="10" />
    </svg>
)
const SvgLogo3 = () => (
    <svg width="80" height="24" viewBox="0 0 100 32" fill="currentColor">
        <path d="M10 26L20 6L30 26H10Z" />
        <rect x="40" y="12" width="50" height="8" />
    </svg>
)
const SvgLogo4 = () => (
    <svg width="80" height="24" viewBox="0 0 100 32" fill="currentColor">
        <circle cx="15" cy="16" r="8" />
        <circle cx="35" cy="16" r="8" />
        <rect x="55" y="12" width="40" height="8" />
    </svg>
)
const SvgLogo5 = () => (
    <svg width="80" height="24" viewBox="0 0 100 32" fill="currentColor">
        <path d="M10 10h10v10h-10zM25 10h10v10h-10z" />
        <rect x="45" y="12" width="50" height="8" />
    </svg>
)
