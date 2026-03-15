"use client";

/**
 * WeatherBackground — Pure-CSS animated atmospheric layer.
 *
 * Light mode: Drifting clouds over a soft sky gradient.
 * Dark mode: Starfield with an aurora-green shimmer on the horizon.
 *
 * All shapes use CSS box-shadows and gradients — zero images, zero JS,
 * zero layout shift.  The component is absolutely-positioned so it sits
 * behind the app content (needs a relative parent with overflow-hidden).
 */
export function WeatherBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden select-none" aria-hidden>
      {/* ── Sky gradient ── */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-100 via-sky-50/60 to-transparent dark:from-slate-950 dark:via-slate-900/80 dark:to-slate-950" />

      {/* ── Sun glow (light mode) ── */}
      <div className="absolute -top-20 right-10 h-56 w-56 rounded-full bg-gradient-to-br from-amber-200/40 to-orange-200/20 blur-3xl dark:hidden" />

      {/* ── Drifting clouds (light mode) ── */}
      <div className="dark:opacity-0 transition-opacity duration-700">
        <div className="weather-cloud absolute top-[8%]  left-0 w-[260px] h-[52px] opacity-20 animate-drift-slow" />
        <div className="weather-cloud absolute top-[18%] left-0 w-[180px] h-[36px] opacity-15 animate-drift-med [animation-delay:-22s]" />
        <div className="weather-cloud absolute top-[30%] left-0 w-[220px] h-[44px] opacity-10 animate-drift-fast [animation-delay:-9s]" />
        <div className="weather-cloud absolute top-[14%] left-0 w-[140px] h-[32px] opacity-10 animate-drift-fast [animation-delay:-35s]" />
      </div>

      {/* ── Stars (dark mode) ── */}
      <div className="hidden dark:block">
        <div className="star absolute top-[5%]  left-[12%] animate-twinkle" />
        <div className="star absolute top-[10%] left-[45%] animate-twinkle [animation-delay:-2.3s]" />
        <div className="star absolute top-[7%]  left-[78%] animate-twinkle [animation-delay:-4.1s]" />
        <div className="star absolute top-[15%] left-[25%] animate-twinkle [animation-delay:-1.1s]" />
        <div className="star absolute top-[20%] left-[60%] animate-twinkle [animation-delay:-3.6s]" />
        <div className="star absolute top-[12%] left-[90%] animate-twinkle [animation-delay:-0.7s]" />
        <div className="star absolute top-[25%] left-[35%] animate-twinkle [animation-delay:-5.2s]" />
        <div className="star absolute top-[3%]  left-[55%] animate-twinkle [animation-delay:-2.8s]" />
      </div>

      {/* ── Aurora glow (dark mode) ── */}
      <div className="hidden dark:block">
        <div className="absolute top-0 left-1/4 h-40 w-1/2 rounded-full bg-gradient-to-r from-sky-500/8 via-emerald-400/6 to-purple-500/8 blur-3xl animate-aurora" />
      </div>

      {/* ── Horizon haze ── */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}
