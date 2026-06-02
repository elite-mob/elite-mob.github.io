import { Loader2 } from 'lucide-react';

/** Shown while lazy route chunks load. */
export function PageRouteFallback() {
  return (
    <div
      className="min-h-[50vh] flex flex-col items-center justify-center gap-3 text-foreground/70"
      role="status"
      aria-live="polite"
      aria-label="Loading page"
    >
      <Loader2 className="w-8 h-8 text-primary animate-spin" aria-hidden />
      <span className="text-sm">Loading…</span>
    </div>
  );
}
