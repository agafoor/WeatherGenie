export interface Profile {
  id: string;
  email: string;
  display_name: string | null;
  role: "admin" | "user";
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  title: string;
  source: string | null;
  file_path: string;
  file_type: "pdf" | "txt" | "md" | "docx";
  file_size: number | null;
  status: "pending" | "processing" | "ready" | "error";
  error_message: string | null;
  chunk_count: number;
  uploaded_by: string;
  created_at: string;
}

export interface DocumentChunk {
  id: string;
  document_id: string;
  content: string;
  chunk_index: number;
  token_count: number | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  genie_room_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  message_type: "general" | "research" | "analytics";
  sources: MessageSource[];
  genie_metadata: GenieMetadata | null;
  token_count: number | null;
  created_at: string;
}

export interface MessageSource {
  document_id: string;
  chunk_id: string;
  title: string;
  excerpt: string;
  score: number;
}

export interface GenieMetadata {
  sql_query?: string;
  columns?: string[];
  rows?: unknown[][];
  genie_room_name?: string;
}

export interface GenieRoom {
  id: string;
  name: string;
  space_id: string;
  description: string | null;
  databricks_host: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
