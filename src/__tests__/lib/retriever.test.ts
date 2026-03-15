import { describe, it, expect, vi, beforeEach } from "vitest";
import { retrieveChunks } from "@/lib/rag/retriever";

// Mock Voyage embedding client
vi.mock("@/lib/voyage/client", () => ({
  generateEmbedding: vi.fn().mockResolvedValue(Array(1024).fill(0.1)),
}));

function makeSupabase({
  rpcData = [],
  rpcError = null,
  docsData = [],
}: {
  rpcData?: object[];
  rpcError?: object | null;
  docsData?: object[];
} = {}) {
  return {
    rpc: vi.fn().mockResolvedValue({ data: rpcData, error: rpcError }),
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      in: vi.fn().mockResolvedValue({ data: docsData }),
    }),
  } as unknown as import("@supabase/supabase-js").SupabaseClient;
}

describe("retrieveChunks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns an empty array when rpc returns an error", async () => {
    const supabase = makeSupabase({ rpcError: { message: "DB error" } });
    const result = await retrieveChunks("query", supabase);
    expect(result).toEqual([]);
  });

  it("returns an empty array when rpc returns no data", async () => {
    const supabase = makeSupabase({ rpcData: [] });
    const result = await retrieveChunks("query", supabase);
    expect(result).toEqual([]);
  });

  it("enriches chunks with document titles", async () => {
    const chunks = [
      { id: "c1", document_id: "d1", content: "Rain forms ...", chunk_index: 0, metadata: {}, similarity: 0.9 },
    ];
    const docs = [{ id: "d1", title: "Weather Basics" }];
    const supabase = makeSupabase({ rpcData: chunks, docsData: docs });

    const result = await retrieveChunks("What is rain?", supabase);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Weather Basics");
    expect(result[0].similarity).toBe(0.9);
  });

  it("falls back to 'Document' when title is not found", async () => {
    const chunks = [
      { id: "c2", document_id: "d-unknown", content: "...", chunk_index: 0, metadata: {}, similarity: 0.7 },
    ];
    const supabase = makeSupabase({ rpcData: chunks, docsData: [] });
    const result = await retrieveChunks("query", supabase);
    expect(result[0].title).toBe("Document");
  });

  it("passes matchThreshold and matchCount to the rpc call", async () => {
    const supabase = makeSupabase();
    await retrieveChunks("query", supabase, 0.7, 10);
    expect(supabase.rpc).toHaveBeenCalledWith("match_document_chunks", {
      query_embedding: expect.any(String),
      match_threshold: 0.7,
      match_count: 10,
    });
  });

  it("deduplicates document IDs when fetching titles", async () => {
    const chunks = [
      { id: "c1", document_id: "d1", content: "A", chunk_index: 0, metadata: {}, similarity: 0.9 },
      { id: "c2", document_id: "d1", content: "B", chunk_index: 1, metadata: {}, similarity: 0.8 },
    ];
    const docs = [{ id: "d1", title: "Shared Doc" }];
    const supabase = makeSupabase({ rpcData: chunks, docsData: docs });
    const fromMock = supabase.from as ReturnType<typeof vi.fn>;
    await retrieveChunks("query", supabase);
    const inCall = fromMock.mock.results[0].value.select.mock.results[0].value.in;
    expect(inCall).toHaveBeenCalledWith("id", ["d1"]); // deduplicated
  });
});
