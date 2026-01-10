import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export const SessionInput: React.FC = () => {
  const [mode, setMode] = useState<"start" | "join">("start");
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleJoin = async () => {
    if (mode === "join") {
      // Join existing session
      if (input.trim()) {
        navigate(`/editor?room=${input}`);
      }
      return;
    }

    // Start new session
    if (!input.trim()) {
      // No prompt - redirect to editor with random room ID
      const newRoomId = Math.random().toString(36).substring(2, 9);
      navigate(`/editor?room=${newRoomId}`);
      return;
    }

    // Prompt provided - call AI API
    try {
      setIsLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:1234";
      console.log("🔍 Making AI API call with prompt:", input);
      console.log("🔍 API URL:", apiUrl);
      const response = await fetch(`${apiUrl}/api/ai/session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: input }),
      });

      if (!response.ok) {
        throw new Error("Failed to create AI session");
      }

      const data = await response.json();
      navigate(`/editor?room=${data.roomId}`);
    } catch (error) {
      console.error("❌ Error creating AI session:", error);
      console.error("❌ Error details:", error instanceof Error ? error.message : String(error));
      // Fallback: redirect to editor with random room ID
      const newRoomId = Math.random().toString(36).substring(2, 9);
      navigate(`/editor?room=${newRoomId}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`w-full mt-10 transition-all duration-300 ease-in-out ${mode === 'join' ? 'max-w-xs' : 'max-w-lg'}`}>
      <div className='flex justify-center mb-5'>
        <div className='relative flex bg-[#1c1c1c] border border-white/5 rounded-full p-1'>
           {/* Animated Background Pill */}
           <div
            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full bg-white transition-all duration-300 ease-out ${
              mode === "start" ? "left-1" : "left-[calc(50%+2px)]"
            }`}
          ></div>

          <button
            onClick={() => setMode("start")}
            className={`relative z-10 px-5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors duration-300 ${
              mode === "start" ? "text-black" : "text-white/60 hover:text-white"
            }`}
          >
            Start Session
          </button>
          <button
            onClick={() => setMode("join")}
            className={`relative z-10 px-5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors duration-300 ${
              mode === "join" ? "text-black" : "text-white/60 hover:text-white"
            }`}
          >
            Join Session
          </button>
        </div>
      </div>

      <div className='relative group'>
        {/* Conic Gradient Border Effect */}
        <div className='absolute -inset-[1px] bg-gradient-to-r from-transparent via-neon-pulse/50 to-transparent rounded-3xl opacity-20 group-hover:opacity-100 transition-opacity duration-500 blur-sm'></div>

        <div className='relative flex items-center bg-[#1f1f1f] rounded-full border-2 border-white/5 p-1.5 pl-5 focus-within:border-white/10 transition-colors'>
          <input
            type='text'
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isLoading) {
                handleJoin();
              }
            }}
            disabled={isLoading}
            placeholder={
              isLoading 
                ? 'Joining room...' 
                : mode === 'start' 
                  ? 'Paste a problem, snippet, or interview prompt…' 
                  : 'Enter room ID...'
            }
            className='flex-1 bg-transparent border-none outline-none text-white/90 placeholder:text-white/30 font-sans text-sm disabled:opacity-60'
          />
          <button
            onClick={handleJoin}
            disabled={isLoading}
            className='p-2 bg-neon-pulse rounded-3xl hover:brightness-110 transition-all shadow-[inset_0px_0.29px_1.84px_0.69px_rgba(255,255,255,0.32)] disabled:opacity-60 disabled:cursor-not-allowed'>
            {isLoading ? (
              <svg
                width='20'
                height='20'
                viewBox='0 0 24 24'
                fill='none'
                stroke='black'
                strokeWidth='2'
                className='animate-spin'
              >
                <path d='M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83'></path>
              </svg>
            ) : (
              <svg
                width='20'
                height='20'
                viewBox='0 0 24 24'
                fill='none'
                stroke='black'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <path d='M5 12h14'></path>
                <path d='M12 5l7 7-7 7'></path>
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
