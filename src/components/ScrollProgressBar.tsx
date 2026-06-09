import { useScrollProgress } from '@/hooks/use-scroll-progress';
import { cn } from '@/lib/utils';

/**
 * Scroll-depth line under the fixed header — grows on scroll down, shrinks on scroll up.
 */
export function ScrollProgressBar() {
  const progress = useScrollProgress();
  const percent = Math.round(progress * 100);

  return (
    <div
      className={cn(
        'print:hidden pointer-events-none absolute inset-x-0 bottom-0 z-10',
        'h-1 sm:h-1.5',
      )}
      role="progressbar"
      aria-label="Page scroll progress"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
    >
      <div className="absolute inset-0 bg-primary/10 dark:bg-primary/15" aria-hidden />

      <div
        className="scroll-progress-fill absolute inset-y-0 left-0 min-w-0"
        style={{ width: `${progress * 100}%` }}
      >
        <div className="scroll-progress-glow absolute inset-0" />
        {progress > 0.02 && (
          <div
            className="scroll-progress-tip absolute top-1/2 right-0 h-2 w-2 -translate-y-1/2 translate-x-1/2 rounded-full bg-primary"
            aria-hidden
          />
        )}
      </div>
    </div>
  );
}
