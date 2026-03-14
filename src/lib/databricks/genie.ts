import type { GenieRoom } from "@/types/database";
import type { GenieMetadata } from "@/types/database";

interface GenieConvResponse {
  conversation_id: string;
  message_id: string;
}

interface GenieMessageResponse {
  status: string;
  attachments?: Array<{
    id: string;
    type: string;
    text?: { content: string; truncated: boolean };
    query?: { query: string; description: string };
  }>;
}

async function databricksRequest(
  host: string,
  path: string,
  method: string,
  body?: unknown
) {
  const response = await fetch(`${host}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${process.env.DATABRICKS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Databricks API error (${response.status}): ${text}`);
  }

  return response.json();
}

export async function queryGenie(
  room: GenieRoom,
  question: string
): Promise<{ text: string; sqlQuery?: string; columns?: string[]; rows?: unknown[][] }> {
  const host = room.databricks_host.replace(/\/$/, "");

  // Start conversation
  const convData: GenieConvResponse = await databricksRequest(
    host,
    `/api/2.0/genie/spaces/${room.space_id}/start-conversation`,
    "POST",
    { content: question }
  );

  const { conversation_id, message_id } = convData;

  // Poll for completion
  const MAX_POLLS = 60;
  const POLL_INTERVAL = 2000;

  for (let i = 0; i < MAX_POLLS; i++) {
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));

    const msgData: GenieMessageResponse = await databricksRequest(
      host,
      `/api/2.0/genie/spaces/${room.space_id}/conversations/${conversation_id}/messages/${message_id}`,
      "GET"
    );

    if (msgData.status === "COMPLETED") {
      let text = "";
      let sqlQuery: string | undefined;
      let columns: string[] | undefined;
      let rows: unknown[][] | undefined;

      for (const attachment of msgData.attachments || []) {
        if (attachment.text) {
          text += attachment.text.content;
        }
        if (attachment.query) {
          sqlQuery = attachment.query.query;
          text += `\n\n${attachment.query.description}`;

          // Try to get query results
          try {
            const resultData = await databricksRequest(
              host,
              `/api/2.0/genie/spaces/${room.space_id}/conversations/${conversation_id}/messages/${message_id}/query-result/${attachment.id}`,
              "GET"
            );
            if (resultData.statement_response?.result) {
              const result = resultData.statement_response.result;
              columns = result.manifest?.schema?.columns?.map(
                (c: { name: string }) => c.name
              );
              rows = result.data_array;
            }
          } catch {
            // Query results not available
          }
        }
      }

      return { text: text || "Query completed but no results returned.", sqlQuery, columns, rows };
    }

    if (msgData.status === "FAILED" || msgData.status === "CANCELLED") {
      throw new Error(`Genie query ${msgData.status.toLowerCase()}`);
    }
  }

  throw new Error("Genie query timed out after 2 minutes");
}

export function formatGenieResponse(result: {
  text: string;
  sqlQuery?: string;
  columns?: string[];
  rows?: unknown[][];
}): { text: string; metadata: GenieMetadata } {
  let text = result.text;

  if (result.columns && result.rows) {
    // Add markdown table
    const header = `| ${result.columns.join(" | ")} |`;
    const separator = `| ${result.columns.map(() => "---").join(" | ")} |`;
    const dataRows = result.rows
      .slice(0, 20)
      .map((row) => `| ${row.map((c) => String(c ?? "")).join(" | ")} |`);

    text += `\n\n${header}\n${separator}\n${dataRows.join("\n")}`;

    if (result.rows.length > 20) {
      text += `\n\n*Showing 20 of ${result.rows.length} rows*`;
    }
  }

  return {
    text,
    metadata: {
      sql_query: result.sqlQuery,
      columns: result.columns,
      rows: result.rows,
      genie_room_name: undefined,
    },
  };
}
