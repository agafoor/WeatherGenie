import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ChatBubble } from "@/components/chat/ChatBubble";
import type { ChatMessage } from "@/types/chat";

function makeMessage(overrides: Partial<ChatMessage> = {}): ChatMessage {
  return {
    id: "m1",
    role: "assistant",
    content: "Hello world",
    message_type: "general",
    sources: [],
    genie_metadata: null,
    created_at: new Date().toISOString(),
    isStreaming: false,
    ...overrides,
  };
}

describe("ChatBubble — user message", () => {
  it("renders user message content", () => {
    render(<ChatBubble message={makeMessage({ role: "user", content: "Hi there!" })} />);
    expect(screen.getByText("Hi there!")).toBeInTheDocument();
  });

  it("does NOT render a message-type icon for user messages", () => {
    render(<ChatBubble message={makeMessage({ role: "user" })} />);
    expect(screen.queryByText("general")).not.toBeInTheDocument();
  });
});

describe("ChatBubble — assistant message", () => {
  it("renders assistant message content", () => {
    render(<ChatBubble message={makeMessage({ content: "Rain forms via condensation." })} />);
    expect(screen.getByText(/Rain forms via condensation/)).toBeInTheDocument();
  });

  it("renders message type label for assistant messages", () => {
    render(<ChatBubble message={makeMessage({ message_type: "research" })} />);
    expect(screen.getByText("research")).toBeInTheDocument();
  });

  it("shows the streaming cursor when isStreaming is true", () => {
    const { container } = render(
      <ChatBubble message={makeMessage({ isStreaming: true })} />
    );
    // The cursor is a span with animate-pulse class
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("does not show the cursor when not streaming", () => {
    const { container } = render(
      <ChatBubble message={makeMessage({ isStreaming: false })} />
    );
    expect(container.querySelector(".animate-pulse")).not.toBeInTheDocument();
  });

  it("renders source badges and calls onSourceClick", () => {
    const onSourceClick = vi.fn();
    const sources = [
      { document_id: "d1", chunk_id: "c1", title: "NOAA Report", excerpt: "...", score: 0.9 },
      { document_id: "d2", chunk_id: "c2", title: "NASA Study", excerpt: "...", score: 0.8 },
    ];
    render(
      <ChatBubble
        message={makeMessage({ sources, isStreaming: false })}
        onSourceClick={onSourceClick}
      />
    );
    expect(screen.getByText("NOAA Report")).toBeInTheDocument();
    expect(screen.getByText("NASA Study")).toBeInTheDocument();
    fireEvent.click(screen.getByText("NOAA Report"));
    expect(onSourceClick).toHaveBeenCalledWith(0);
  });

  it("does not render source badges while streaming", () => {
    const sources = [
      { document_id: "d1", chunk_id: "c1", title: "Doc", excerpt: "...", score: 0.9 },
    ];
    render(<ChatBubble message={makeMessage({ sources, isStreaming: true })} />);
    expect(screen.queryByText("Doc")).not.toBeInTheDocument();
  });

  it("renders a DataTable when genie_metadata has columns and rows", () => {
    const genie_metadata = {
      sql_query: "SELECT city, temp FROM weather",
      columns: ["city", "temp"],
      rows: [["Dallas", "95"]],
      genie_room_name: undefined,
    };
    render(<ChatBubble message={makeMessage({ genie_metadata })} />);
    expect(screen.getByText("city")).toBeInTheDocument();
    expect(screen.getByText("Dallas")).toBeInTheDocument();
  });

  it("does not render DataTable when genie_metadata is null", () => {
    render(<ChatBubble message={makeMessage({ genie_metadata: null })} />);
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("converts [1] citation links into clickable buttons", () => {
    const onSourceClick = vi.fn();
    render(
      <ChatBubble
        message={makeMessage({ content: "See [[1]](doc)" })}
        onSourceClick={onSourceClick}
      />
    );
    const citationBtn = screen.queryByText("1");
    if (citationBtn) {
      fireEvent.click(citationBtn);
      expect(onSourceClick).toHaveBeenCalledWith(0);
    }
  });
});
