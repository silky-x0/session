import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

export const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/features", label: "Features" },
    { href: "/pricing", label: "Pricing" },
    { href: "/about", label: "About" },
  ];

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

      {/* Desktop Navigation */}
      <nav className="hidden md:flex gap-8 absolute left-1/2 -translate-x-1/2">
        {navLinks.map((link) => (
          <a 
            key={link.label}
            href={link.href} 
            className="text-white/50 hover:text-cyber-cyan transition-colors text-[10px] font-mono tracking-widest uppercase"
          >
            {link.label}
          </a>
        ))}
      </nav>

      <div className="flex gap-3 sm:gap-4 items-center z-50">
        <div className="hidden sm:flex gap-3 sm:gap-4 items-center">
          <a
            href="/login"
            className="px-4 py-1.5 rounded-lg border border-white/5 bg-white/[0.03] text-white/70 uppercase text-[10px] font-mono tracking-widest hover:text-white hover:bg-white/[0.05] transition-all"
          >
            Log in
          </a>
          <a
            href="/new"
            className="px-4 py-1.5 rounded-lg bg-session-green text-black uppercase text-[10px] font-bold tracking-widest shadow-[0_0_20px_rgba(0,255,65,0.3)] hover:brightness-110 hover:shadow-[0_0_25px_rgba(0,255,65,0.4)] transition-all"
          >
            Sign up
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2 text-white/70 hover:text-white transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 w-full border-b border-white/10 flex flex-col p-6 gap-6 md:hidden z-40 bg-transparent backdrop-blur-2xl"
          >
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a 
                  key={link.label}
                  href={link.href} 
                  className="text-white/60 hover:text-cyber-cyan transition-colors text-xs font-mono tracking-[0.2em] uppercase py-2 border-b border-white/5"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
            </div>
            <div className="flex flex-col gap-3 mt-2">
              <a
                href="/login"
                className="w-full py-3 rounded-lg border border-white/10 bg-white/5 text-white/80 text-center uppercase text-[10px] font-mono tracking-widest"
              >
                Log in
              </a>
              <a
                href="/new"
                className="w-full py-3 rounded-lg bg-session-green text-black text-center uppercase text-[10px] font-bold tracking-widest shadow-[0_0_20px_rgba(0,255,65,0.2)]"
              >
                Sign up
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
