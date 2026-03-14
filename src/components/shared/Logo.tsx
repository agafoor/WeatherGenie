import { CloudSun } from "lucide-react";

export function Logo({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <CloudSun className="h-6 w-6 text-blue-500 shrink-0" />
      {!collapsed && (
        <span className="text-lg font-bold tracking-tight">WeatherGenie</span>
      )}
    </div>
  );
}
