export interface DocumentUploadResponse {
  id: string;
  title: string;
  status: string;
}

export interface ChunkWithSimilarity {
  id: string;
  document_id: string;
  content: string;
  chunk_index: number;
  metadata: Record<string, unknown>;
  similarity: number;
}
