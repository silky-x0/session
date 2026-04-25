import React, { useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";

type Step = { label: string; done: boolean; active?: boolean };

type DescPosition = "right-bottom" | "left-top" | "left-bottom" | "right-top";

type TabData = {
  key: string;
  label: string;
  title: string;
  titleAccent: string;
  steps: Step[];
  card: { heading: string; subheading: string; body: string };
  descPosition: DescPosition;
  cardRotate: number;
};

const TABS: TabData[] = [
  {
    key: "init",
    label: "INITIALIZATION",
    title: "Generating",
    titleAccent: "your environment",
    steps: [
      { label: "Configuring container", done: true },
      { label: "Mounting file system", done: true },
      { label: "Booting workspace", done: false, active: true },
      { label: "Establishing WebSocket", done: false },
      { label: "Final touches", done: false },
    ],
    card: {
      heading: "Your perfect environment,",
      subheading: "Ready in seconds",
      body: "Type a thought, drop a brief, or paste a repository — get a fully-configured multiplayer coding session tuned to your framework and needs.",
    },
    descPosition: "right-bottom",
    cardRotate: 2,
  },
  {
    key: "exec",
    label: "EXECUTION",
    title: "Running",
    titleAccent: "your code live",
    steps: [
      { label: "Spawning runtime", done: true },
      { label: "Injecting dependencies", done: true },
      { label: "Executing entry point", done: true },
      { label: "Streaming output", done: false, active: true },
      { label: "Profiling performance", done: false },
    ],
    card: {
      heading: "Real-time execution,",
      subheading: "Zero latency feedback",
      body: "Run code in isolated containers with instant output streaming. See results as they happen — no waiting for builds.",
    },
    descPosition: "left-top",
    cardRotate: -2,
  },
  {
    key: "multi",
    label: "MULTIPLAYER",
    title: "Syncing",
    titleAccent: "collaborators",
    steps: [
      { label: "Opening WebSocket", done: true },
      { label: "Syncing CRDT state", done: true },
      { label: "Broadcasting cursors", done: true },
      { label: "Sharing terminal", done: true },
      { label: "Live awareness active", done: false, active: true },
    ],
    card: {
      heading: "Code together,",
      subheading: "In perfect sync",
      body: "Real-time cursors, shared terminals, and conflict-free editing. Pair program like you're sitting side by side.",
    },
    descPosition: "left-bottom",
    cardRotate: -3,
  },
  {
    key: "integ",
    label: "INTEGRATION",
    title: "Connecting",
    titleAccent: "your toolchain",
    steps: [
      { label: "Linking Git repository", done: true },
      { label: "Loading CI/CD config", done: true },
      { label: "Syncing environment vars", done: false, active: true },
      { label: "Mounting secrets", done: false },
      { label: "Validating pipeline", done: false },
    ],
    card: {
      heading: "Plug into anything,",
      subheading: "Seamless integration",
      body: "Connect your GitHub repos, CI pipelines, and cloud services. Your existing workflow, supercharged with collaboration.",
    },
    descPosition: "right-top",
    cardRotate: 3,
  },
  {
    key: "review",
    label: "REVIEW",
    title: "Analyzing",
    titleAccent: "your session",
    steps: [
      { label: "Capturing snapshots", done: true },
      { label: "Generating diff report", done: true },
      { label: "Running lint checks", done: true },
      { label: "AI code review", done: true },
      { label: "Publishing summary", done: false, active: true },
    ],
    card: {
      heading: "Review & share,",
      subheading: "With full context",
      body: "AI-powered code reviews, automatic diff summaries, and shareable session replays. Every decision documented.",
    },
    descPosition: "right-bottom",
    cardRotate: 1,
  },
];

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="#00FF41" className="shrink-0">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
  </svg>
);

const LoadingDot = () => (
  <div className="w-3.5 h-3.5 rounded-full border-2 border-[#00FF41]/40 border-t-[#00FF41] animate-spin shrink-0" />
);

