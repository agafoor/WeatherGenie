import { describe, it, expect } from "vitest";
import { createSSEStream, createSSEResponse } from "@/lib/utils/stream";

/**
 * readStream must be started BEFORE writing — TransformStream only passes data
 * through when a reader is already consuming the readable side.
 */
async function collectStream(
  readable: ReadableStream<Uint8Array>,
  write: () => Promise<void>
): Promise<string> {
  const decoder = new TextDecoder();
  const reader = readable.getReader();
  const writePromise = write(); // fire writes concurrently with the read loop
  let result = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    result += decoder.decode(value, { stream: true });
  }
  await writePromise;
  return result;
}

describe("createSSEStream", () => {
  it("sends a correctly formatted SSE event", async () => {
    const { readable, sendEvent, close } = createSSEStream();
    const output = await collectStream(readable, async () => {
      await sendEvent("delta", "hello");
      await close();
    });
    expect(output).toBe('data: {"type":"delta","data":"hello"}\n\n');
  });

  it("sends multiple events in order", async () => {
    const { readable, sendEvent, close } = createSSEStream();
    const output = await collectStream(readable, async () => {
      await sendEvent("intent", "general");
      await sendEvent("delta", "world");
      await sendEvent("done", { title: "Chat" });
      await close();
    });
    expect(output).toContain('"type":"intent"');
    expect(output).toContain('"type":"delta"');
    expect(output).toContain('"type":"done"');
    expect(output.indexOf('"intent"')).toBeLessThan(output.indexOf('"delta"'));
    expect(output.indexOf('"delta"')).toBeLessThan(output.indexOf('"done"'));
  });

  it("serialises object payloads correctly", async () => {
    const { readable, sendEvent, close } = createSSEStream();
    const output = await collectStream(readable, async () => {
      await sendEvent("sources", [{ id: "1", title: "Doc A" }]);
      await close();
    });
    const parsed = JSON.parse(output.replace("data: ", "").trim());
    expect(parsed.type).toBe("sources");
    expect(parsed.data[0].title).toBe("Doc A");
  });

  it("close() is idempotent — calling twice does not throw", async () => {
    const { readable, sendEvent, close } = createSSEStream();
    await collectStream(readable, async () => {
      await sendEvent("delta", "x");
      await close();
      await expect(close()).resolves.not.toThrow();
    });
  });
});

describe("createSSEResponse", () => {
  it("returns a Response with the correct SSE headers", () => {
    const { readable } = createSSEStream();
    const response = createSSEResponse(readable);
    expect(response).toBeInstanceOf(Response);
    expect(response.headers.get("Content-Type")).toBe("text/event-stream");
    expect(response.headers.get("Cache-Control")).toBe("no-cache, no-transform");
    expect(response.headers.get("Connection")).toBe("keep-alive");
  });
});
