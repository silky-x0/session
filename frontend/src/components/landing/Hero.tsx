import React, { useState } from "react";

export const Hero: React.FC = () => {
  const [mode, setMode] = useState<"start" | "join">("start");
  const [roomId, setRoomId] = useState("");

  const handleJoin = () => {
    if (mode === "join" && roomId.trim()) {
      window.location.href = `/?room=${roomId}`;
    } else {
        // Logic for start session could go here (e.g. create new room)
        console.log("Start session clicked");
    }
  };

  return (
    <section className='flex flex-col items-center justify-center min-h-[65vh] pt-10 px-4 relative z-10'>
      <div className='flex flex-col items-center gap-6 max-w-4xl text-center'>
        {/* Main Heading */}
        <h1 className='flex flex-col items-center gap-0 font-display text-4xl md:text-5xl lg:text-[64px] font-bold leading-[0.95] tracking-tight lowercase'>
          <span className='text-outline'>real-time</span>

          <span className='text-white font-normal italic my-1 -tracking-[0.02em]'>
            coding{" "}
            <span
              className='text-stroke-green text-transparent'
              style={{ WebkitTextStroke: "1px #00FF41" }}
            >
              session
            </span>
          </span>

          <span className='text-outline'>that matter</span>
        </h1>

        {/* Subheading */}
        <p className='font-sans text-text-secondary text-base max-w-lg leading-relaxed'>
          Session is a real-time collaborative coding environment built for pair
          programming, interviews, and focused technical discussions with audio,
          video, and live execution.
        </p>

        {/* Input Form Area */}
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
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder={mode === 'start' ? 'Paste a problem, snippet, or interview prompt…' : 'Enter room ID...'}
                className='flex-1 bg-transparent border-none outline-none text-white/90 placeholder:text-white/30 font-sans text-sm'
              />
              <button
                onClick={handleJoin}
                className='p-2 bg-neon-pulse rounded-3xl hover:brightness-110 transition-all shadow-[inset_0px_0.29px_1.84px_0.69px_rgba(255,255,255,0.32)]'>
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
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
