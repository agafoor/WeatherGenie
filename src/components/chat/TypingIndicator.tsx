export function TypingIndicator() {
  return (
    <div className="flex items-end gap-3 px-4 py-2">
      {/* Cloud avatar — matches assistant bubble avatar */}
      <div className="shrink-0 h-8 w-8 rounded-full bg-gradient-to-b from-sky-300 to-sky-500 dark:from-sky-700 dark:to-sky-900 flex items-center justify-center shadow shadow-sky-200/60 dark:shadow-sky-900/40 mb-0.5">
        <svg className="h-4 w-4 text-white drop-shadow animate-sway" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6.5 20Q4.22 20 2.61 18.43 1 16.85 1 14.58q0-1.95 1.17-3.48 1.18-1.53 3.08-1.95.51-2.18 2.19-3.66Q9.12 4 11.25 4q2.55 0 4.28 1.73Q17.25 7.45 17.25 10q0 .23-.02.5H17.5q1.88 0 3.19 1.31Q22 13.12 22 15q0 1.88-1.31 3.19Q19.38 20 17.5 20Z"/>
        </svg>
      </div>
      <div className="flex items-center gap-2.5 glass rounded-2xl rounded-bl-sm px-4 py-3 border border-sky-200/40 dark:border-white/8">
        <div className="flex gap-1.5">
          <span className="h-2 w-2 rounded-full bg-gradient-to-b from-sky-300 to-sky-500 animate-bounce [animation-delay:-0.3s]" />
          <span className="h-2 w-2 rounded-full bg-gradient-to-b from-sky-300 to-sky-500 animate-bounce [animation-delay:-0.15s]" />
          <span className="h-2 w-2 rounded-full bg-gradient-to-b from-sky-300 to-sky-500 animate-bounce" />
        </div>
        <span className="text-xs text-sky-500/70 dark:text-sky-400/60 font-medium">Forecasting…</span>
      </div>
    </div>
  );
}
