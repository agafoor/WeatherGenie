import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  children?: React.ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  children,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      {/* Weather illustration icon */}
      <div className="relative mb-6">
        <div className="h-24 w-24 rounded-full bg-gradient-to-b from-sky-300 to-sky-500 dark:from-sky-700 dark:to-sky-900 flex items-center justify-center shadow-lg shadow-sky-200/60 dark:shadow-sky-900/40">
          <Icon className="h-12 w-12 text-white drop-shadow" />
        </div>
        {/* Decorative cloud bubbles */}
        <div className="absolute -top-1 -right-2 h-5 w-5 rounded-full bg-white dark:bg-slate-800 border-2 border-sky-100 dark:border-sky-900/50 shadow-sm" />
        <div className="absolute -bottom-1 -left-3 h-4 w-4 rounded-full bg-white dark:bg-slate-800 border-2 border-sky-100 dark:border-sky-900/50 shadow-sm" />
        <div className="absolute top-2 -left-4 h-3 w-3 rounded-full bg-sky-100 dark:bg-sky-900/50 shadow-sm" />
      </div>
      <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-sky-600 to-sky-400 bg-clip-text text-transparent dark:from-sky-300 dark:to-sky-500">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {children}
    </div>
  );
}
