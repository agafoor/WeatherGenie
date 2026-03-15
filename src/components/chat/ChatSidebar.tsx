"use client";

import { Plus, MessageSquare, Trash2, CloudRain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { Conversation, GenieRoom } from "@/types/database";

interface ChatSidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  genieRooms: GenieRoom[];
  selectedGenieRoomId: string | undefined;
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onSelectGenieRoom: (id: string | undefined) => void;
}

export function ChatSidebar({
  conversations,
  activeConversationId,
  genieRooms,
  selectedGenieRoomId,
  onNewChat,
  onSelectConversation,
  onDeleteConversation,
  onSelectGenieRoom,
}: ChatSidebarProps) {
  return (
    <div className="w-72 border-r border-sky-200/40 dark:border-white/5 glass flex flex-col h-full relative overflow-hidden">
      {/* Decorative cloud silhouettes at the bottom of sidebar */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 opacity-[0.04] dark:opacity-[0.03]" aria-hidden>
        <svg viewBox="0 0 288 96" className="w-full h-full" preserveAspectRatio="xMidYMax slice">
          <ellipse cx="60" cy="80" rx="70" ry="28" fill="currentColor" />
          <ellipse cx="180" cy="85" rx="90" ry="32" fill="currentColor" />
          <ellipse cx="260" cy="82" rx="50" ry="22" fill="currentColor" />
        </svg>
      </div>

      {/* Header */}
      <div className="p-3 border-b border-sky-200/30 dark:border-white/5">
        <Button
          onClick={onNewChat}
          className="w-full gap-2 bg-gradient-to-r from-sky-500 to-sky-400 hover:from-sky-600 hover:to-sky-500 text-white shadow-md shadow-sky-300/30 dark:shadow-sky-900/40 transition-all hover:shadow-lg hover:shadow-sky-300/40"
          size="sm"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
      </div>

      {/* Conversation label */}
      <div className="px-3 pt-3 pb-1 flex items-center gap-1.5">
        <CloudRain className="h-3 w-3 text-sky-400/60" />
        <p className="text-[10px] font-semibold uppercase tracking-widest text-sky-400 dark:text-sky-600">
          Conversations
        </p>
      </div>

      <ScrollArea className="flex-1 px-2">
        <div className="space-y-0.5 pb-2">
          {conversations.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-6 px-3">
              No conversations yet. Start a new chat!
            </p>
          )}
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={cn(
                "group flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm cursor-pointer transition-all",
                activeConversationId === conv.id
                  ? "bg-sky-100 text-sky-900 dark:bg-sky-900/30 dark:text-sky-100 shadow-sm"
                  : "text-foreground/70 hover:bg-sky-50 dark:hover:bg-sky-900/20 hover:text-foreground"
              )}
              onClick={() => onSelectConversation(conv.id)}
            >
              <MessageSquare
                className={cn(
                  "h-4 w-4 shrink-0 transition-colors",
                  activeConversationId === conv.id
                    ? "text-sky-500"
                    : "text-muted-foreground group-hover:text-sky-400"
                )}
              />
              <span className="truncate flex-1 text-xs font-medium">{conv.title}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteConversation(conv.id);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30"
              >
                <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-red-500 transition-colors" />
              </button>
            </div>
          ))}
        </div>
      </ScrollArea>

      {genieRooms.length > 0 && (
        <>
          <Separator className="bg-sky-100 dark:bg-sky-900/40" />
          <div className="p-3 space-y-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-sky-400 dark:text-sky-600">
              Data Source
            </label>
            <Select
              value={selectedGenieRoomId || "none"}
              onValueChange={(v) =>
                onSelectGenieRoom(!v || v === "none" ? undefined : v)
              }
            >
              <SelectTrigger className="h-8 text-xs border-sky-200 dark:border-sky-800 focus:ring-sky-400">
                <SelectValue placeholder="Select Genie Room" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Genie Room</SelectItem>
                {genieRooms.map((room) => (
                  <SelectItem key={room.id} value={room.id}>
                    {room.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </>
      )}
    </div>
  );
}
