const SUGGESTIONS = [
  { emoji: "🌪️", text: "What causes a tornado?" },
  { emoji: "🌊", text: "Explain the jet stream" },
  { emoji: "🌩️", text: "How do hurricanes form?" },
  { emoji: "🌡️", text: "What is the difference between weather and climate?" },
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
    <div className="grid grid-cols-2 gap-3 max-w-lg w-full px-2">
      {SUGGESTIONS.map(({ emoji, text }) => (
        <button
          key={text}
          onClick={() => onSelect(text)}
          disabled={disabled}
          className="flex flex-col items-start gap-2 p-3.5 rounded-2xl border border-sky-200 dark:border-sky-900/40 bg-white dark:bg-slate-800/80 hover:bg-sky-50 dark:hover:bg-sky-900/20 hover:border-sky-400 dark:hover:border-sky-700 transition-all text-left shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          <span className="text-2xl leading-none">{emoji}</span>
          <span className="text-xs font-medium text-foreground/75 group-hover:text-sky-700 dark:group-hover:text-sky-300 leading-snug">
            {text}
          </span>
        </button>
      ))}
    </div>
  );
}
