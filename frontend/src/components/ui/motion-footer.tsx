"use client";

import * as React from "react";
import { useMemo, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

// Register ScrollTrigger safely for React
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// -------------------------------------------------------------------------
// 1. SESSION-BRANDED INLINE STYLES
// -------------------------------------------------------------------------
const STYLES = `
.cinematic-footer-wrapper {
  font-family: 'Inter', sans-serif;
  -webkit-font-smoothing: antialiased;
  
  --pill-bg-1: rgba(255, 255, 255, 0.03);
  --pill-bg-2: rgba(255, 255, 255, 0.01);
  --pill-shadow: rgba(0, 0, 0, 0.5);
  --pill-highlight: rgba(255, 255, 255, 0.06);
  --pill-inset-shadow: rgba(0, 0, 0, 0.8);
  --pill-border: rgba(0, 255, 65, 0.08);
  
  --pill-bg-1-hover: rgba(0, 255, 65, 0.06);
  --pill-bg-2-hover: rgba(0, 255, 65, 0.02);
  --pill-border-hover: rgba(0, 255, 65, 0.25);
  --pill-shadow-hover: rgba(0, 0, 0, 0.7);
  --pill-highlight-hover: rgba(0, 255, 65, 0.12);
}

@keyframes footer-breathe {
  0% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
  100% { transform: translate(-50%, -50%) scale(1.15); opacity: 0.8; }
}

@keyframes footer-scroll-marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

@keyframes footer-heartbeat {
  0%, 100% { transform: scale(1); filter: drop-shadow(0 0 4px rgba(0, 255, 65, 0.4)); }
  15%, 45% { transform: scale(1.2); filter: drop-shadow(0 0 10px rgba(0, 255, 65, 0.7)); }
  30% { transform: scale(1); }
}

.animate-footer-breathe {
  animation: footer-breathe 8s ease-in-out infinite alternate;
}

.animate-footer-scroll-marquee {
  animation: footer-scroll-marquee 40s linear infinite;
}

.animate-footer-heartbeat {
  animation: footer-heartbeat 2s cubic-bezier(0.25, 1, 0.5, 1) infinite;
}

/* Neon Grid Background */
.footer-bg-grid {
  background-size: 60px 60px;
  background-image: 
    linear-gradient(to right, rgba(0, 255, 65, 0.03) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(0, 255, 65, 0.03) 1px, transparent 1px);
  mask-image: linear-gradient(to bottom, transparent, black 30%, black 70%, transparent);
  -webkit-mask-image: linear-gradient(to bottom, transparent, black 30%, black 70%, transparent);
}

/* Neon Pulse Aurora Glow */
.footer-aurora {
  background: radial-gradient(
    circle at 50% 50%, 
    rgba(0, 255, 65, 0.12) 0%, 
    rgba(0, 255, 65, 0.04) 40%, 
    transparent 70%
  );
}

/* Glass Pill Theming */
.footer-glass-pill {
  background: linear-gradient(145deg, var(--pill-bg-1) 0%, var(--pill-bg-2) 100%);
  box-shadow: 
      0 10px 30px -10px var(--pill-shadow), 
      inset 0 1px 1px var(--pill-highlight), 
      inset 0 -1px 2px var(--pill-inset-shadow);
  border: 1px solid var(--pill-border);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.footer-glass-pill:hover {
  background: linear-gradient(145deg, var(--pill-bg-1-hover) 0%, var(--pill-bg-2-hover) 100%);
  border-color: var(--pill-border-hover);
  box-shadow: 
      0 20px 40px -10px var(--pill-shadow-hover), 
      inset 0 1px 1px var(--pill-highlight-hover),
      0 0 20px rgba(0, 255, 65, 0.08);
}

/* Giant Background Text */
.footer-giant-bg-text {
  font-size: 26vw;
  line-height: 0.75;
  font-weight: 900;
  letter-spacing: -0.05em;
  color: transparent;
  -webkit-text-stroke: 1px rgba(0, 255, 65, 0.05);
  background: linear-gradient(180deg, rgba(0, 255, 65, 0.08) 0%, transparent 60%);
  -webkit-background-clip: text;
  background-clip: text;
}

/* Neon Metallic Text Glow */
.footer-text-glow {
  background: linear-gradient(180deg, #ffffff 0%, rgba(255, 255, 255, 0.4) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0px 0px 20px rgba(0, 255, 65, 0.15));
}

/* Neon outline text for sandwich style */
.footer-neon-outline {
  -webkit-text-fill-color: #050505;
  -webkit-text-stroke: 1.5px #00FF41;
  paint-order: stroke fill;
  filter: drop-shadow(0 0 12px rgba(0, 255, 65, 0.4));
}
`;


export type MagneticButtonProps =
  React.ButtonHTMLAttributes<HTMLButtonElement> &
    React.AnchorHTMLAttributes<HTMLAnchorElement> & {
      as?: React.ElementType;
    };

const MagneticButton = React.forwardRef<HTMLElement, MagneticButtonProps>(
  (
    { className, children, as: Component = "button", ...props },
    forwardedRef,
  ) => {
    const localRef = useRef<HTMLElement>(null);

    useEffect(() => {
      if (typeof window === "undefined") return;
      const element = localRef.current;
      if (!element) return;

      const ctx = gsap.context(() => {
        const handleMouseMove = (e: MouseEvent) => {
          const rect = element.getBoundingClientRect();
          const h = rect.width / 2;
          const w = rect.height / 2;
          const x = e.clientX - rect.left - h;
          const y = e.clientY - rect.top - w;

          gsap.to(element, {
            x: x * 0.4,
            y: y * 0.4,
            rotationX: -y * 0.15,
            rotationY: x * 0.15,
            scale: 1.05,
            ease: "power2.out",
            duration: 0.4,
          });
        };

        const handleMouseLeave = () => {
          gsap.to(element, {
            x: 0,
            y: 0,
            rotationX: 0,
            rotationY: 0,
            scale: 1,
            ease: "elastic.out(1, 0.3)",
            duration: 1.2,
          });
        };

        element.addEventListener("mousemove", handleMouseMove as any);
        element.addEventListener("mouseleave", handleMouseLeave);

        return () => {
          element.removeEventListener("mousemove", handleMouseMove as any);
          element.removeEventListener("mouseleave", handleMouseLeave);
        };
      }, element);

      return () => ctx.revert();
    }, []);

    return (
      <Component
        ref={(node: HTMLElement) => {
          (localRef as any).current = node;
          if (typeof forwardedRef === "function") forwardedRef(node);
          else if (forwardedRef) (forwardedRef as any).current = node;
        }}
        className={cn("cursor-pointer", className)}
        {...props}
      >
        {children}
      </Component>
    );
  },
);
MagneticButton.displayName = "MagneticButton";

// -------------------------------------------------------------------------
// 3. MARQUEE ITEM — Session-themed
// -------------------------------------------------------------------------
const MarqueeItem = () => (
  <div className='flex items-center space-x-12 px-6'>
    <span>Real-Time Collaboration</span>{" "}
    <span style={{ color: "rgba(0,255,65,0.5)" }}>✦</span>
    <span>AI-Powered Sessions</span>{" "}
    <span style={{ color: "rgba(0,255,65,0.3)" }}>✦</span>
    <span>Live Code Execution</span>{" "}
    <span style={{ color: "rgba(0,255,65,0.5)" }}>✦</span>
    <span>Pair Programming</span>{" "}
    <span style={{ color: "rgba(0,255,65,0.3)" }}>✦</span>
    <span>Built for Engineers</span>{" "}
    <span style={{ color: "rgba(0,255,65,0.5)" }}>✦</span>
  </div>
);

// -------------------------------------------------------------------------
// 4. MAIN COMPONENT
// -------------------------------------------------------------------------
export function CinematicFooter() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const giantTextRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!wrapperRef.current) return;

    const ctx = gsap.context(() => {
      // Background Parallax
      gsap.fromTo(
        giantTextRef.current,
        { y: "10vh", scale: 0.8, opacity: 0 },
        {
          y: "0vh",
          scale: 1,
          opacity: 1,
          ease: "power1.out",
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: "top 80%",
            end: "bottom bottom",
            scrub: 1,
          },
        },
      );

      // Staggered Content Reveal
      gsap.fromTo(
        [headingRef.current, linksRef.current],
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: "top 40%",
            end: "bottom bottom",
            scrub: 1,
          },
        },
      );
    }, wrapperRef);

    return () => ctx.revert();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const currentYear = useMemo(() => new Date().getFullYear(), [])

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      {/* Curtain Reveal Wrapper */}
      <div
        ref={wrapperRef}
        className='relative h-screen w-full'
        style={{ clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)" }}
      >
        {/* Fixed footer behind content */}
        <footer
          className='fixed bottom-0 left-0 flex h-screen w-full flex-col justify-between overflow-hidden text-white cinematic-footer-wrapper'
          style={{ backgroundColor: "#050505" }}
        >
          {/* Ambient Neon Glow & Grid */}
          <div className='footer-aurora absolute left-1/2 top-1/2 h-[60vh] w-[80vw] -translate-x-1/2 -translate-y-1/2 animate-footer-breathe rounded-[50%] blur-[80px] pointer-events-none z-0' />
          <div className='footer-bg-grid absolute inset-0 z-0 pointer-events-none' />

          {/* Giant background text */}
          <div
            ref={giantTextRef}
            className='footer-giant-bg-text absolute -bottom-[5vh] left-1/2 -translate-x-1/2 whitespace-nowrap z-0 pointer-events-none select-none'
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            SESSION
          </div>

          {/* 1. Diagonal Marquee */}
          <div
            className='absolute top-12 left-0 w-full overflow-hidden border-y border-white/5 py-4 z-10 -rotate-2 scale-110 shadow-2xl'
            style={{
              backgroundColor: "rgba(5,5,5,0.6)",
              backdropFilter: "blur(12px)",
            }}
          >
            <div
              className='flex w-max animate-footer-scroll-marquee text-xs md:text-sm font-bold tracking-[0.3em] text-white/30 uppercase'
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              <MarqueeItem />
              <MarqueeItem />
            </div>
          </div>

          {/* 2. Main Center Content */}
          <div className='relative z-10 flex flex-1 flex-col items-center justify-center px-6 mt-20 w-full max-w-4xl mx-auto'>
            {/* Heading */}
            <h2
              ref={headingRef}
              className='text-3xl sm:text-4xl md:text-6xl font-black tracking-tighter mb-10 text-center leading-[1.05] flex flex-col items-center gap-0.5 sm:gap-1'
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              <span className='footer-text-glow'>Host Outstanding</span>
              <span className='footer-neon-outline italic'>Sessions</span>
              <span className='footer-text-glow'>From Anywhere</span>
            </h2>

            {/* Buttons + Links */}
            <div
              ref={linksRef}
              className='flex flex-col items-center gap-5 w-full'
            >
            </div>
          </div>

          {/* 3. Bottom Bar */}
          <div className='relative z-20 w-full pb-8 px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-6'>
            {/* Copyright */}
            <div
              className='text-white/30 text-[10px] md:text-xs font-semibold tracking-widest uppercase order-2 md:order-1'
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              © {currentYear} Session. All rights reserved.
            </div>

            {/* Socials & Back to top */}
            <div className='flex items-center gap-4 order-3'>
              <a href='https://github.com/silky-x0/session' target='_blank' aria-label='GitHub' className='w-12 h-12 rounded-full footer-glass-pill flex items-center justify-center text-white/40 hover:text-[#00FF41] transition-colors group'>
                <svg width='18' height='18' viewBox='0 0 24 24' fill='currentColor'>
                  <path d='M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z'/>
                </svg>
              </a>
              <a href='https://x.com/3MindedScholar' target='_blank' aria-label='Twitter (X)' className='w-12 h-12 rounded-full footer-glass-pill flex items-center justify-center text-white/40 hover:text-[#00FF41] transition-colors group'>
                <svg width='18' height='18' viewBox='0 0 24 24' fill='currentColor'>
                  <path d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z'/>
                </svg>
              </a>
              <MagneticButton
                as='button'
                onClick={scrollToTop}
                className='w-12 h-12 rounded-full footer-glass-pill flex items-center justify-center text-white/40 hover:text-[#00FF41] group'
              >
                <svg
                  className='w-5 h-5 transform group-hover:-translate-y-1.5 transition-transform duration-300'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M5 10l7-7m0 0l7 7m-7-7v18'
                  ></path>
                </svg>
              </MagneticButton>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
