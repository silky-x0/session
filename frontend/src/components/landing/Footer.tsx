import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full py-10 mt-20 relative z-10 bg-transparent">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-session-green"></div>
                <span className="font-display font-bold text-white tracking-tight">Session</span>
                <span className="text-white/40 text-sm ml-2">© 2026</span>
            </div>
            
            <div className="flex gap-8 text-sm text-white/60 font-sans">
                <a href="#" className="hover:text-white transition-colors">Privacy</a>
                <a href="#" className="hover:text-white transition-colors">Terms</a>
                <a href="#" className="hover:text-white transition-colors">Twitter</a>
                <a href="#" className="hover:text-white transition-colors">GitHub</a>
            </div>
        </div>
    </footer>
  );
};
