import { Cloud } from "lucide-react";

export function TypingIndicator() {
  return (
    <div className="flex items-end gap-3 px-4 py-2">
      {/* Cloud avatar matches assistant bubble */}
      <div className="shrink-0 h-8 w-8 rounded-full bg-sky-100 dark:bg-sky-900/40 flex items-center justify-center">
        <Cloud className="h-4 w-4 text-sky-500" />
      </div>
      <div className="flex items-center gap-2.5 bg-white dark:bg-slate-800 border border-sky-100 dark:border-sky-900/30 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
        <div className="flex gap-1">
          <span className="h-2 w-2 rounded-full bg-sky-400 animate-bounce [animation-delay:-0.3s]" />
          <span className="h-2 w-2 rounded-full bg-sky-400 animate-bounce [animation-delay:-0.15s]" />
          <span className="h-2 w-2 rounded-full bg-sky-400 animate-bounce" />
        </div>
        <span className="text-xs text-muted-foreground">Forecasting…</span>
      </div>
    </div>
  );
}
