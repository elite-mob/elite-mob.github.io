import { trustStripContent } from '@/data/siteContent';
import { cn } from '@/lib/utils';

const mobileChipClass = [
  'inline-flex min-h-[2.75rem] items-center justify-center rounded-xl px-5 sm:px-6',
  'border border-border/55 glass-card text-sm font-semibold tracking-wide text-foreground/85',
  'whitespace-nowrap shadow-sm',
].join(' ');

/**
 * Trust strip: marquee chips on mobile; static split panel on desktop.
 */
export const LogoStrip = () => {
  const { eyebrow, supporting, collaborationNames, footnote } = trustStripContent;
  const marqueeItems = [...collaborationNames, ...collaborationNames];

  return (
    <section
      aria-labelledby="trust-strip-eyebrow"
      className="relative border-y border-border/30 overflow-hidden bg-section-calm/70 backdrop-blur-sm"
    >
      <div className="absolute inset-0 bg-section-calm/50" aria-hidden />

      {/* Mobile: marquee (unchanged) */}
      <div className="relative z-10 md:hidden py-12 sm:py-14">
        <div className="container mx-auto px-4 sm:px-6 mb-8 sm:mb-10">
          <header className="text-center max-w-xl mx-auto">
            <p
              id="trust-strip-eyebrow"
              className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.22em] text-primary/90 mb-2"
            >
              {eyebrow}
            </p>
            <p className="text-sm text-foreground/75 leading-relaxed">{supporting}</p>
          </header>
        </div>

        <div
          className="relative"
          style={{
            maskImage: 'linear-gradient(90deg, transparent, black 8%, black 92%, transparent)',
          }}
        >
          <ul
            className="flex w-max list-none m-0 p-0 gap-3 sm:gap-4 animate-trust-marquee"
            aria-label="Selected collaboration names"
          >
            {marqueeItems.map((name, i) => (
              <li key={`${name}-${i}`}>
                <span className={mobileChipClass}>{name}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-8 text-center text-[11px] text-foreground/55 max-w-md mx-auto px-4">
          {footnote}
        </p>
      </div>

      {/* Desktop: contained split panel */}
      <div className="relative z-10 hidden md:block py-14 lg:py-16">
        <div className="container mx-auto px-6">
          <div className="rounded-2xl border border-border/55 glass-card shadow-sm overflow-hidden">
            <div className="grid lg:grid-cols-[minmax(15rem,18.75rem)_1fr] lg:divide-x lg:divide-border/45">
              <header
                id="trust-strip-eyebrow"
                className="flex flex-col justify-center gap-3 px-8 py-9 lg:px-10 lg:py-11 border-b lg:border-b-0 border-border/40 bg-gradient-to-br from-primary/[0.07] via-primary/[0.02] to-transparent"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/90">
                  {eyebrow}
                </p>
                <p className="text-sm lg:text-[0.9375rem] text-foreground/78 leading-relaxed max-w-[16rem]">
                  {supporting}
                </p>
                <p className="text-[11px] text-foreground/50 pt-1 lg:pt-2">{footnote}</p>
              </header>

              <div className="px-6 py-8 lg:px-10 lg:py-10 flex flex-col justify-center">
                <ul
                  className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 lg:gap-4 list-none m-0 p-0"
                  aria-label="Selected collaboration names"
                >
                  {collaborationNames.map((name) => (
                    <li key={name}>
                      <div
                        className={cn(
                          'group flex min-h-[4.25rem] items-center justify-center rounded-xl px-3 py-3.5',
                          'border border-border/50 bg-background/40 dark:bg-background/25',
                          'transition-all duration-300',
                          'hover:border-primary/40 hover:bg-primary/[0.05] hover:shadow-sm',
                        )}
                      >
                        <span
                          className={cn(
                            'font-display text-sm lg:text-[0.9375rem] font-semibold text-center leading-snug',
                            'text-foreground/82 transition-colors duration-300',
                            'group-hover:text-foreground',
                          )}
                        >
                          {name}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
