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
      className={`transition-all ${
        isHighlighted
          ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950"
          : ""
      }`}
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-2">
          <div className="flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-[10px] font-bold shrink-0 mt-0.5">
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
