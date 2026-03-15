const SUGGESTIONS = [
  { emoji: "🌪️", text: "What causes a tornado?", accent: "from-amber-400/10 to-orange-400/5 dark:from-amber-900/15 dark:to-orange-900/10" },
  { emoji: "🌊", text: "Explain the jet stream", accent: "from-cyan-400/10 to-sky-400/5 dark:from-cyan-900/15 dark:to-sky-900/10" },
  { emoji: "🌩️", text: "How do hurricanes form?", accent: "from-violet-400/10 to-indigo-400/5 dark:from-violet-900/15 dark:to-indigo-900/10" },
  { emoji: "🌡️", text: "What is the difference between weather and climate?", accent: "from-rose-400/10 to-pink-400/5 dark:from-rose-900/15 dark:to-pink-900/10" },
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
      {SUGGESTIONS.map(({ emoji, text, accent }) => (
        <button
          key={text}
          onClick={() => onSelect(text)}
          disabled={disabled}
          className={`group relative flex flex-col items-start gap-2.5 p-4 rounded-2xl border border-sky-200/60 dark:border-white/8 glass hover:border-sky-400/60 dark:hover:border-sky-600/30 transition-all text-left hover:shadow-lg hover:shadow-sky-200/20 dark:hover:shadow-sky-900/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden`}
        >
          {/* Soft accent gradient per card */}
          <div className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-0 group-hover:opacity-100 transition-opacity`} />
          <span className="relative text-2xl leading-none drop-shadow-sm">{emoji}</span>
          <span className="relative text-xs font-medium text-foreground/70 group-hover:text-foreground leading-snug transition-colors">
            {text}
          </span>
        </button>
      ))}
    </div>
  );
}
