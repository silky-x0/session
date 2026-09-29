import React from "react";

export const Header: React.FC = () => {
  return (
    <header className="flex justify-between items-center px-4 sm:px-6 py-2.5 sticky top-0 z-50 bg-transparent">
      <a href="/" className="justify-self-start hover:opacity-80 transition-opacity z-50">
        <svg width="110" height="18" viewBox="0 0 170 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 5 C4 5 4 14 10 14 C16 14 16 23 4 23" />
            <path d="M24 5 H36 M24 5 V23 H36 M24 14 H34" />
            <path d="M56 5 C44 5 44 14 50 14 C56 14 56 23 44 23" />
            <path d="M76 5 C64 5 64 14 70 14 C76 14 76 23 64 23" />
            <path d="M86 5 V23" />
            <path d="M126 23 V5 L140 23 V5" />
          </g>
          <circle cx="106" cy="14" r="11" fill="#00FF41" />
        </svg>
      </a>
    </header>
  );
};
