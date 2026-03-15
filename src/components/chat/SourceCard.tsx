import { FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { MessageSource } from "@/types/database";

interface SourceCardProps {
  source: MessageSource;
  index: number;
  isHighlighted?: boolean;
}

export function SourceCard({ source, index, isHighlighted }: SourceCardProps) {
  const score = Math.round(source.score * 100);

  return (
    <Card
      className={`transition-all border-sky-200/40 dark:border-white/8 ${
        isHighlighted
          ? "ring-2 ring-sky-400 bg-sky-50/80 dark:bg-sky-900/30"
          : ""
      }`}
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-2">
          <div className="flex items-center justify-center h-5 w-5 rounded-full bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400 text-[10px] font-bold shrink-0 mt-0.5">
            {index + 1}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="h-3 w-3 text-muted-foreground shrink-0" />
              <span className="text-xs font-medium truncate">
                {source.title}
              </span>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 shrink-0">
                {score}%
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
              {source.excerpt}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
