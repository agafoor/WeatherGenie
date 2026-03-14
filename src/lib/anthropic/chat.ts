import { getAnthropicClient } from "./client";
import { WEATHER_EXPERT_SYSTEM_PROMPT, RAG_SYSTEM_PROMPT } from "./prompts";
import type { MessageSource } from "@/types/database";

interface StreamCallbacks {
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (error: Error) => void;
}

export async function streamGeneralChat(
  messages: { role: "user" | "assistant"; content: string }[],
  callbacks: StreamCallbacks
) {
  const client = getAnthropicClient();

  try {
    const stream = client.messages.stream({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2048,
      system: WEATHER_EXPERT_SYSTEM_PROMPT,
      messages,
    });

    for await (const event of stream) {
      if (
        event.type === "content_block_delta" &&
        event.delta.type === "text_delta"
      ) {
        callbacks.onDelta(event.delta.text);
      }
    }
    callbacks.onDone();
  } catch (error) {
    callbacks.onError(error as Error);
  }
}

export async function streamRAGChat(
  messages: { role: "user" | "assistant"; content: string }[],
  sources: MessageSource[],
  callbacks: StreamCallbacks
) {
  const client = getAnthropicClient();

  const context = sources
    .map(
      (s, i) =>
        `[${i + 1}] Document: "${s.title}" (relevance: ${Math.round(s.score * 100)}%)\n${s.excerpt}`
    )
    .join("\n\n---\n\n");

  const systemPrompt = RAG_SYSTEM_PROMPT.replace("{context}", context);

  try {
    const stream = client.messages.stream({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2048,
      system: systemPrompt,
      messages,
    });

    for await (const event of stream) {
      if (
        event.type === "content_block_delta" &&
        event.delta.type === "text_delta"
      ) {
        callbacks.onDelta(event.delta.text);
      }
    }
    callbacks.onDone();
  } catch (error) {
    callbacks.onError(error as Error);
  }
}
