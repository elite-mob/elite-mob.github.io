import { cn } from '@/lib/utils';

type SectionBackdropProps = {
  variant?: 'calm' | 'elevated';
  /** Subtle dot grid overlay */
  grid?: boolean;
  className?: string;
};

/**
 * Shared ambient background for homepage sections (teal glass aesthetic).
 */
export function SectionBackdrop({ variant = 'calm', grid = false, className }: SectionBackdropProps) {
  return (
    <>
      <div
        className={cn('absolute inset-0 z-0', variant === 'elevated' ? 'bg-section-elevated' : 'bg-section-calm')}
        aria-hidden
      />
      {grid && (
        <div
          className={cn(
            'pointer-events-none absolute inset-0 z-[1] opacity-[0.28] dark:opacity-[0.18]',
            className,
          )}
          aria-hidden
          style={{
            backgroundImage: `
              linear-gradient(hsl(var(--border) / 0.45) 1px, transparent 1px),
              linear-gradient(90deg, hsl(var(--border) / 0.45) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
            maskImage: 'radial-gradient(ellipse 85% 70% at 50% 45%, black 20%, transparent 72%)',
          }}
        />
      )}
      <div
        className="pointer-events-none absolute inset-0 z-[1] overflow-hidden"
        aria-hidden
      >
        <div
          className={cn(
            'absolute rounded-full blur-[100px] opacity-90',
            variant === 'elevated'
              ? 'right-0 top-1/4 h-[min(50vh,26rem)] w-[min(85vw,30rem)] translate-x-1/4 bg-[radial-gradient(circle,hsl(187_55%_48%/0.09)_0%,transparent_70%)]'
              : 'left-1/2 top-1/2 h-[min(60vh,28rem)] w-[min(90vw,36rem)] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(circle,hsl(187_50%_52%/0.06)_0%,transparent_68%)]',
          )}
        />
      </div>
    </>
  );
}
