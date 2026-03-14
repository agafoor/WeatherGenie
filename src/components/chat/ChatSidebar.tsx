"use client";

import { Plus, MessageSquare, Trash2 } from "lucide-react";
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
    <div className="w-72 border-r bg-muted/30 flex flex-col h-full">
      <div className="p-3">
        <Button onClick={onNewChat} className="w-full gap-2" size="sm">
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
      </div>

      <ScrollArea className="flex-1 px-2">
        <div className="space-y-0.5 pb-2">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={cn(
                "group flex items-center gap-2 rounded-lg px-3 py-2 text-sm cursor-pointer transition-colors",
                activeConversationId === conv.id
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent/50"
              )}
              onClick={() => onSelectConversation(conv.id)}
            >
              <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="truncate flex-1">{conv.title}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteConversation(conv.id);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
              </button>
            </div>
          ))}
        </div>
      </ScrollArea>

      {genieRooms.length > 0 && (
        <>
          <Separator />
          <div className="p-3 space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Data Source
            </label>
            <Select
              value={selectedGenieRoomId || "none"}
              onValueChange={(v) =>
                onSelectGenieRoom(!v || v === "none" ? undefined : v)
              }
            >
              <SelectTrigger className="h-8 text-xs">
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
