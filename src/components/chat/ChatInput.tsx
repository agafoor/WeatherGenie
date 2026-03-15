"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Square, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  onStop?: () => void;
  isStreaming?: boolean;
  disabled?: boolean;
}

export function ChatInput({
  onSend,
  onStop,
  isStreaming,
  disabled,
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 150) + "px";
    }
  }, [input]);

  function handleSubmit() {
    if (isStreaming) {
      onStop?.();
      return;
    }
    if (!input.trim() || disabled) return;
    onSend(input.trim());
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className="border-t border-sky-200/30 dark:border-white/5 glass px-4 py-3 z-10">
      <div className="flex items-end gap-2 max-w-3xl mx-auto">
        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about weather, climate, or forecasts..."
            disabled={disabled}
            rows={1}
            className="w-full resize-none rounded-2xl border border-sky-200/60 dark:border-white/10 bg-white/70 dark:bg-slate-800/60 backdrop-blur-sm px-4 py-2.5 pr-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400/50 focus:border-sky-400/50 placeholder:text-sky-300 dark:placeholder:text-sky-700 disabled:opacity-50 shadow-sm transition-all focus:shadow-md focus:shadow-sky-200/20"
          />
        </div>
        <Button
          size="icon"
          className={cn(
            "h-10 w-10 shrink-0 rounded-2xl shadow-md transition-all",
            isStreaming
              ? "bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-red-300/30 dark:shadow-red-900/40"
              : "bg-gradient-to-br from-sky-400 to-sky-600 hover:from-sky-500 hover:to-sky-700 shadow-sky-300/30 dark:shadow-sky-900/40 hover:shadow-lg hover:shadow-sky-300/40"
          )}
          onClick={handleSubmit}
          disabled={disabled && !isStreaming}
        >
          {isStreaming ? (
            <Square className="h-4 w-4 text-white" />
          ) : (
            <Send className="h-4 w-4 text-white" />
          )}
        </Button>
      </div>
      <p className="text-center text-[10px] text-sky-400/60 dark:text-sky-600/60 mt-2 flex items-center justify-center gap-1">
        <Zap className="h-2.5 w-2.5" />
        <kbd className="font-mono">Enter</kbd> to send · <kbd className="font-mono">Shift+Enter</kbd> for new line
      </p>
    </div>
  );
}
