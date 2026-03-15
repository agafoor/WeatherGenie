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
      {/* Weather scene illustration */}
      <div className="relative mb-8">
        {/* Outer atmospheric ring */}
        <div className="absolute inset-[-18px] rounded-full bg-gradient-to-b from-sky-200/30 to-transparent dark:from-sky-800/20 animate-float" />

        {/* Main icon orb */}
        <div className="relative h-28 w-28 rounded-full bg-gradient-to-br from-sky-300 via-sky-400 to-sky-600 dark:from-sky-600 dark:via-sky-700 dark:to-sky-900 flex items-center justify-center shadow-xl shadow-sky-300/40 dark:shadow-sky-900/50">
          <Icon className="h-14 w-14 text-white drop-shadow-lg" />
          {/* Inner light sheen */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent to-white/20" />
        </div>

        {/* Orbiting cloud puffs */}
        <div className="absolute -top-2 -right-3 h-7 w-7 rounded-full bg-white/90 dark:bg-slate-700/80 shadow-md animate-float [animation-delay:-1s]" />
        <div className="absolute -bottom-2 -left-4 h-5 w-5 rounded-full bg-white/80 dark:bg-slate-700/70 shadow-md animate-float [animation-delay:-3s]" />
        <div className="absolute top-3 -left-6 h-4 w-4 rounded-full bg-sky-200/80 dark:bg-sky-800/60 shadow-sm animate-float [animation-delay:-2s]" />
        <div className="absolute -top-3 left-5 h-3 w-3 rounded-full bg-sky-100/90 dark:bg-sky-900/50 shadow-sm animate-float [animation-delay:-4s]" />

        {/* Sun rays (light mode only) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-36 w-36 rounded-full bg-gradient-to-br from-amber-200/15 to-transparent dark:hidden animate-sway" />
      </div>

      <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-sky-600 via-sky-500 to-sky-400 bg-clip-text text-transparent dark:from-sky-200 dark:via-sky-300 dark:to-sky-500">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {children}
    </div>
  );
}
