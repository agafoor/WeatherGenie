import { Brain, BookOpen, BarChart3 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { IntentType } from "@/types/chat";

const config: Record<IntentType, { icon: typeof Brain; color: string; label: string }> = {
  general: { icon: Brain, color: "text-purple-500", label: "General Knowledge" },
  research: { icon: BookOpen, color: "text-emerald-500", label: "Research Documents" },
  analytics: { icon: BarChart3, color: "text-blue-500", label: "Data Analytics" },
};

export function MessageTypeIcon({ type }: { type: IntentType }) {
  const { icon: Icon, color, label } = config[type];

  return (
    <Tooltip>
      <TooltipTrigger className="inline-flex">
        <Icon className={`h-4 w-4 ${color} shrink-0`} />
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}
