import { encodingForModel } from "js-tiktoken";

const CHUNK_SIZE = 500; // tokens
const CHUNK_OVERLAP = 50; // tokens

export interface TextChunk {
  content: string;
  index: number;
  tokenCount: number;
}

export function chunkText(text: string): TextChunk[] {
  const enc = encodingForModel("gpt-4o"); // cl100k_base compatible
  const chunks: TextChunk[] = [];

  // Split by paragraphs first
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim());

  let currentChunk = "";
  let currentTokens = 0;
  let chunkIndex = 0;

  for (const paragraph of paragraphs) {
    const paragraphTokens = enc.encode(paragraph).length;

    // If single paragraph exceeds chunk size, split by sentences
    if (paragraphTokens > CHUNK_SIZE) {
      if (currentChunk) {
        chunks.push({
          content: currentChunk.trim(),
          index: chunkIndex++,
          tokenCount: currentTokens,
        });
        currentChunk = "";
        currentTokens = 0;
      }

      const sentences = paragraph.match(/[^.!?]+[.!?]+/g) || [paragraph];
      for (const sentence of sentences) {
        const sentenceTokens = enc.encode(sentence).length;
        if (currentTokens + sentenceTokens > CHUNK_SIZE && currentChunk) {
          chunks.push({
            content: currentChunk.trim(),
            index: chunkIndex++,
            tokenCount: currentTokens,
          });
          // Keep overlap
          const words = currentChunk.trim().split(/\s+/);
          const overlapText = words.slice(-20).join(" ");
          currentChunk = overlapText + " " + sentence;
          currentTokens = enc.encode(currentChunk).length;
        } else {
          currentChunk += " " + sentence;
          currentTokens += sentenceTokens;
        }
      }
    } else if (currentTokens + paragraphTokens > CHUNK_SIZE) {
      // Current chunk is full, start new one with overlap
      chunks.push({
        content: currentChunk.trim(),
        index: chunkIndex++,
        tokenCount: currentTokens,
      });

      // Create overlap from end of previous chunk
      const words = currentChunk.trim().split(/\s+/);
      const overlapText = words.slice(-20).join(" ");
      currentChunk = overlapText + "\n\n" + paragraph;
      currentTokens = enc.encode(currentChunk).length;
    } else {
      currentChunk += "\n\n" + paragraph;
      currentTokens += paragraphTokens;
    }
  }

  // Don't forget the last chunk
  if (currentChunk.trim()) {
    chunks.push({
      content: currentChunk.trim(),
      index: chunkIndex,
      tokenCount: currentTokens,
    });
  }

  return chunks;
}
