import { describe, it, expect, vi, beforeEach } from "vitest";

let supabaseMock: Record<string, unknown>;
let adminMock: Record<string, unknown>;

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => supabaseMock),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(() => adminMock),
}));

vi.mock("@/lib/rag/pipeline", () => ({
  processDocument: vi.fn().mockResolvedValue(undefined),
}));

function makeUserClient({ authed = true, isAdmin = true } = {}) {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: authed ? { id: "u1" } : null },
      }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { role: isAdmin ? "admin" : "user" },
            error: null,
          }),
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
        order: vi.fn().mockResolvedValue({ data: [{ id: "d1", title: "Doc" }], error: null }),
      }),
    }),
  };
}

function makeAdminClient({ uploadError = null as null | { message: string }, insertedDoc = { id: "doc-1" } } = {}) {
  return {
    storage: {
      from: vi.fn().mockReturnValue({
        upload: vi.fn().mockResolvedValue({ error: uploadError }),
      }),
    },
    from: vi.fn().mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: insertedDoc, error: null }),
        }),
      }),
    }),
  };
}

/**
 * Build a fake Request whose formData() is a vi.fn() stub.
 * This avoids jsdom's incomplete File/FormData implementation inside Request.
 */
function makeRequest(fileName: string | null = "report.pdf") {
  const fileObj = fileName
    ? { name: fileName, size: 100 }
    : null;
  return {
    formData: vi.fn().mockResolvedValue({
      get: vi.fn().mockReturnValue(fileObj),
    }),
  } as unknown as Request;
}

const { GET, POST } = await import("@/app/api/documents/route");

describe("GET /api/documents", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    supabaseMock = makeUserClient({ authed: false });
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns documents list for authenticated user", async () => {
    supabaseMock = makeUserClient();
    const res = await GET();
    expect(res.status).toBe(200);
  });
});

describe("POST /api/documents", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    supabaseMock = makeUserClient({ authed: false });
    adminMock = makeAdminClient();
    const res = await POST(makeRequest());
    expect(res.status).toBe(401);
  });

  it("returns 403 when user is not admin", async () => {
    supabaseMock = makeUserClient({ isAdmin: false });
    adminMock = makeAdminClient();
    const res = await POST(makeRequest());
    expect(res.status).toBe(403);
  });

  it("returns 400 when no file is provided", async () => {
    supabaseMock = makeUserClient({ isAdmin: true });
    adminMock = makeAdminClient();
    const res = await POST(makeRequest(null));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("No file");
  });

  it("returns 400 for an unsupported file type", async () => {
    supabaseMock = makeUserClient({ isAdmin: true });
    adminMock = makeAdminClient();
    const res = await POST(makeRequest("image.png"));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("Unsupported");
  });

  it("returns 500 when storage upload fails", async () => {
    supabaseMock = makeUserClient({ isAdmin: true });
    adminMock = makeAdminClient({ uploadError: { message: "Storage error" } });
    const res = await POST(makeRequest("report.pdf"));
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toContain("Upload failed");
  });

  it("returns the new document on success", async () => {
    supabaseMock = makeUserClient({ isAdmin: true });
    adminMock = makeAdminClient({ insertedDoc: { id: "doc-99", title: "report" } });
    const res = await POST(makeRequest("report.pdf"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.id).toBe("doc-99");
  });

  it("accepts all supported file types: pdf, txt, md, docx", async () => {
    for (const ext of ["pdf", "txt", "md", "docx"]) {
      supabaseMock = makeUserClient({ isAdmin: true });
      adminMock = makeAdminClient({ insertedDoc: { id: `doc-${ext}` } });
      const res = await POST(makeRequest(`file.${ext}`));
      expect(res.status).toBe(200);
    }
  });
});
