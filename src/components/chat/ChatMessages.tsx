"use client";

import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  return (
    <ScrollArea className="flex-1">
      <div className="max-w-3xl mx-auto py-4">
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
    </ScrollArea>
  );
}
