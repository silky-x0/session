import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { WeaveSpinner } from "../ui/weave-spinner";
import { DiceBearAvatar } from "../editor/DiceBearAvatar";

// Rotating status messages shown while AI generates content
const STATUS_MESSAGES = [
  "Spinning up the engine…",
  "Using latest AI model…",
  "Generating your coding challenge…",
  "Crafting the perfect problem…",
  "Almost there…",
];

// Fun coding facts to keep users engaged while waiting
const CODING_FACTS = [
  "The first programmer was Ada Lovelace in the 1840s.",
  "The average developer writes about 100 lines of code per day.",
  "JavaScript was created in just 10 days.",
  "The term 'bug' came from an actual moth in a computer.",
  "Git was created by Linus Torvalds in just 2 weeks.",
  "Python is named after Monty Python, not the snake.",
  "The first computer virus was created in 1983.",
];

type SessionLoadingScreenProps = {
  /** Whether the AI API call is in progress */
  isLoadingAI: boolean;
  /** Whether the AI call has completed (with or without error) */
  aiReady: boolean;
  /** Room ID to navigate to once nickname is collected */
  roomId: string | null;
  /** If true, only show nickname prompt (no AI loading) — for join/empty start */
  nicknameOnly?: boolean;
  /** Called when user submits nickname and is ready to enter */
  onEnter: (nickname: string) => void;
  /** Called to cancel/abort joining the room */
  onCancel?: () => void;
};

