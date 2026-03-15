import { describe, it, expect, vi, beforeEach } from "vitest";
import { classifyIntent } from "@/lib/anthropic/intent-router";
import type { GenieRoom } from "@/types/database";

const mockCreate = vi.fn();

vi.mock("@/lib/anthropic/client", () => ({
  getAnthropicClient: () => ({
    messages: { create: mockCreate },
  }),
}));

function textResponse(text: string) {
  return { content: [{ type: "text", text }] };
}

const noRooms: GenieRoom[] = [];
const withRooms: GenieRoom[] = [
  {
    id: "r1", name: "Weather DB", description: "Temperature data",
    space_id: "s1", databricks_host: "https://dbc.example.com",
    is_active: true, created_at: new Date().toISOString(), created_by: "u1",
  },
];

describe("classifyIntent", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 'general' for a GENERAL response", async () => {
    mockCreate.mockResolvedValue(textResponse("GENERAL"));
    expect(await classifyIntent("What causes a tornado?", noRooms)).toBe("general");
  });

  it("returns 'research' for a RESEARCH response", async () => {
    mockCreate.mockResolvedValue(textResponse("RESEARCH"));
    expect(await classifyIntent("What did the NOAA report say?", noRooms)).toBe("research");
  });

  it("returns 'analytics' for an ANALYTICS response", async () => {
    mockCreate.mockResolvedValue(textResponse("ANALYTICS"));
    expect(await classifyIntent("Show rainfall for last month", withRooms)).toBe("analytics");
  });

  it("returns 'general' for an unrecognised response (safe fallback)", async () => {
    mockCreate.mockResolvedValue(textResponse("UNKNOWN_INTENT"));
    expect(await classifyIntent("hello", noRooms)).toBe("general");
  });

  it("returns 'general' when Anthropic call throws (error fallback)", async () => {
    mockCreate.mockRejectedValue(new Error("API down"));
    expect(await classifyIntent("test", noRooms)).toBe("general");
  });

  it("is case-insensitive — 'general' (lowercase) still resolves", async () => {
    mockCreate.mockResolvedValue(textResponse("general"));
    // The router uppercases the response, so 'general'.toUpperCase() === 'GENERAL'
    expect(await classifyIntent("Hi", noRooms)).toBe("general");
  });

  it("includes genie room context in the system prompt when rooms exist", async () => {
    mockCreate.mockResolvedValue(textResponse("ANALYTICS"));
    await classifyIntent("Show me data", withRooms);
    const callArgs = mockCreate.mock.calls[0][0];
    expect(callArgs.system).toContain("Weather DB");
    expect(callArgs.system).toContain("Temperature data");
  });

  it("sets max_tokens to 10 to keep the response minimal", async () => {
    mockCreate.mockResolvedValue(textResponse("GENERAL"));
    await classifyIntent("Hello", noRooms);
    expect(mockCreate.mock.calls[0][0].max_tokens).toBe(10);
  });
});
