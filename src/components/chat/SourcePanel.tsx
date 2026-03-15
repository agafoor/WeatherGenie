"use client";

import { X, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SourceCard } from "./SourceCard";
import type { MessageSource } from "@/types/database";

interface SourcePanelProps {
  sources: MessageSource[];
  highlightedIndex: number | null;
  onClose: () => void;
}

export function SourcePanel({
  sources,
  highlightedIndex,
  onClose,
}: SourcePanelProps) {
  if (sources.length === 0) return null;

  return (
    <div className="w-80 border-l border-sky-200/30 dark:border-white/5 glass flex flex-col shrink-0">
      <div className="flex items-center justify-between p-3 border-b border-sky-200/30 dark:border-white/5">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-emerald-500" />
          <span className="text-sm font-semibold">
            Sources ({sources.length})
          </span>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <ScrollArea className="flex-1 p-3">
        <div className="space-y-2">
          {sources.map((source, i) => (
            <SourceCard
              key={source.chunk_id}
              source={source}
              index={i}
              isHighlighted={highlightedIndex === i}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
