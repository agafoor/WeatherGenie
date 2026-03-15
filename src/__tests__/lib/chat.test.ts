import { describe, it, expect, vi, beforeEach } from "vitest";
import { streamGeneralChat, streamRAGChat } from "@/lib/anthropic/chat";
import type { MessageSource } from "@/types/database";

async function* makeStream(events: object[]) {
  for (const e of events) yield e;
}

const mockStream = vi.fn();

vi.mock("@/lib/anthropic/client", () => ({
  getAnthropicClient: () => ({
    messages: { stream: mockStream },
  }),
}));

function textDelta(text: string) {
  return { type: "content_block_delta", delta: { type: "text_delta", text } };
}

const messages = [{ role: "user" as const, content: "Hello" }];

describe("streamGeneralChat", () => {
  beforeEach(() => vi.clearAllMocks());

  it("calls onDelta for each text delta event", async () => {
    mockStream.mockReturnValue(
      makeStream([textDelta("Hello "), textDelta("world")])
    );
    const deltas: string[] = [];
    await streamGeneralChat(messages, {
      onDelta: (t) => deltas.push(t),
      onDone: vi.fn(),
      onError: vi.fn(),
    });
    expect(deltas).toEqual(["Hello ", "world"]);
  });

  it("calls onDone after the stream finishes", async () => {
    mockStream.mockReturnValue(makeStream([textDelta("Hi")]));
    const onDone = vi.fn();
    await streamGeneralChat(messages, { onDelta: vi.fn(), onDone, onError: vi.fn() });
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it("calls onError when the stream throws", async () => {
    mockStream.mockImplementation(() => {
      throw new Error("stream error");
    });
    const onError = vi.fn();
    await streamGeneralChat(messages, { onDelta: vi.fn(), onDone: vi.fn(), onError });
    expect(onError).toHaveBeenCalledWith(expect.any(Error));
    expect(onError.mock.calls[0][0].message).toBe("stream error");
  });

  it("ignores non-text-delta events", async () => {
    mockStream.mockReturnValue(
      makeStream([
        { type: "message_start" },
        textDelta("data"),
        { type: "message_stop" },
      ])
    );
    const deltas: string[] = [];
    await streamGeneralChat(messages, {
      onDelta: (t) => deltas.push(t),
      onDone: vi.fn(),
      onError: vi.fn(),
    });
    expect(deltas).toEqual(["data"]);
  });
});

describe("streamRAGChat", () => {
  beforeEach(() => vi.clearAllMocks());

  const sources: MessageSource[] = [
    { document_id: "d1", chunk_id: "c1", title: "NOAA Report", excerpt: "Rain is...", score: 0.92 },
  ];

  it("injects source context into the system prompt", async () => {
    mockStream.mockReturnValue(makeStream([textDelta("answer")]));
    await streamRAGChat(messages, sources, {
      onDelta: vi.fn(),
      onDone: vi.fn(),
      onError: vi.fn(),
    });
    const callArgs = mockStream.mock.calls[0][0];
    expect(callArgs.system).toContain("NOAA Report");
    expect(callArgs.system).toContain("Rain is...");
    expect(callArgs.system).toContain("92%");
  });

  it("streams deltas the same as streamGeneralChat", async () => {
    mockStream.mockReturnValue(makeStream([textDelta("A"), textDelta("B")]));
    const deltas: string[] = [];
    await streamRAGChat(messages, sources, {
      onDelta: (t) => deltas.push(t),
      onDone: vi.fn(),
      onError: vi.fn(),
    });
    expect(deltas).toEqual(["A", "B"]);
  });

  it("numbers multiple sources correctly in the prompt", async () => {
    const twoSources: MessageSource[] = [
      { document_id: "d1", chunk_id: "c1", title: "Doc A", excerpt: "Excerpt A", score: 0.9 },
      { document_id: "d2", chunk_id: "c2", title: "Doc B", excerpt: "Excerpt B", score: 0.8 },
    ];
    mockStream.mockReturnValue(makeStream([]));
    await streamRAGChat(messages, twoSources, {
      onDelta: vi.fn(),
      onDone: vi.fn(),
      onError: vi.fn(),
    });
    const system = mockStream.mock.calls[0][0].system as string;
    expect(system).toContain("[1]");
    expect(system).toContain("[2]");
    expect(system).toContain("Doc A");
    expect(system).toContain("Doc B");
  });
});
