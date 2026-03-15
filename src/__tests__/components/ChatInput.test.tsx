import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChatInput } from "@/components/chat/ChatInput";

describe("ChatInput", () => {
  it("renders the textarea and send button", () => {
    render(<ChatInput onSend={vi.fn()} />);
    expect(screen.getByPlaceholderText("Ask about weather, climate, or forecasts...")).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("calls onSend with trimmed text when send button is clicked", async () => {
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} />);
    const textarea = screen.getByPlaceholderText("Ask about weather, climate, or forecasts...");
    await userEvent.type(textarea, "  What is rain?  ");
    fireEvent.click(screen.getByRole("button"));
    expect(onSend).toHaveBeenCalledWith("What is rain?");
  });

  it("calls onSend when Enter is pressed (without Shift)", async () => {
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} />);
    const textarea = screen.getByPlaceholderText("Ask about weather, climate, or forecasts...");
    await userEvent.type(textarea, "Hello{Enter}");
    expect(onSend).toHaveBeenCalledWith("Hello");
  });

  it("does NOT call onSend when Shift+Enter is pressed", async () => {
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} />);
    const textarea = screen.getByPlaceholderText("Ask about weather, climate, or forecasts...");
    await userEvent.type(textarea, "Line one{Shift>}{Enter}{/Shift}");
    expect(onSend).not.toHaveBeenCalled();
  });

  it("clears the textarea after sending", async () => {
    render(<ChatInput onSend={vi.fn()} />);
    const textarea = screen.getByPlaceholderText("Ask about weather, climate, or forecasts...") as HTMLTextAreaElement;
    await userEvent.type(textarea, "Hello");
    fireEvent.click(screen.getByRole("button"));
    expect(textarea.value).toBe("");
  });

  it("does not call onSend when input is empty or whitespace", async () => {
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} />);
    const textarea = screen.getByPlaceholderText("Ask about weather, climate, or forecasts...");
    await userEvent.type(textarea, "   ");
    fireEvent.click(screen.getByRole("button"));
    expect(onSend).not.toHaveBeenCalled();
  });

  it("shows a Stop icon while streaming and calls onStop on click", async () => {
    const onStop = vi.fn();
    render(<ChatInput onSend={vi.fn()} onStop={onStop} isStreaming={true} />);
    // The button should exist and clicking it calls onStop
    const btn = screen.getByRole("button");
    fireEvent.click(btn);
    expect(onStop).toHaveBeenCalledTimes(1);
  });

  it("is disabled when disabled prop is true and not streaming", () => {
    render(<ChatInput onSend={vi.fn()} disabled={true} />);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("button is NOT disabled while streaming (to allow stop)", () => {
    render(<ChatInput onSend={vi.fn()} onStop={vi.fn()} isStreaming={true} disabled={true} />);
    expect(screen.getByRole("button")).not.toBeDisabled();
  });
});
