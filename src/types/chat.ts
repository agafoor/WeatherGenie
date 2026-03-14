import type { MessageSource, GenieMetadata } from "./database";

export type IntentType = "general" | "research" | "analytics";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  message_type: IntentType;
  sources: MessageSource[];
  genie_metadata: GenieMetadata | null;
  created_at: string;
  isStreaming?: boolean;
}

export interface StreamEvent {
  type: "intent" | "sources" | "delta" | "done" | "error";
  data: unknown;
}

export interface ChatRequest {
  conversationId: string;
  message: string;
  genieRoomId?: string;
}
