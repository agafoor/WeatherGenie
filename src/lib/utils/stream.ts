export function createSSEStream() {
  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  async function sendEvent(type: string, data: unknown) {
    const payload = `data: ${JSON.stringify({ type, data })}\n\n`;
    await writer.write(encoder.encode(payload));
  }

  async function close() {
    try {
      await writer.close();
    } catch {
      // Already closed
    }
  }

  return {
    readable: stream.readable,
    sendEvent,
    close,
    writer,
  };
}

export function createSSEResponse(readable: ReadableStream) {
  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
