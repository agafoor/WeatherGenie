import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { classifyIntent } from "@/lib/anthropic/intent-router";
import { streamGeneralChat, streamRAGChat } from "@/lib/anthropic/chat";
import { retrieveChunks } from "@/lib/rag/retriever";
import { queryGenie, formatGenieResponse } from "@/lib/databricks/genie";
import { createSSEStream, createSSEResponse } from "@/lib/utils/stream";
import type { GenieRoom, MessageSource } from "@/types/database";

export async function POST(request: Request) {
  const supabase = await createClient();
  const admin = createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { conversationId, message, genieRoomId } = await request.json();

  if (!conversationId || !message) {
    return new Response("Missing required fields", { status: 400 });
  }

  // Save user message
  await admin.from("messages").insert({
    conversation_id: conversationId,
    role: "user",
    content: message,
    message_type: "general",
  });

  const { readable, sendEvent, close } = createSSEStream();

  // Process asynchronously — .catch() prevents unhandledRejection if client disconnects
  (async () => {
    try {
      // Get available genie rooms for intent classification
      const { data: genieRooms } = await admin
        .from("genie_rooms")
        .select("*")
        .eq("is_active", true);

      // Classify intent (skip classification if Genie room explicitly selected)
      const intent = genieRoomId
        ? "analytics"
        : await classifyIntent(message, (genieRooms as GenieRoom[]) || []);
      await sendEvent("intent", intent);

      // Get conversation history (last 10 messages for context)
      const { data: history } = await admin
        .from("messages")
        .select("role, content")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })
        .limit(10);

      const chatMessages = (history || [])
        .filter((m) => m.role !== "system")
        .map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        }));

      let fullResponse = "";
      let sources: MessageSource[] = [];
      let genieMetadata = null;

      if (genieRoomId) {
        // User explicitly selected a Genie Room — route directly to Genie regardless of intent
        const room = genieRooms?.find(
          (r: GenieRoom) => r.id === genieRoomId
        ) as GenieRoom | undefined;

        if (room) {
          try {
            const result = await queryGenie(room, message);
            const formatted = formatGenieResponse(result);
            fullResponse = formatted.text;
            genieMetadata = formatted.metadata;

            const chunks = fullResponse.match(/.{1,50}/g) || [fullResponse];
            for (const chunk of chunks) {
              await sendEvent("delta", chunk);
            }
          } catch (error) {
            fullResponse =
              "I wasn't able to query the data. " +
              (error instanceof Error ? error.message : "Please try again.");
            await sendEvent("delta", fullResponse);
          }
        } else {
          fullResponse =
            "The selected Genie Room could not be found. Please select another from the sidebar.";
          await sendEvent("delta", fullResponse);
        }
      } else if (intent === "research") {
        // RAG pipeline
        const chunks = await retrieveChunks(message, admin);
        sources = chunks.map((chunk) => ({
          document_id: chunk.document_id,
          chunk_id: chunk.id,
          title: chunk.title || "Document",
          excerpt: chunk.content.slice(0, 200),
          score: chunk.similarity,
        }));

        if (sources.length > 0) {
          await sendEvent("sources", sources);
        }

        await streamRAGChat(chatMessages, sources, {
          onDelta: async (text) => {
            fullResponse += text;
            await sendEvent("delta", text);
          },
          onDone: () => {},
          onError: async (error) => {
            await sendEvent("error", { message: error.message });
          },
        });
      } else {
        // General chat
        await streamGeneralChat(chatMessages, {
          onDelta: async (text) => {
            fullResponse += text;
            await sendEvent("delta", text);
          },
          onDone: () => {},
          onError: async (error) => {
            await sendEvent("error", { message: error.message });
          },
        });
      }

      // Save assistant message
      await admin.from("messages").insert({
        conversation_id: conversationId,
        role: "assistant",
        content: fullResponse,
        message_type: intent,
        sources: sources,
        genie_metadata: genieMetadata,
      });

      // Generate title from first user message
      const { count } = await admin
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("conversation_id", conversationId);

      let title: string | undefined;
      if (count && count <= 2) {
        title = message.slice(0, 50) + (message.length > 50 ? "..." : "");
        await admin
          .from("conversations")
          .update({ title, updated_at: new Date().toISOString() })
          .eq("id", conversationId);
      } else {
        await admin
          .from("conversations")
          .update({ updated_at: new Date().toISOString() })
          .eq("id", conversationId);
      }

      await sendEvent("done", { title });
    } catch (error) {
      await sendEvent("error", {
        message:
          error instanceof Error ? error.message : "An error occurred",
      });
    } finally {
      await close();
    }
  })().catch(() => {
    // Top-level safety net: swallow any error that escaped the inner try/catch
    // (e.g. ResponseAborted when the client disconnects mid-stream)
    close();
  });

  return createSSEResponse(readable);
}
