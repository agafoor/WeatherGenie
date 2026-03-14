import { SupabaseClient } from "@supabase/supabase-js";
import { generateEmbedding } from "@/lib/voyage/client";

export interface RetrievedChunk {
  id: string;
  document_id: string;
  content: string;
  chunk_index: number;
  metadata: Record<string, unknown>;
  similarity: number;
  title?: string;
}

export async function retrieveChunks(
  query: string,
  supabase: SupabaseClient,
  matchThreshold = 0.5,
  matchCount = 5
): Promise<RetrievedChunk[]> {
  // Generate query embedding
  const queryEmbedding = await generateEmbedding(query);

  // Call pgvector similarity search
  const { data, error } = await supabase.rpc("match_document_chunks", {
    query_embedding: JSON.stringify(queryEmbedding),
    match_threshold: matchThreshold,
    match_count: matchCount,
  });

  if (error) {
    console.error("Retrieval error:", error);
    return [];
  }

  if (!data || data.length === 0) return [];

  // Fetch document titles
  const docIds = [...new Set(data.map((d: RetrievedChunk) => d.document_id))];
  const { data: docs } = await supabase
    .from("documents")
    .select("id, title")
    .in("id", docIds);

  const docTitles = new Map(docs?.map((d: { id: string; title: string }) => [d.id, d.title]) || []);

  return data.map((chunk: RetrievedChunk) => ({
    ...chunk,
    title: docTitles.get(chunk.document_id) || "Document",
  }));
}
