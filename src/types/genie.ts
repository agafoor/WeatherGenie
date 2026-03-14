export interface GenieConversationResponse {
  conversation_id: string;
  message_id: string;
}

export interface GenieMessageStatus {
  status: "EXECUTING_QUERY" | "COMPLETED" | "FAILED" | "CANCELLED";
  attachments?: GenieAttachment[];
}

export interface GenieAttachment {
  id: string;
  type: string;
  text?: {
    content: string;
    truncated: boolean;
  };
  query?: {
    query: string;
    description: string;
  };
}

export interface GenieQueryResult {
  columns: string[];
  rows: unknown[][];
}
