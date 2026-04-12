import React, { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { SessionLoadingScreen } from "./SessionLoadingScreen";

export const SessionInput: React.FC = () => {
  const [mode, setMode] = useState<"start" | "join">("start");
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Overlay state
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayMode, setOverlayMode] = useState<"ai" | "nickname-only">("ai");
  const [aiReady, setAiReady] = useState(false);
  const [pendingRoomId, setPendingRoomId] = useState<string | null>(null);

  // Ref to track if component is still mounted
  const mountedRef = useRef(true);
  React.useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Fire AI API call in background
  const startAISession = useCallback(async (prompt: string) => {
    try {
      setIsLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:1234";
      const response = await fetch(`${apiUrl}/api/ai/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) throw new Error("Failed to create AI session");

      const data = await response.json();
      if (mountedRef.current) {
        setPendingRoomId(data.roomId);
        setAiReady(true);
      }
    } catch (error) {
      console.error("❌ Error creating AI session:", error);
      // Fallback: create a plain room
      if (mountedRef.current) {
        const fallbackId = crypto.randomUUID().slice(0, 8);
        setPendingRoomId(fallbackId);
        setAiReady(true);
      }
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  }, []);

  const handleJoin = () => {
    if (mode === "join") {
      if (!input.trim()) return;
      // Join existing session — show nickname-only overlay
      setPendingRoomId(input.trim());
      setOverlayMode("nickname-only");
      setAiReady(true);
      setShowOverlay(true);
      return;
    }

    // Start new session without prompt — nickname-only
    if (!input.trim()) {
      const newRoomId = crypto.randomUUID().slice(0, 8);
      setPendingRoomId(newRoomId);
      setOverlayMode("nickname-only");
      setAiReady(true);
      setShowOverlay(true);
      return;
    }

    // Start with prompt — fire AI call, show full overlay
    setOverlayMode("ai");
    setAiReady(false);
    setPendingRoomId(null);
    setShowOverlay(true);
    startAISession(input.trim());
  };

  const handleEnter = useCallback(
    (nickname: string) => {
      if (!pendingRoomId) return;
      const encoded = encodeURIComponent(nickname);
      navigate(`/editor?room=${pendingRoomId}&nickname=${encoded}`);
    },
    [pendingRoomId, navigate],
  );

  return (
    <>
      <div
        className={`w-full mt-6 sm:mt-8 transition-all duration-300 ease-in-out ${mode === "join" ? "max-w-[260px] sm:max-w-[280px]" : "max-w-[calc(100%-1rem)] sm:max-w-md"}`}
      >
        <div className='flex justify-center mb-4'>
          <div className='relative flex bg-[#1c1c1c] border border-white/5 rounded-full p-1'>
            {/* Animated Background Pill */}
            <div
              className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full bg-white transition-all duration-300 ease-out ${
                mode === "start" ? "left-1" : "left-[calc(50%+2px)]"
              }`}
            ></div>

            <button
              onClick={() => setMode("start")}
              className={`relative z-10 px-3 sm:px-4 py-1 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider transition-colors duration-300 ${
                mode === "start"
                  ? "text-black"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Start Session
            </button>
            <button
              onClick={() => setMode("join")}
              className={`relative z-10 px-3 sm:px-4 py-1 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider transition-colors duration-300 ${
                mode === "join"
                  ? "text-black"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Join Session
            </button>
          </div>
        </div>

        <div className='relative group'>
          {/* Conic Gradient Border Effect */}
          <div className='absolute -inset-[1px] bg-gradient-to-r from-transparent via-neon-pulse/50 to-transparent rounded-3xl opacity-20 group-hover:opacity-100 transition-opacity duration-500 blur-sm'></div>

          <div className='relative flex items-center bg-[#1f1f1f] rounded-full border border-white/5 p-1 pl-3 sm:pl-4 focus-within:border-white/10 transition-colors'>
            <input
              type='text'
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !showOverlay) {
                  handleJoin();
                }
              }}
              disabled={showOverlay}
              placeholder={
                mode === "start"
                  ? "Paste a prompt or start empty…"
                  : "Enter room ID..."
              }
              className='flex-1 min-w-0 bg-transparent border-none outline-none text-white/90 placeholder:text-white/30 font-sans text-xs sm:text-[13px] disabled:opacity-60 py-1'
            />
            <button
              onClick={handleJoin}
              disabled={showOverlay}
              className='p-1.5 bg-neon-pulse rounded-full hover:brightness-110 transition-all shadow-[inset_0px_0.29px_1.84px_0.69px_rgba(255,255,255,0.32)] disabled:opacity-60 disabled:cursor-not-allowed flex-shrink-0'
            >
              <svg
                width='16'
                height='16'
                viewBox='0 0 24 24'
                fill='none'
                stroke='black'
                strokeWidth='2.2'
                strokeLinecap='round'
                strokeLinejoin='round'
                className='sm:w-4 sm:h-4 ml-0.5'
              >
                <path d='M5 12h14'></path>
                <path d='M12 5l7 7-7 7'></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Loading / Nickname Overlay */}
      <AnimatePresence>
        {showOverlay && (
          <SessionLoadingScreen
            isLoadingAI={isLoading}
            aiReady={aiReady}
            roomId={pendingRoomId}
            nicknameOnly={overlayMode === "nickname-only"}
            onEnter={handleEnter}
            onCancel={() => setShowOverlay(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};
