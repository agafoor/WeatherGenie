"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { MessageTypeIcon } from "./MessageTypeIcon";
import { DataTable } from "./DataTable";
import type { ChatMessage } from "@/types/chat";

interface ChatBubbleProps {
  message: ChatMessage;
  onSourceClick?: (index: number) => void;
}

export function ChatBubble({ message, onSourceClick }: ChatBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex w-full gap-3 px-4 py-3",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-3",
          isUser
            ? "bg-blue-600 text-white rounded-br-md"
            : "bg-muted rounded-bl-md"
        )}
      >
        {!isUser && (
          <div className="flex items-center gap-2 mb-1.5">
            <MessageTypeIcon type={message.message_type} />
            <span className="text-xs text-muted-foreground capitalize">
              {message.message_type}
            </span>
          </div>
        )}

        <div
          className={cn(
            "prose prose-sm max-w-none",
            isUser
              ? "prose-invert"
              : "dark:prose-invert"
          )}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              a: ({ href, children }) => {
                // Handle source citations like [1]
                const text = String(children);
                const match = text.match(/^\[(\d+)\]$/);
                if (match && onSourceClick) {
                  return (
                    <button
                      onClick={() => onSourceClick(parseInt(match[1]) - 1)}
                      className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-[10px] font-bold hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors no-underline ml-0.5"
                    >
                      {match[1]}
                    </button>
                  );
                }
                return (
                  <a href={href} target="_blank" rel="noopener noreferrer">
                    {children}
                  </a>
                );
              },
              code: ({ className, children, ...props }) => {
                const isInline = !className;
                if (isInline) {
                  return (
                    <code className="bg-muted px-1.5 py-0.5 rounded text-sm" {...props}>
                      {children}
                    </code>
                  );
                }
                return (
                  <pre className="bg-muted p-3 rounded-lg overflow-x-auto">
                    <code className={className} {...props}>
                      {children}
                    </code>
                  </pre>
                );
              },
            }}
          >
            {message.content}
          </ReactMarkdown>

          {message.isStreaming && (
            <span className="inline-block w-0.5 h-4 bg-foreground animate-pulse ml-0.5" />
          )}
        </div>

        {/* Genie data table */}
        {message.genie_metadata?.columns && message.genie_metadata?.rows && (
          <DataTable
            columns={message.genie_metadata.columns}
            rows={message.genie_metadata.rows}
            sqlQuery={message.genie_metadata.sql_query}
          />
        )}

        {/* Source badges */}
        {!isUser && message.sources.length > 0 && !message.isStreaming && (
          <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-border/50">
            {message.sources.map((source, i) => (
              <button
                key={source.chunk_id}
                onClick={() => onSourceClick?.(i)}
                className="inline-flex items-center gap-1 text-[10px] bg-background/50 hover:bg-background px-2 py-0.5 rounded-full border transition-colors"
              >
                <span className="font-bold text-blue-500">[{i + 1}]</span>
                <span className="truncate max-w-[120px]">{source.title}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
