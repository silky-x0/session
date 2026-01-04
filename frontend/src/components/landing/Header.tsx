import React from "react";

export const Header: React.FC = () => {
  return (
    <header className="flex justify-between items-center px-6 py-6 sticky top-0 z-50 backdrop-blur-sm">
      <a href="/" className="justify-self-start">
        <svg width="170" height="28" viewBox="0 0 170 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 5 C4 5 4 14 10 14 C16 14 16 23 4 23" />
            <path d="M24 5 H36 M24 5 V23 H36 M24 14 H34" />
            <path d="M56 5 C44 5 44 14 50 14 C56 14 56 23 44 23" />
            <path d="M76 5 C64 5 64 14 70 14 C76 14 76 23 64 23" />
            <path d="M86 5 V23" />
            <path d="M126 23 V5 L140 23 V5" />
          </g>
          <circle cx="106" cy="14" r="7" fill="#00FF22" />
        </svg>
      </a>

      <div className="flex gap-4 items-center">
        <a
          href="/login"
          className="px-4 py-2.5 rounded-xl border-[0.5px] border-white/10 bg-[#1c1c1c] text-white/80 uppercase text-xs font-medium tracking-wide hover:text-white transition-colors"
        >
          Log in
        </a>
        <a
          href="/new"
          className="px-4 py-2.5 rounded-xl bg-session-green text-black uppercase text-xs font-semibold tracking-wide shadow-[inset_0px_0.29px_1.84px_0.69px_rgba(255,255,255,0.32),inset_0px_0.06px_0.23px_0px_rgba(255,255,255,0.44)] hover:brightness-110 transition-all font-bold"
        >
          Start Session
        </a>
      </div>
    </header>
  );
};
