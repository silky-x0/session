import React from "react";
import { useTheme, type Theme } from "../ThemeContext";
import { Settings, X, Sun, Moon, Eye, ZoomIn, AlignLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";


interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onFormat?: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose, onFormat }) => {
  const { theme, setTheme, settings, updateSettings, zenMode, setZenMode } = useTheme();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[99]"
          />

          {/* Panel Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm glass-panel rounded-xl shadow-2xl p-5 z-[100] border border-glass-border bg-glass-bg text-foreground select-none"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-glass-border pb-3 mb-4">
              <div className="flex items-center gap-2 text-neon-pulse font-bold">
                <Settings className="w-5 h-5 animate-spin-slow" />
                <span className="tracking-wider uppercase text-xs">Editor Settings</span>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-white/10 rounded-md transition-colors text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex flex-col gap-4 text-sm">
              {/* Theme Selector */}
              <div>
                <label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider block mb-2">
                  Theme System
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["dark", "light", "contrast"] as Theme[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTheme(t)}
                      className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-lg border transition-all ${
                        theme === t
                          ? "bg-neon-pulse/20 border-neon-pulse text-neon-pulse shadow-[0_0_12px_rgba(0,255,65,0.15)]"
                          : "border-glass-border bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/10"
                      }`}
                    >
                      {t === "dark" && <Moon className="w-4 h-4" />}
                      {t === "light" && <Sun className="w-4 h-4" />}
                      {t === "contrast" && <Eye className="w-4 h-4" />}
                      <span className="text-[10px] font-bold capitalize">{t}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Zen Mode */}
              <div className="flex items-center justify-between p-2.5 rounded-lg border border-glass-border bg-white/5">
                <div className="flex flex-col">
                  <span className="font-semibold text-xs">Zen Mode</span>
                  <span className="text-[10px] text-muted-foreground">Hide sidebars for clean editor focus</span>
                </div>
                <button
                  onClick={() => setZenMode(!zenMode)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    zenMode ? "bg-neon-pulse" : "bg-neutral-800"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      zenMode ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Font Size & Line Height */}
              <div className="flex flex-col gap-3">
                {/* Font Size */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-muted-foreground uppercase tracking-wider">Font Size</span>
                    <span className="font-mono text-neon-pulse font-bold">{settings.fontSize}px</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <ZoomIn className="w-4 h-4 text-muted-foreground" />
                    <input
                      type="range"
                      min="12"
                      max="24"
                      value={settings.fontSize}
                      onChange={(e) => updateSettings({ fontSize: parseInt(e.target.value) })}
                      className="flex-1 accent-neon-pulse h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>

                {/* Line Height */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-muted-foreground uppercase tracking-wider">Line Height</span>
                    <span className="font-mono text-neon-pulse font-bold">{settings.lineHeight}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <AlignLeft className="w-4 h-4 text-muted-foreground" />
                    <input
                      type="range"
                      min="1.2"
                      max="2.2"
                      step="0.1"
                      value={settings.lineHeight}
                      onChange={(e) => updateSettings({ lineHeight: parseFloat(e.target.value) })}
                      className="flex-1 accent-neon-pulse h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Minimap Toggle */}
              <div className="flex items-center justify-between p-2 border-t border-glass-border pt-3">
                <span className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">Show Minimap</span>
                <button
                  onClick={() => updateSettings({ minimap: !settings.minimap })}
                  className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    settings.minimap ? "bg-neon-pulse" : "bg-neutral-800"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      settings.minimap ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Action Buttons */}
              {onFormat && (
                <button
                  onClick={() => {
                    onFormat();
                    onClose();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-neon-pulse/20 text-neon-pulse border border-neon-pulse/30 rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-neon-pulse/30 transition-all shadow-[0_0_15px_rgba(0,255,65,0.05)] cursor-pointer"
                >
                  Format Code (Prettier)
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
