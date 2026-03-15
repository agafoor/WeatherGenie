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
        "flex w-full gap-3 px-4 py-2",
        isUser ? "justify-end items-end" : "justify-start items-end"
      )}
    >
      {/* Assistant avatar */}
      {!isUser && (
        <div className="shrink-0 h-8 w-8 rounded-full bg-gradient-to-b from-sky-300 to-sky-500 dark:from-sky-700 dark:to-sky-900 flex items-center justify-center shadow shadow-sky-200/60 dark:shadow-sky-900/40 mb-0.5">
          <svg className="h-4 w-4 text-white drop-shadow" viewBox="0 0 24 24" fill="currentColor">
            {/* Simple cloud shape */}
            <path d="M6.5 20Q4.22 20 2.61 18.43 1 16.85 1 14.58q0-1.95 1.17-3.48 1.18-1.53 3.08-1.95.51-2.18 2.19-3.66Q9.12 4 11.25 4q2.55 0 4.28 1.73Q17.25 7.45 17.25 10q0 .23-.02.5H17.5q1.88 0 3.19 1.31Q22 13.12 22 15q0 1.88-1.31 3.19Q19.38 20 17.5 20Z"/>
          </svg>
        </div>
      )}

      <div
        className={cn(
          "max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-3",
          isUser
            ? "bg-gradient-to-br from-sky-400 to-sky-600 text-white rounded-br-sm shadow-md shadow-sky-300/25 dark:shadow-sky-900/40"
            : "glass border border-sky-200/40 dark:border-white/8 rounded-bl-sm shadow-sm"
        )}
      >
        {!isUser && (
          <div className="flex items-center gap-1.5 mb-1.5">
            <MessageTypeIcon type={message.message_type} />
            <span className="text-[10px] font-semibold uppercase tracking-wide text-sky-500 dark:text-sky-400">
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
                      className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-300 text-[10px] font-bold hover:bg-sky-200 dark:hover:bg-sky-800 transition-colors no-underline ml-0.5"
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
                    <code className={cn("px-1.5 py-0.5 rounded text-sm", isUser ? "bg-sky-600/50" : "bg-muted")} {...props}>
                      {children}
                    </code>
                  );
                }
                return (
                  <pre className={cn("p-3 rounded-lg overflow-x-auto", isUser ? "bg-sky-700/50" : "bg-muted")}>
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
            <span className="inline-block w-0.5 h-4 bg-sky-500 animate-pulse ml-0.5" />
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
          <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-sky-200/30 dark:border-white/5">
            {message.sources.map((source, i) => (
              <button
                key={source.chunk_id}
                onClick={() => onSourceClick?.(i)}
                className="inline-flex items-center gap-1 text-[10px] bg-sky-100/60 hover:bg-sky-200/60 dark:bg-sky-900/20 dark:hover:bg-sky-900/40 px-2 py-0.5 rounded-full border border-sky-200/60 dark:border-sky-800/40 transition-colors"
              >
                <span className="font-bold text-sky-500">[{i + 1}]</span>
                <span className="truncate max-w-[120px] text-foreground/70">{source.title}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* User avatar */}
      {isUser && (
        <div className="shrink-0 h-8 w-8 rounded-full bg-gradient-to-b from-slate-400 to-slate-600 dark:from-slate-600 dark:to-slate-800 flex items-center justify-center shadow shadow-slate-200/60 dark:shadow-slate-900/40 mb-0.5">
          <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12q-1.65 0-2.825-1.175Q8 9.65 8 8q0-1.65 1.175-2.825Q10.35 4 12 4q1.65 0 2.825 1.175Q16 6.35 16 8q0 1.65-1.175 2.825Q13.65 12 12 12Zm-8 8v-2.8q0-.85.438-1.563.437-.712 1.162-1.087 1.55-.775 3.15-1.163Q10.35 13 12 13t3.25.387q1.6.388 3.15 1.163.725.375 1.163 1.087Q20 16.35 20 17.2V20Z"/>
          </svg>
        </div>
      )}
    </div>
  );
}
