"use client";

import { useEffect, useRef } from "react";
import { ChatBubble } from "./ChatBubble";
import { TypingIndicator } from "./TypingIndicator";
import type { ChatMessage } from "@/types/chat";

interface ChatMessagesProps {
  messages: ChatMessage[];
  isStreaming: boolean;
  onSourceClick?: (index: number) => void;
}

export function ChatMessages({
  messages,
  isStreaming,
  onSourceClick,
}: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  return (
    // Native overflow-y-auto is far more reliable than ScrollArea in a flex column
    <div ref={scrollRef} className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto py-6 px-2">
        {messages.map((message) => (
          <ChatBubble
            key={message.id}
            message={message}
            onSourceClick={onSourceClick}
          />
        ))}
        {isStreaming &&
          messages.length > 0 &&
          !messages[messages.length - 1]?.content && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
