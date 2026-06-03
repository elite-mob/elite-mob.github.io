import { cn } from '@/lib/utils';

type SectionBackdropProps = {
  variant?: 'calm' | 'elevated';
  /** Subtle dot grid overlay */
  grid?: boolean;
  className?: string;
};

/**
 * Section-level tint over the global site canvas.
 */
export function SectionBackdrop({ variant = 'calm', grid = false, className }: SectionBackdropProps) {
  return (
    <>
      <div
        className={cn(
          'absolute inset-0 z-0 backdrop-blur-[2px]',
          variant === 'elevated' ? 'bg-section-elevated' : 'bg-section-calm',
        )}
        aria-hidden
      />
      {grid && (
        <div
          className={cn(
            'pointer-events-none absolute inset-0 z-[1] opacity-[0.22] dark:opacity-[0.14]',
            className,
          )}
          aria-hidden
          style={{
            backgroundImage: `
              linear-gradient(hsl(var(--border) / 0.35) 1px, transparent 1px),
              linear-gradient(90deg, hsl(var(--border) / 0.35) 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px',
            maskImage: 'radial-gradient(ellipse 90% 75% at 50% 42%, black 12%, transparent 75%)',
          }}
        />
      )}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" aria-hidden />
    </>
  );
}
