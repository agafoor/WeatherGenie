"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Logo } from "@/components/shared/Logo";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { UserMenu } from "@/components/shared/UserMenu";
import { EmptyState } from "@/components/shared/EmptyState";
import { ChatSidebar } from "./ChatSidebar";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";
import { SourcePanel } from "./SourcePanel";
import { SuggestedQuestions } from "./SuggestedQuestions";
import { useChat } from "@/hooks/useChat";
import { useConversations } from "@/hooks/useConversations";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import { CloudSun } from "lucide-react";
import type { GenieRoom } from "@/types/database";

interface ChatLayoutProps {
  initialConversationId?: string;
}

export function ChatLayout({ initialConversationId }: ChatLayoutProps) {
  const [conversationId, setConversationId] = useState<string | null>(
    initialConversationId ?? null
  );
  const [genieRoomId, setGenieRoomId] = useState<string | undefined>();
  const [genieRooms, setGenieRooms] = useState<GenieRoom[]>([]);
  const [showSources, setShowSources] = useState(false);
  const [highlightedSource, setHighlightedSource] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const highlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // When a brand-new conversation is created mid-stream, setConversationId fires
  // the "load messages" effect before isStreaming is set to true, wiping the
  // optimistic assistant message. This ref lets the effect skip that one reload.
  const skipNextLoadRef = useRef(false);
  const router = useRouter();
  const { profile } = useAuth();
  const supabase = createClient();

  const {
    conversations,
    createConversation,
    deleteConversation,
    updateConversationTitle,
  } = useConversations();

  const {
    messages,
    isStreaming,
    currentSources,
    sendMessage,
    stopStreaming,
    loadMessages,
    clearMessages,
  } = useChat({
    conversationId,
    genieRoomId,
    onConversationCreated: (id) => {
      // Signal the load-messages effect to skip its next run — the stream is
      // still active and the optimistic assistant message must not be wiped.
      skipNextLoadRef.current = true;
      setConversationId(id);
      // Use pushState instead of router.push to avoid unmounting this component
      // (and aborting the in-flight SSE stream) during the navigation from
      // /chat → /chat/[id]. Next.js App Router supports direct history API calls.
      window.history.pushState(null, "", `/chat/${id}`);
    },
    onTitleGenerated: (title) => {
      if (conversationId) {
        updateConversationTitle(conversationId, title);
      }
    },
  });

  // Load genie rooms
  useEffect(() => {
    async function loadRooms() {
      const { data } = await supabase
        .from("genie_rooms")
        .select("*")
        .eq("is_active", true)
        .order("name");
      if (data) setGenieRooms(data);
    }
    loadRooms();
  }, []);

  // Load messages when conversation changes.
  // Skip if a new conversation was just created mid-stream — the optimistic
  // messages are still being written to by the SSE reader and must not be
  // replaced. The ref is consumed (reset) on the first skip so normal
  // conversation switching still loads from the DB.
  useEffect(() => {
    if (conversationId) {
      if (skipNextLoadRef.current) {
        skipNextLoadRef.current = false;
        return;
      }
      loadMessages(conversationId);
    } else {
      clearMessages();
    }
  }, [conversationId, loadMessages, clearMessages]);

  function handleNewChat() {
    setConversationId(null);
    clearMessages();
    router.push("/chat", { scroll: false });
    setSidebarOpen(false);
  }

  function handleSelectConversation(id: string) {
    setConversationId(id);
    router.push(`/chat/${id}`, { scroll: false });
    setSidebarOpen(false);
  }

  async function handleDeleteConversation(id: string) {
    await deleteConversation(id);
    if (conversationId === id) {
      handleNewChat();
    }
  }

  const handleSourceClick = useCallback((index: number) => {
    setShowSources(true);
    setHighlightedSource(index);
    if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
    highlightTimerRef.current = setTimeout(() => setHighlightedSource(null), 2000);
  }, []);

  // Clean up the highlight timer on unmount
  useEffect(() => {
    return () => {
      if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
    };
  }, []);

  const sidebarContent = (
    <ChatSidebar
      conversations={conversations}
      activeConversationId={conversationId}
      genieRooms={genieRooms}
      selectedGenieRoomId={genieRoomId}
      onNewChat={handleNewChat}
      onSelectConversation={handleSelectConversation}
      onDeleteConversation={handleDeleteConversation}
      onSelectGenieRoom={setGenieRoomId}
    />
  );

  const activeSources = currentSources.length > 0 ? currentSources :
    messages.filter((m) => m.role === "assistant" && m.sources.length > 0)
      .flatMap((m) => m.sources);

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop sidebar */}
      <div className="hidden md:flex">{sidebarContent}</div>

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 border-b bg-gradient-to-r from-sky-50 to-white dark:from-slate-900 dark:to-slate-950 shrink-0">
          <div className="flex items-center gap-2">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden h-8 w-8"
                  />
                }
              >
                <Menu className="h-4 w-4" />
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72">
                {sidebarContent}
              </SheetContent>
            </Sheet>
            <Logo />
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            {profile && <UserMenu profile={profile} />}
          </div>
        </header>

        {/* Chat content */}
        <div className="flex flex-1 min-h-0">
          <div className="flex flex-col flex-1 min-w-0 min-h-0">
            {messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-6 p-4">
                <EmptyState
                  icon={CloudSun}
                  title="Welcome to WeatherGenie"
                  description="Ask me anything about weather, explore research documents, or query weather data."
                />
                <SuggestedQuestions
                  onSelect={sendMessage}
                  disabled={isStreaming}
                />
              </div>
            ) : (
              <ChatMessages
                messages={messages}
                isStreaming={isStreaming}
                onSourceClick={handleSourceClick}
              />
            )}
            <ChatInput
              onSend={sendMessage}
              onStop={stopStreaming}
              isStreaming={isStreaming}
            />
          </div>

          {/* Source panel - desktop only */}
          {showSources && activeSources.length > 0 && (
            <div className="hidden lg:flex">
              <SourcePanel
                sources={activeSources}
                highlightedIndex={highlightedSource}
                onClose={() => setShowSources(false)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
