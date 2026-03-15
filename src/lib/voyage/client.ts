const VOYAGE_API_URL = "https://api.voyageai.com/v1/embeddings";
const MAX_RETRIES = 4;

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function generateEmbeddings(
  texts: string[]
): Promise<number[][]> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const response = await fetch(VOYAGE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.VOYAGE_API_KEY}`,
      },
      body: JSON.stringify({
        input: texts,
        model: "voyage-3",
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.data.map((item: { embedding: number[] }) => item.embedding);
    }

    // Rate limited (429) or server error (5xx) — back off and retry
    if (response.status === 429 || response.status >= 500) {
      const error = await response.text();
      lastError = new Error(`Voyage AI API error: ${error}`);
      // Exponential backoff: 2s, 4s, 8s, 16s
      const delay = Math.pow(2, attempt + 1) * 1000;
      console.warn(
        `Voyage AI rate limited (attempt ${attempt + 1}/${MAX_RETRIES}), retrying in ${delay / 1000}s...`
      );
      await sleep(delay);
      continue;
    }

    // Non-retryable error (4xx other than 429)
    const error = await response.text();
    throw new Error(`Voyage AI API error: ${error}`);
  }

  throw lastError ?? new Error("Voyage AI API failed after max retries");
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const embeddings = await generateEmbeddings([text]);
  return embeddings[0];
}
