import { motion } from "framer-motion";
import { Phone, PhoneCall, Plus, Users, Wifi } from "lucide-react";

interface TopBarProps {
  roomId: string;
  isConnected: boolean;
  inCall: boolean;
  language: string;
  onJoinAudio: () => void;
  onCreateRoom: () => void;
  onLanguageChange: (lang: string) => void;
}

const LANGUAGES = [
  "javascript",
  "typescript",
  "python",
  "java",
  "cpp",
  "go",
  "rust",
  "html",
  "css",
  "json",
];

export function TopBar({
  roomId,
  isConnected,
  inCall,
  language,
  onJoinAudio,
  onCreateRoom,
  onLanguageChange,
}: TopBarProps) {
  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className='min-h-[3rem] sm:min-h-[3.5rem] glass-panel border-b border-border flex flex-wrap items-center justify-between px-2 sm:px-4 py-1.5 sm:py-0 z-10 rounded-lg gap-2'
    >
      {/* Left section - Room Info */}
      <div className='flex items-center gap-2 sm:gap-4'>
        <motion.div
          className='flex items-center gap-1.5 sm:gap-2'
          whileHover={{ scale: 1.02 }}
        >
          <span className='hidden sm:inline text-sm font-medium text-muted-foreground'>
            Room:
          </span>
          <code className='font-mono text-primary text-xs sm:text-sm bg-primary/10 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded max-w-[80px] sm:max-w-none truncate'>
            {roomId}
          </code>
        </motion.div>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className='flex items-center gap-1.5'
        >
          {isConnected ? (
            <span className='flex items-center gap-1 text-xs text-primary'>
              <Wifi className='w-3.5 h-3.5' />
              <span className='hidden sm:inline'>Connected</span>
            </span>
          ) : (
            <span className='flex items-center gap-1 text-xs text-muted-foreground'>
              <Wifi className='w-3.5 h-3.5' />
              <span className='hidden sm:inline'>Connecting...</span>
            </span>
          )}
        </motion.div>

        <div className='hidden md:flex items-center gap-1.5 text-xs text-muted-foreground'>
          <Users className='w-3.5 h-3.5' />
          <span>Active</span>
        </div>
      </div>

      {/* Right section - Controls */}
      <div className='flex items-center gap-1.5 sm:gap-3'>
        {!inCall ? (
          <motion.button
            onClick={onJoinAudio}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className='flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 transition-colors text-xs sm:text-sm font-medium cursor-pointer'
          >
            <Phone className='w-3.5 sm:w-4 h-3.5 sm:h-4' />
            <span className='hidden sm:inline'>Join Audio</span>
          </motion.button>
        ) : (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className='flex items-center gap-1.5 px-2 sm:px-3 py-1.5 text-primary text-xs sm:text-sm'
          >
            <PhoneCall className='w-3.5 sm:w-4 h-3.5 sm:h-4' />
            <span className='hidden sm:inline'>Audio Active</span>
          </motion.div>
        )}

        <motion.button
          onClick={onCreateRoom}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className='flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg bg-secondary text-foreground hover:bg-secondary/80 transition-colors text-xs sm:text-sm font-medium border border-border cursor-pointer'
        >
          <Plus className='w-3.5 sm:w-4 h-3.5 sm:h-4' />
          <span className='hidden sm:inline'>New Room</span>
        </motion.button>

        <motion.select
          value={language}
          onChange={(e) => onLanguageChange(e.target.value)}
          whileHover={{ scale: 1.02 }}
          className='px-1.5 sm:px-3 py-1.5 rounded-lg bg-secondary text-foreground border border-border text-xs sm:text-sm font-mono cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary'
        >
          {LANGUAGES.map((lang) => (
            <option key={lang} value={lang} className='bg-card'>
              {lang}
            </option>
          ))}
        </motion.select>
      </div>
    </motion.div>
  );
}
