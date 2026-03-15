import { CloudSun } from "lucide-react";

export function Logo({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <div className="flex items-center gap-2.5 group">
      <div className="relative">
        <CloudSun className="h-6 w-6 text-sky-500 shrink-0 drop-shadow-sm group-hover:animate-sway transition-transform" />
        {/* Tiny sun dot */}
        <div className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-amber-400/80 dark:bg-amber-500/50" />
      </div>
      {!collapsed && (
        <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-sky-600 via-sky-500 to-sky-400 bg-clip-text text-transparent dark:from-sky-200 dark:via-sky-300 dark:to-sky-500">
          WeatherGenie
        </span>
      )}
    </div>
  );
}
