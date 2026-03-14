import { SupabaseClient } from "@supabase/supabase-js";
import { extractText } from "./extractor";
import { chunkText } from "./chunker";
import { generateEmbeddings } from "@/lib/voyage/client";

export async function processDocument(
  documentId: string,
  filePath: string,
  fileType: string,
  supabase: SupabaseClient
): Promise<void> {
  try {
    // Update status to processing
    await supabase
      .from("documents")
      .update({ status: "processing" })
      .eq("id", documentId);

    // Download file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("documents")
      .download(filePath);

    if (downloadError || !fileData) {
      throw new Error(`Failed to download file: ${downloadError?.message}`);
    }

    // Extract text
    const buffer = Buffer.from(await fileData.arrayBuffer());
    const text = await extractText(buffer, fileType);

    if (!text.trim()) {
      throw new Error("No text extracted from document");
    }

    // Chunk text
    const chunks = chunkText(text);

    // Generate embeddings in batches of 128
    const BATCH_SIZE = 128;
    const allChunksWithEmbeddings: {
      content: string;
      index: number;
      tokenCount: number;
      embedding: number[];
    }[] = [];

    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batch = chunks.slice(i, i + BATCH_SIZE);
      const embeddings = await generateEmbeddings(
        batch.map((c) => c.content)
      );
      batch.forEach((chunk, j) => {
        allChunksWithEmbeddings.push({
          ...chunk,
          embedding: embeddings[j],
        });
      });
    }

    // Insert chunks into database
    const chunkRows = allChunksWithEmbeddings.map((chunk) => ({
      document_id: documentId,
      content: chunk.content,
      chunk_index: chunk.index,
      token_count: chunk.tokenCount,
      embedding: JSON.stringify(chunk.embedding),
      metadata: {},
    }));

    // Insert in batches of 50
    for (let i = 0; i < chunkRows.length; i += 50) {
      const batch = chunkRows.slice(i, i + 50);
      const { error: insertError } = await supabase
        .from("document_chunks")
        .insert(batch);

      if (insertError) {
        throw new Error(`Failed to insert chunks: ${insertError.message}`);
      }
    }

    // Update document status
    await supabase
      .from("documents")
      .update({
        status: "ready",
        chunk_count: chunks.length,
      })
      .eq("id", documentId);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Processing failed";
    await supabase
      .from("documents")
      .update({
        status: "error",
        error_message: errorMessage,
      })
      .eq("id", documentId);
    throw error;
  }
}
