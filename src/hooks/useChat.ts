"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ChatMessage, IntentType, StreamEvent } from "@/types/chat";
import type { MessageSource } from "@/types/database";

interface UseChatOptions {
  conversationId: string | null;
  genieRoomId?: string;
  onConversationCreated?: (id: string) => void;
  onTitleGenerated?: (title: string) => void;
}

export function useChat({
  conversationId,
  genieRoomId,
  onConversationCreated,
  onTitleGenerated,
}: UseChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentIntent, setCurrentIntent] = useState<IntentType | null>(null);
  const [currentSources, setCurrentSources] = useState<MessageSource[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);
  const supabase = createClient();

  // Abort any in-flight request when the hook unmounts
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const loadMessages = useCallback(async (convId: string) => {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true });

    if (data) {
      setMessages(
        data.map((m) => ({
          id: m.id,
          role: m.role as "user" | "assistant",
          content: m.content,
          message_type: m.message_type as IntentType,
          sources: (m.sources as MessageSource[]) || [],
          genie_metadata: m.genie_metadata,
          created_at: m.created_at,
        }))
      );
    }
  }, []);

  async function sendMessage(content: string) {
    if (isStreaming || !content.trim()) return;

    let activeConvId = conversationId;

    // Create conversation if needed
    if (!activeConvId) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: conv } = await supabase
        .from("conversations")
        .insert({ user_id: user.id, title: content.slice(0, 50) })
        .select()
        .single();

      if (!conv) return;
      activeConvId = conv.id;
      onConversationCreated?.(conv.id);
    }

    // Add user message optimistically
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      message_type: "general",
      sources: [],
      genie_metadata: null,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Add placeholder assistant message
    const assistantId = crypto.randomUUID();
    const assistantMessage: ChatMessage = {
      id: assistantId,
      role: "assistant",
      content: "",
      message_type: "general",
      sources: [],
      genie_metadata: null,
      created_at: new Date().toISOString(),
      isStreaming: true,
    };
    setMessages((prev) => [...prev, assistantMessage]);
    setIsStreaming(true);
    setCurrentSources([]);

    // Send to API
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: activeConvId,
          message: content,
          genieRoomId,
        }),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error("Failed to get response");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event: StreamEvent = JSON.parse(line.slice(6));

            switch (event.type) {
              case "intent":
                setCurrentIntent(event.data as IntentType);
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId
                      ? { ...m, message_type: event.data as IntentType }
                      : m
                  )
                );
                break;

              case "sources":
                setCurrentSources(event.data as MessageSource[]);
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId
                      ? { ...m, sources: event.data as MessageSource[] }
                      : m
                  )
                );
                break;

              case "delta":
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId
                      ? { ...m, content: m.content + (event.data as string) }
                      : m
                  )
                );
                break;

              case "done": {
                const doneData = event.data as { title?: string };
                if (doneData.title) {
                  onTitleGenerated?.(doneData.title);
                }
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId ? { ...m, isStreaming: false } : m
                  )
                );
                break;
              }

              case "error":
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId
                      ? {
                          ...m,
                          content:
                            "Sorry, something went wrong. Please try again.",
                          isStreaming: false,
                        }
                      : m
                  )
                );
                break;
            }
          } catch {
            // Skip malformed SSE events
          }
        }
      }
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  content: "Sorry, something went wrong. Please try again.",
                  isStreaming: false,
                }
              : m
          )
        );
      }
    } finally {
      setIsStreaming(false);
      setCurrentIntent(null);
      abortControllerRef.current = null;
    }
  }

  const stopStreaming = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsStreaming(false);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isStreaming,
    currentIntent,
    currentSources,
    sendMessage,
    stopStreaming,
    loadMessages,
    clearMessages,
  };
}
