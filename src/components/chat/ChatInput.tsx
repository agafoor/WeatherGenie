"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Square } from "lucide-react";
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
    <div className="border-t border-sky-100 dark:border-sky-900/40 bg-gradient-to-b from-white to-sky-50/30 dark:from-slate-900 dark:to-slate-950 px-4 py-3">
      <div className="flex items-end gap-2 max-w-3xl mx-auto">
        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about weather..."
            disabled={disabled}
            rows={1}
            className="w-full resize-none rounded-2xl border border-sky-200 dark:border-sky-800 bg-white dark:bg-slate-800 px-4 py-2.5 pr-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 placeholder:text-sky-300 dark:placeholder:text-sky-700 disabled:opacity-50 shadow-sm transition-shadow focus:shadow-md"
          />
        </div>
        <Button
          size="icon"
          className={cn(
            "h-10 w-10 shrink-0 rounded-2xl shadow-sm transition-all",
            isStreaming
              ? "bg-red-500 hover:bg-red-600 shadow-red-200 dark:shadow-red-900/40"
              : "bg-sky-500 hover:bg-sky-600 shadow-sky-200 dark:shadow-sky-900/40"
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
      <p className="text-center text-[10px] text-sky-300 dark:text-sky-700 mt-2">
        Press <kbd className="font-mono">Enter</kbd> to send · <kbd className="font-mono">Shift+Enter</kbd> for new line
      </p>
    </div>
  );
}
