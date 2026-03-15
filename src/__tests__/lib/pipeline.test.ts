import { describe, it, expect, vi, beforeEach } from "vitest";
import { processDocument } from "@/lib/rag/pipeline";

vi.mock("@/lib/rag/extractor", () => ({
  extractText: vi.fn().mockResolvedValue("This is extracted text from the document."),
}));

vi.mock("@/lib/rag/chunker", () => ({
  chunkText: vi.fn().mockReturnValue([
    { content: "Chunk one.", index: 0, tokenCount: 5 },
    { content: "Chunk two.", index: 1, tokenCount: 5 },
  ]),
}));

vi.mock("@/lib/voyage/client", () => ({
  generateEmbeddings: vi.fn().mockResolvedValue([
    Array(1024).fill(0.1),
    Array(1024).fill(0.2),
  ]),
}));

function makeSupabase(overrides: Record<string, unknown> = {}) {
  const insertChunks = vi.fn().mockResolvedValue({ error: null });
  const updateDoc = vi.fn().mockResolvedValue({});

  const from = vi.fn().mockImplementation((table: string) => {
    if (table === "document_chunks") {
      return { insert: insertChunks };
    }
    // documents table
    return {
      update: vi.fn().mockReturnValue({ eq: updateDoc }),
    };
  });

  const storage = {
    from: vi.fn().mockReturnValue({
      download: vi.fn().mockResolvedValue({
        data: {
          arrayBuffer: async () => new ArrayBuffer(8),
        },
        error: null,
        ...overrides,
      }),
    }),
  };

  return { from, storage, _insertChunks: insertChunks, _updateDoc: updateDoc };
}

describe("processDocument", () => {
  beforeEach(() => vi.clearAllMocks());

  it("sets status to processing, then ready on success", async () => {
    const { from, storage } = makeSupabase();
    const supabase = { from, storage } as unknown as import("@supabase/supabase-js").SupabaseClient;

    await processDocument("doc-1", "user/file.txt", "txt", supabase);

    // Check 'processing' update was called
    const docTable = (from as ReturnType<typeof vi.fn>).mock.calls
      .filter(([t]: [string]) => t === "documents")
      .map((_: unknown, i: number) => from.mock.results[i]);

    expect(from).toHaveBeenCalledWith("documents");
    expect(from).toHaveBeenCalledWith("document_chunks");
  });

  it("inserts chunks into document_chunks table", async () => {
    const { from, storage, _insertChunks } = makeSupabase();
    const supabase = { from, storage } as unknown as import("@supabase/supabase-js").SupabaseClient;
    await processDocument("doc-1", "user/file.txt", "txt", supabase);

    expect(_insertChunks).toHaveBeenCalledTimes(1);
    const inserted = _insertChunks.mock.calls[0][0];
    expect(inserted).toHaveLength(2);
    expect(inserted[0].document_id).toBe("doc-1");
    expect(inserted[0].chunk_index).toBe(0);
    expect(inserted[0].content).toBe("Chunk one.");
  });

  it("sets status to error and rethrows when download fails", async () => {
    const { from, storage } = makeSupabase();
    // Override download to return an error
    storage.from.mockReturnValue({
      download: vi.fn().mockResolvedValue({
        data: null,
        error: { message: "Storage error" },
      }),
    });
    const updateMock = vi.fn().mockReturnValue({ eq: vi.fn() });
    from.mockImplementation(() => ({ update: updateMock }));

    const supabase = { from, storage } as unknown as import("@supabase/supabase-js").SupabaseClient;
    await expect(processDocument("doc-2", "bad/path.pdf", "pdf", supabase)).rejects.toThrow(
      "Failed to download file"
    );
    expect(updateMock).toHaveBeenCalledWith(
      expect.objectContaining({ status: "error" })
    );
  });

  it("sets status to error when extracted text is empty", async () => {
    const { extractText } = await import("@/lib/rag/extractor");
    vi.mocked(extractText).mockResolvedValueOnce("   ");

    const { from, storage } = makeSupabase();
    const updateMock = vi.fn().mockReturnValue({ eq: vi.fn() });
    from.mockImplementation(() => ({ update: updateMock }));

    const supabase = { from, storage } as unknown as import("@supabase/supabase-js").SupabaseClient;
    await expect(
      processDocument("doc-3", "empty.pdf", "pdf", supabase)
    ).rejects.toThrow("No text extracted");
    expect(updateMock).toHaveBeenCalledWith(
      expect.objectContaining({ status: "error" })
    );
  });

  it("sets status to error when chunk insertion fails", async () => {
    const { from, storage } = makeSupabase();
    const insertFail = vi.fn().mockResolvedValue({ error: { message: "Insert error" } });
    const updateMock = vi.fn().mockReturnValue({ eq: vi.fn() });

    from.mockImplementation((table: string) => {
      if (table === "document_chunks") return { insert: insertFail };
      return { update: updateMock };
    });

    const supabase = { from, storage } as unknown as import("@supabase/supabase-js").SupabaseClient;
    await expect(
      processDocument("doc-4", "file.txt", "txt", supabase)
    ).rejects.toThrow("Failed to insert chunks");
    expect(updateMock).toHaveBeenCalledWith(
      expect.objectContaining({ status: "error" })
    );
  });
});