export const SessionLoadingScreen: React.FC<SessionLoadingScreenProps> = ({
  isLoadingAI,
  aiReady,
  roomId,
  nicknameOnly = false,
  onEnter,
  onCancel,
}) => {
  const [statusIndex, setStatusIndex] = useState(0);
  const [nickname, setNickname] = useState("");
  const [showNicknameInput, setShowNicknameInput] = useState(nicknameOnly);
  const [nicknameSubmitted, setNicknameSubmitted] = useState(false);
  const [factIndex, setFactIndex] = useState(
    Math.floor(Math.random() * CODING_FACTS.length),
  );
  // Stable random suffix for this session to match room logic if needed
  const seedSuffix = useRef(Math.floor(Math.random() * 100) + 1);
  const inputRef = useRef<HTMLInputElement>(null);

  // Cycle through status messages
  useEffect(() => {
    if (nicknameOnly || showNicknameInput) return;

    const timer = setInterval(() => {
      setStatusIndex((prev) => {
        if (prev < STATUS_MESSAGES.length - 1) {
          return prev + 1;
        }
        // After cycling through statuses, show nickname input
        setShowNicknameInput(true);
        return prev;
      });
    }, 2000);

    return () => clearInterval(timer);
  }, [nicknameOnly, showNicknameInput]);

  // Focus nickname input when it appears
  useEffect(() => {
    if (showNicknameInput && inputRef.current) {
      const timer = setTimeout(() => inputRef.current?.focus(), 400);
      return () => clearTimeout(timer);
    }
  }, [showNicknameInput]);

  // Cycle through fun facts while waiting after nickname submission
  useEffect(() => {
    if (!nicknameSubmitted || aiReady) return;

    const timer = setInterval(() => {
      setFactIndex((prev) => (prev + 1) % CODING_FACTS.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [nicknameSubmitted, aiReady]);

  // Auto-enter when both nickname submitted and AI is ready
  useEffect(() => {
    if (nicknameSubmitted && aiReady && roomId && nickname.trim()) {
      onEnter(nickname.trim());
    }
  }, [nicknameSubmitted, aiReady, roomId, nickname, onEnter]);

  // Lock body scroll when overlay is active
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  // Handle Escape key to cancel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && onCancel) {
        onCancel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  const handleNicknameSubmit = () => {
    if (!nickname.trim()) return;
    setNicknameSubmitted(true);

    // If this is nickname-only mode (join / empty start), enter immediately
    if (nicknameOnly && roomId) {
      onEnter(nickname.trim());
    }
  };

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className='fixed inset-0 z-[9999] flex items-center justify-center p-4'
    >
      {/* Backdrop */}
      <div
        className='absolute inset-0 bg-[#050505]/90 backdrop-blur-xl'
        onClick={onCancel}
      />

      {/* Close Button */}
      {onCancel && (
        <button
          onClick={onCancel}
          className='absolute top-6 right-6 z-20 p-2 text-white/50 hover:text-white transition-colors'
          aria-label='Cancel and close'
        >
          <svg
            width='24'
            height='24'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <line x1='18' y1='6' x2='6' y2='18'></line>
            <line x1='6' y1='6' x2='18' y2='18'></line>
          </svg>
        </button>
      )}

      {/* Content */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4, ease: "easeOut" }}
        className='relative z-10 flex flex-col items-center gap-8 max-w-md w-full px-6'
      >
        {/* Spinner — always visible during AI loading */}
        {!nicknameOnly && isLoadingAI && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <WeaveSpinner />
          </motion.div>
        )}

        {/* Status messages (before nickname input) */}
        {!nicknameOnly && !showNicknameInput && (
          <AnimatePresence mode='wait'>
            <motion.p
              key={statusIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className='text-white/70 text-sm font-mono tracking-wide text-center'
            >
              {STATUS_MESSAGES[statusIndex]}
            </motion.p>
          </AnimatePresence>
        )}

        {/* Nickname prompt */}
        <AnimatePresence>
          {showNicknameInput && !nicknameSubmitted && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className='flex flex-col items-center gap-5 w-full'
            >
              {/* Question */}
              <div className='text-center'>
                {!nicknameOnly && (
                  <p className='text-white/40 text-xs font-mono mb-2'>
                    but before that…
                  </p>
                )}
                <h2 className='text-white text-lg sm:text-xl font-semibold'>
                  What should others call you?
                </h2>
                <p className='text-white/40 text-xs mt-1.5'>
                  Your nickname will be visible to collaborators
                </p>
              </div>

              {/* Input */}
              <div className="flex items-center gap-4 w-full max-w-sm">
                <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-[#1a1a1a] border border-white/10 flex items-center justify-center overflow-hidden shadow-lg">
                  <DiceBearAvatar seed={`${nickname || "anonymous"}-${seedSuffix.current}`} size={48} className="w-full h-full" />
                </div>
                
                <div className='relative group flex-1'>
                  {/* Glow border */}
                  <div className='absolute -inset-[1px] bg-gradient-to-r from-transparent via-[#00FF41]/50 to-transparent rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 blur-sm' />

                  <div className='relative flex items-center bg-[#1a1a1a] rounded-2xl border border-white/10 p-1 pl-4 focus-within:border-[#00FF41]/30 transition-colors'>
                    <input
                      ref={inputRef}
                      type='text'
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleNicknameSubmit();
                      }}
                      placeholder='Enter your nickname…'
                      maxLength={20}
                      className='flex-1 min-w-0 bg-transparent border-none outline-none text-white/90 placeholder:text-white/25 font-sans text-sm'
                    />
                    <button
                      onClick={handleNicknameSubmit}
                      disabled={!nickname.trim()}
                      className='p-2 bg-[#00FF41] rounded-xl hover:brightness-110 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0'
                    >
                      <svg
                        width='16'
                        height='16'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='black'
                        strokeWidth='2.5'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      >
                        <path d='M5 12h14' />
                        <path d='M12 5l7 7-7 7' />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Waiting state after nickname submitted, but AI not ready */}
        {nicknameSubmitted && !aiReady && !nicknameOnly && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className='flex flex-col items-center gap-4'
          >
            <p className='text-[#00FF41] text-sm font-mono'>
              Welcome, <span className='font-bold'>{nickname}</span>
            </p>

            {/* Fun fact card */}
            <AnimatePresence mode='wait'>
              <motion.div
                key={factIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className='bg-white/5 border border-white/10 rounded-xl px-5 py-3 max-w-sm'
              >
                <p className='text-white/30 text-[10px] font-mono uppercase tracking-widest mb-1'>
                  Did you know?
                </p>
                <p className='text-white/60 text-xs leading-relaxed'>
                  {CODING_FACTS[factIndex]}
                </p>
              </motion.div>
            </AnimatePresence>

            <p className='text-white/30 text-xs font-mono animate-pulse'>
              Waiting for AI to finish…
            </p>
          </motion.div>
        )}
      </motion.div>
    </motion.div>,
    document.body,
  );
};
