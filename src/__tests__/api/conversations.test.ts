import { describe, it, expect, vi, beforeEach } from "vitest";

// ── helpers ──────────────────────────────────────────────────────────────────
function makeSupabaseMock({
  user = { id: "user-1" },
  authed = true,
  conversationOwnerId = "user-1",
  messagesData = [{ id: "m1", content: "hi" }],
  deleteError = null as null | { message: string },
}: {
  user?: { id: string } | null;
  authed?: boolean;
  conversationOwnerId?: string;
  messagesData?: object[];
  deleteError?: null | { message: string };
} = {}) {
  // chain builder for .select().eq().order()  and  .select().eq().single()
  const single = vi.fn().mockResolvedValue(
    authed ? { data: { user_id: conversationOwnerId }, error: null } : { data: null, error: null }
  );
  const order = vi.fn().mockResolvedValue({ data: messagesData, error: null });
  const deleteEq = vi.fn().mockResolvedValue({ error: deleteError });
  const selectEq = vi.fn().mockReturnValue({ order, single });
  const deleteChain = vi.fn().mockReturnValue({ eq: deleteEq });

  const from = vi.fn().mockReturnValue({
    select: vi.fn().mockReturnValue({ eq: selectEq }),
    delete: vi.fn().mockReturnValue({ eq: deleteEq }),
  });

  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: authed ? user : null },
      }),
    },
    from,
  };
}

// ── mocks ─────────────────────────────────────────────────────────────────────
let supabaseMockInstance: ReturnType<typeof makeSupabaseMock>;

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => supabaseMockInstance),
}));

const { GET, DELETE } = await import("@/app/api/conversations/[id]/route");

describe("GET /api/conversations/[id]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    supabaseMockInstance = makeSupabaseMock({ authed: false });
    const req = new Request("http://localhost/api/conversations/c1");
    const res = await GET(req, { params: Promise.resolve({ id: "c1" }) });
    expect(res.status).toBe(401);
  });

  it("returns messages for the conversation", async () => {
    supabaseMockInstance = makeSupabaseMock({
      messagesData: [{ id: "m1", content: "Hello" }],
    });
    const req = new Request("http://localhost/api/conversations/c1");
    const res = await GET(req, { params: Promise.resolve({ id: "c1" }) });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body[0].id).toBe("m1");
  });
});

describe("DELETE /api/conversations/[id]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    supabaseMockInstance = makeSupabaseMock({ authed: false });
    const req = new Request("http://localhost/api/conversations/c1");
    const res = await DELETE(req, { params: Promise.resolve({ id: "c1" }) });
    expect(res.status).toBe(401);
  });

  it("returns 403 when conversation belongs to another user", async () => {
    supabaseMockInstance = makeSupabaseMock({
      user: { id: "user-1" },
      conversationOwnerId: "user-2", // different owner
    });
    const req = new Request("http://localhost/api/conversations/c1");
    const res = await DELETE(req, { params: Promise.resolve({ id: "c1" }) });
    expect(res.status).toBe(403);
  });

  it("returns 200 and success:true for own conversation", async () => {
    supabaseMockInstance = makeSupabaseMock({
      user: { id: "user-1" },
      conversationOwnerId: "user-1",
    });
    // Override from() to support both the ownership .select().eq().single() call
    // and the .delete().eq() call
    const single = vi.fn().mockResolvedValue({ data: { user_id: "user-1" }, error: null });
    const deleteEq = vi.fn().mockResolvedValue({ error: null });
    const from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ single }) }),
      delete: vi.fn().mockReturnValue({ eq: deleteEq }),
    });
    supabaseMockInstance = {
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } } }) },
      from,
    } as unknown as typeof supabaseMockInstance;

    const req = new Request("http://localhost/api/conversations/c1");
    const res = await DELETE(req, { params: Promise.resolve({ id: "c1" }) });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });

  it("returns 404 when conversation is not found", async () => {
    const single = vi.fn().mockResolvedValue({ data: null, error: null });
    const from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ single }) }),
    });
    supabaseMockInstance = {
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } } }) },
      from,
    } as unknown as typeof supabaseMockInstance;

    const req = new Request("http://localhost/api/conversations/c1");
    const res = await DELETE(req, { params: Promise.resolve({ id: "c1" }) });
    expect(res.status).toBe(404);
  });
});
