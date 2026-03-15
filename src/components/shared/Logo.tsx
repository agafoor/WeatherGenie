import { CloudSun } from "lucide-react";

export function Logo({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <CloudSun className="h-6 w-6 text-sky-500 shrink-0 drop-shadow-sm" />
      {!collapsed && (
        <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-sky-600 to-sky-400 bg-clip-text text-transparent dark:from-sky-300 dark:to-sky-500">
          WeatherGenie
        </span>
      )}
    </div>
  );
}