// Arrow that always points toward the generator card from the description card
const ArrowToGenerator = ({ position }: { position: DescPosition }) => {
  // Rotation to point the arrow toward the generator card
  // Default arrow points: left and down (↙)
  const rotations: Record<DescPosition, string> = {
    "right-bottom": "rotate(0deg)",        // arrow points ↙ toward gen (top-left)
    "left-top": "rotate(180deg)",          // arrow points ↗ toward gen (bottom-right)
    "left-bottom": "scaleX(-1)",           // arrow points ↘ toward gen (top-right)
    "right-top": "scaleY(-1)",             // arrow points ↖ toward gen (bottom-left)
  };

  // Position the arrow on the edge closest to the generator
  const styles: Record<DescPosition, React.CSSProperties> = {
    "right-bottom": { left: "-3.5rem", top: "1rem" },
    "left-top": { right: "-3.5rem", bottom: "1rem" },
    "left-bottom": { right: "-3.5rem", top: "1rem" },
    "right-top": { left: "-3.5rem", bottom: "1rem" },
  };

  return (
    <svg
      width="110"
      height="80"
      viewBox="0 0 150 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute hidden lg:block"
      style={{ ...styles[position], transform: rotations[position] }}
    >
      <path d="M130 10 C 130 80, 80 100, 20 100" stroke="#00FF41" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="4 4" />
      <path d="M35 85 L 15 100 L 25 115" stroke="#00FF41" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

const spring = { type: "spring" as const, stiffness: 180, damping: 26 };

export const GeneratorSection: React.FC = () => {
  const [activeIdx, setActiveIdx] = useState(0);
  const current = TABS[activeIdx];

  // Determine flex layout from position
  const isDescRight = current.descPosition.startsWith("right");
  const isDescBottom = current.descPosition.endsWith("bottom");

  return (
    <section className="relative w-full px-4 sm:px-6 pt-16 sm:pt-20 md:pt-24 pb-20 sm:pb-28 md:pb-32 flex flex-col items-center bg-transparent z-10">
      
      {/* Headline */}
      <div className="flex flex-col items-center text-center gap-1 mb-8 sm:mb-12 relative z-20">
        <h2 className="font-sans text-2xl sm:text-3xl md:text-5xl font-medium tracking-wide text-white uppercase">
          Everything to host
        </h2>
        <h2 
          className="font-display text-3xl sm:text-5xl md:text-7xl font-black uppercase tracking-widest mt-1"
          style={{ 
            color: "transparent", 
            WebkitTextStroke: "1.5px #00FF41",
            textShadow: "0 0 10px rgba(0,255,65,0.1)"
          }}
        >
          Awesome Sessions
        </h2>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 md:gap-6 mb-10 sm:mb-16 relative z-20 px-2">
        {TABS.map((tab, idx) => (
          <button
            key={tab.key}
            onClick={() => setActiveIdx(idx)}
            className={`px-3 sm:px-4 py-1.5 rounded-full text-[9px] sm:text-[10px] font-mono font-semibold uppercase tracking-widest transition-all duration-300 ${
              idx === activeIdx 
                ? "bg-[#1c1c1c] text-white/90 shadow-[0_0_12px_rgba(0,255,65,0.15)]" 
                : "bg-transparent text-white/40 hover:text-white/70"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Desktop Layout */}
      <LayoutGroup>
        <div className="w-full max-w-[1050px] relative z-20 hidden lg:flex items-start gap-10" style={{ flexDirection: isDescRight ? "row" : "row-reverse" }}>
          
          {/* Generator Card — always takes the "main" slot */}
          <motion.div
            layout
            transition={spring}
            className="w-[560px] shrink-0 aspect-[6/5] bg-[#0d0d0d] rounded-3xl border border-white/[0.06] relative overflow-hidden shadow-2xl"
            style={{ alignSelf: isDescBottom ? "flex-start" : "flex-end" }}
          >
            <div className="absolute right-32 top-0 bottom-0 w-px bg-[#00FF41]/20"></div>

            <div className="flex items-center justify-between px-6 pt-6">
              <div className="flex items-center gap-2">
                <div className="w-6 h-3 rounded bg-white/5"></div>
                <div className="w-12 h-3 rounded bg-white/5"></div>
                <div className="w-10 h-3 rounded bg-white/5"></div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#00FF41] text-[10px] font-bold font-mono">+ 330</span>
                <div className="w-5 h-5 rounded-full bg-white/10"></div>
                <div className="px-3 py-1 bg-white/5 rounded-full text-[10px] text-white/30">Publish</div>
              </div>
            </div>

            <div className="flex gap-4 px-6 mt-4">
              <div className="w-16 h-4 bg-white/5 rounded"></div>
              <div className="w-16 h-4 bg-white/5 rounded"></div>
              <div className="w-16 h-4 bg-white/5 rounded"></div>
            </div>

            <div className="absolute bottom-6 right-10 w-32 h-40 bg-white/[0.03] rounded-xl"></div>
            <div className="absolute bottom-24 left-6 w-32 h-2 bg-white/5 rounded"></div>
            <div className="absolute bottom-10 left-6 w-48 h-10 bg-white/5 rounded"></div>

            <AnimatePresence mode="wait">
              <motion.div
                key={current.key}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex flex-col items-center px-4"
              >
                <h3 className="text-2xl font-medium text-white mb-0.5">{current.title}</h3>
                <h3 className="text-2xl font-medium text-[#00FF41] mb-6">{current.titleAccent}</h3>
                <div className="flex flex-col gap-3 w-full max-w-[240px]">
                  {current.steps.map((step, i) => (
                    <div key={i} className={`flex items-center gap-3 ${!step.done && !step.active ? "opacity-25" : ""}`}>
                      {step.done ? <CheckIcon /> : step.active ? <LoadingDot /> : <div className="w-3.5 h-3.5 shrink-0" />}
                      <span className={`text-xs uppercase tracking-wider font-semibold ${
                        step.done ? "text-white" : step.active ? "text-[#00FF41]" : "text-white/60"
                      }`}>{step.label}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Description Card — positioned at the opposite corner */}
          <motion.div
            layout
            transition={spring}
            className="w-[380px] shrink-0 relative"
            style={{ alignSelf: isDescBottom ? "flex-end" : "flex-start" }}
          >
            <motion.div
              layout="position"
              transition={spring}
              className="bg-[#131313] rounded-3xl p-10 shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-white/[0.04]"
              style={{ rotate: current.cardRotate }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.key}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <h4 className="font-sans text-2xl font-medium tracking-wide uppercase mb-4 leading-snug">
                    <span className="text-white">{current.card.heading}</span>
                    <br />
                    <span className="text-white/40">{current.card.subheading}</span>
                  </h4>
                  <p className="text-white/50 text-sm leading-relaxed">{current.card.body}</p>
                </motion.div>
              </AnimatePresence>
            </motion.div>

            <ArrowToGenerator position={current.descPosition} />
          </motion.div>

        </div>
      </LayoutGroup>

      {/* Mobile: stacked layout */}
      <div className="w-full max-w-[600px] relative z-20 flex flex-col items-center gap-8 lg:hidden">
        <div className="w-full aspect-[6/5] bg-[#0d0d0d] rounded-2xl sm:rounded-3xl border border-white/[0.06] relative overflow-hidden shadow-2xl">
          <div className="absolute right-24 sm:right-32 top-0 bottom-0 w-px bg-[#00FF41]/20"></div>
          <div className="flex items-center justify-between px-4 sm:px-6 pt-4 sm:pt-6">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-5 sm:w-6 h-2.5 sm:h-3 rounded bg-white/5"></div>
              <div className="w-8 sm:w-12 h-2.5 sm:h-3 rounded bg-white/5"></div>
              <div className="w-7 sm:w-10 h-2.5 sm:h-3 rounded bg-white/5"></div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-[#00FF41] text-[9px] sm:text-[10px] font-bold font-mono">+ 330</span>
              <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-white/10"></div>
            </div>
          </div>
          <div className="flex gap-3 sm:gap-4 px-4 sm:px-6 mt-3 sm:mt-4">
            <div className="w-14 sm:w-16 h-3 sm:h-4 bg-white/5 rounded"></div>
            <div className="w-14 sm:w-16 h-3 sm:h-4 bg-white/5 rounded"></div>
          </div>
          <div className="absolute bottom-4 sm:bottom-6 right-8 sm:right-10 w-24 sm:w-32 h-28 sm:h-40 bg-white/[0.03] rounded-lg sm:rounded-xl"></div>
          <div className="absolute bottom-6 sm:bottom-10 left-4 sm:left-6 w-32 sm:w-48 h-8 sm:h-10 bg-white/5 rounded"></div>

          <AnimatePresence mode="wait">
            <motion.div
              key={current.key}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex flex-col items-center px-4"
            >
              <h3 className="text-lg sm:text-xl font-medium text-white mb-0.5">{current.title}</h3>
              <h3 className="text-lg sm:text-xl font-medium text-[#00FF41] mb-5">{current.titleAccent}</h3>
              <div className="flex flex-col gap-2.5 w-full max-w-[240px]">
                {current.steps.map((step, i) => (
                  <div key={i} className={`flex items-center gap-2.5 ${!step.done && !step.active ? "opacity-25" : ""}`}>
                    {step.done ? <CheckIcon /> : step.active ? <LoadingDot /> : <div className="w-3.5 h-3.5 shrink-0" />}
                    <span className={`text-[10px] sm:text-xs uppercase tracking-wider font-semibold ${
                      step.done ? "text-white" : step.active ? "text-[#00FF41]" : "text-white/60"
                    }`}>{step.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={current.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-[380px]"
          >
            <div className="bg-[#131313] rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-white/[0.04]">
              <h4 className="font-sans text-lg sm:text-xl font-medium tracking-wide uppercase mb-3 leading-snug">
                <span className="text-white">{current.card.heading}</span>
                <br />
                <span className="text-white/40">{current.card.subheading}</span>
              </h4>
              <p className="text-white/50 text-xs sm:text-sm leading-relaxed">{current.card.body}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

    </section>
  );
};
