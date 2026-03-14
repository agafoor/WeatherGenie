import { getAnthropicClient } from "./client";
import { INTENT_CLASSIFICATION_PROMPT } from "./prompts";
import type { IntentType } from "@/types/chat";
import type { GenieRoom } from "@/types/database";

export async function classifyIntent(
  message: string,
  genieRooms: GenieRoom[]
): Promise<IntentType> {
  const client = getAnthropicClient();

  let genieContext = "No data analytics rooms are currently configured.";
  if (genieRooms.length > 0) {
    const roomList = genieRooms
      .map((r) => `- "${r.name}": ${r.description || "Weather data"}`)
      .join("\n");
    genieContext = `Available data analytics rooms:\n${roomList}\n\nIf the user's question could be answered by querying data in these rooms, classify as ANALYTICS.`;
  }

  const systemPrompt = INTENT_CLASSIFICATION_PROMPT.replace(
    "{genie_rooms_context}",
    genieContext
  );

  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 10,
      system: systemPrompt,
      messages: [{ role: "user", content: message }],
    });

    const text =
      response.content[0].type === "text"
        ? response.content[0].text.trim().toUpperCase()
        : "";

    if (text === "RESEARCH") return "research";
    if (text === "ANALYTICS") return "analytics";
    return "general";
  } catch {
    return "general";
  }
}
