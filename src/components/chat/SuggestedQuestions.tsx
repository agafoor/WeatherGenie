import { Button } from "@/components/ui/button";

const SUGGESTIONS = [
  "What causes a tornado?",
  "Explain the jet stream",
  "How do hurricanes form?",
  "What is the difference between weather and climate?",
];

interface SuggestedQuestionsProps {
  onSelect: (question: string) => void;
  disabled?: boolean;
}

export function SuggestedQuestions({
  onSelect,
  disabled,
}: SuggestedQuestionsProps) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {SUGGESTIONS.map((q) => (
        <Button
          key={q}
          variant="outline"
          size="sm"
          className="text-xs h-8"
          onClick={() => onSelect(q)}
          disabled={disabled}
        >
          {q}
        </Button>
      ))}
    </div>
  );
}
