interface CallErrorViewProps {
  error: string;
  onLeave: () => void;
  onRetry: () => void;
}

export function CallErrorView({ error, onLeave, onRetry }: CallErrorViewProps) {
  return (
    <div className="fixed left-6 bottom-6 z-[90] glass-panel rounded-xl p-3 text-xs text-red-400 flex items-center gap-2">
      <span>Call failed: {error}</span>
      <button
        onClick={onRetry}
        aria-label="Retry joining call"
        className="px-3 min-h-[44px] rounded-md bg-secondary border border-border text-foreground cursor-pointer transition duration-150 ease-out active:scale-[0.97]"
      >
        Retry
      </button>
      <button
        onClick={onLeave}
        aria-label="Close call error"
        className="px-3 min-h-[44px] rounded-md bg-secondary border border-border text-foreground cursor-pointer transition duration-150 ease-out active:scale-[0.97]"
      >
        Close
      </button>
    </div>
  );
}
