import { describe, it, expect, vi, beforeEach } from "vitest";
import { formatGenieResponse, queryGenie } from "@/lib/databricks/genie";
import type { GenieRoom } from "@/types/database";

// ─── formatGenieResponse ───────────────────────────────────────────────────

describe("formatGenieResponse", () => {
  it("returns plain text when there are no columns/rows", () => {
    const result = formatGenieResponse({ text: "No data found." });
    expect(result.text).toBe("No data found.");
    expect(result.metadata.sql_query).toBeUndefined();
    expect(result.metadata.rows).toBeUndefined();
  });

  it("appends a markdown table when columns and rows are present", () => {
    const result = formatGenieResponse({
      text: "Here are results:",
      columns: ["city", "temp"],
      rows: [["Dallas", "95"], ["Austin", "92"]],
    });
    expect(result.text).toContain("| city | temp |");
    expect(result.text).toContain("| Dallas | 95 |");
    expect(result.text).toContain("| Austin | 92 |");
    expect(result.metadata.columns).toEqual(["city", "temp"]);
    expect(result.metadata.rows).toHaveLength(2);
  });

  it("caps the table at 20 rows and adds a notice", () => {
    const rows = Array.from({ length: 25 }, (_, i) => [`City${i}`, `${i}`]);
    const result = formatGenieResponse({
      text: "",
      columns: ["city", "temp"],
      rows,
    });
    // Only 20 data rows in the table
    const dataLines = result.text
      .split("\n")
      .filter((l) => l.startsWith("| City"));
    expect(dataLines).toHaveLength(20);
    expect(result.text).toContain("Showing 20 of 25 rows");
  });

  it("stores the sql_query in metadata", () => {
    const result = formatGenieResponse({
      text: "Result",
      sqlQuery: "SELECT * FROM weather",
    });
    expect(result.metadata.sql_query).toBe("SELECT * FROM weather");
  });

  it("handles null cell values gracefully", () => {
    const result = formatGenieResponse({
      text: "",
      columns: ["city"],
      rows: [[null]],
    });
    expect(result.text).toContain("|  |");
  });
});

// ─── queryGenie ────────────────────────────────────────────────────────────

const mockRoom: GenieRoom = {
  id: "room-1",
  name: "Weather Room",
  description: "Test room",
  space_id: "space-abc",
  databricks_host: "https://dbc.example.com/",
  is_active: true,
  created_at: new Date().toISOString(),
  created_by: "user-1",
};

describe("queryGenie", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.resetAllMocks();
    vi.unstubAllGlobals();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  /** Helper: run queryGenie while advancing fake timers past every poll delay */
  async function runWithTimers(promise: Promise<unknown>) {
    // Tick through up to 60 poll intervals (2 s each) — fake timers skip real waiting
    const settled = promise.catch((e) => ({ __error: e }));
    for (let i = 0; i < 65; i++) {
      await vi.advanceTimersByTimeAsync(2000);
    }
    return settled;
  }

  it("strips trailing slash from host before calling API", async () => {
    let capturedUrl = "";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        capturedUrl = url;
        if (url.includes("start-conversation")) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ conversation_id: "conv-1", message_id: "msg-1" }),
          });
        }
        // Immediately FAILED so the poll loop exits
        return Promise.resolve({ ok: true, json: async () => ({ status: "FAILED" }) });
      })
    );

    await runWithTimers(queryGenie(mockRoom, "test"));
    expect(capturedUrl).toMatch(/^https:\/\/dbc\.example\.com\/api/);
    expect(capturedUrl).not.toContain("//api");
  });

  it("returns text and sql results when COMPLETED on first poll", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        if (url.includes("start-conversation")) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ conversation_id: "c1", message_id: "m1" }),
          });
        }
        if (url.includes("/messages/m1") && !url.includes("query-result")) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              status: "COMPLETED",
              attachments: [
                { id: "a1", type: "text", text: { content: "Answer here", truncated: false } },
                { id: "a2", type: "query", query: { query: "SELECT 1", description: "Ran SQL" } },
              ],
            }),
          });
        }
        // query-result
        return Promise.resolve({
          ok: true,
          json: async () => ({
            statement_response: {
              result: {
                manifest: { schema: { columns: [{ name: "val" }] } },
                data_array: [["42"]],
              },
            },
          }),
        });
      })
    );

    const promise = queryGenie(mockRoom, "What is 1+1?");
    await vi.advanceTimersByTimeAsync(2000); // first poll
    const result = await promise;
    expect(result.text).toContain("Answer here");
    expect(result.sqlQuery).toBe("SELECT 1");
    expect(result.columns).toEqual(["val"]);
    expect(result.rows).toEqual([["42"]]);
  });

  it("throws when Genie returns FAILED status", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        if (url.includes("start-conversation")) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ conversation_id: "c1", message_id: "m1" }),
          });
        }
        return Promise.resolve({ ok: true, json: async () => ({ status: "FAILED" }) });
      })
    );

    const promise = queryGenie(mockRoom, "bad query");
    // Attach the rejection handler BEFORE advancing timers to avoid
    // Node.js "PromiseRejectionHandledWarning" (rejection created before handler)
    const assertion = expect(promise).rejects.toThrow("Genie query failed");
    await vi.advanceTimersByTimeAsync(2000);
    await assertion;
  });

  it("throws when Databricks API returns a non-ok response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        text: async () => "Forbidden",
      })
    );

    await expect(queryGenie(mockRoom, "query")).rejects.toThrow("Databricks API error (403)");
    vi.unstubAllGlobals();
  });
});
