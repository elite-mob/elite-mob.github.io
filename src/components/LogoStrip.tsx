import { trustStripContent } from '@/data/siteContent';

/**
 * Trust strip: slow marquee of collaboration names (monochrome chips).
 */
export const LogoStrip = () => {
  const { eyebrow, supporting, collaborationNames, footnote } = trustStripContent;
  const marqueeItems = [...collaborationNames, ...collaborationNames];

  return (
    <section
      aria-labelledby="trust-strip-eyebrow"
      className="relative border-y border-border/40 overflow-hidden py-12 sm:py-14 md:py-16"
    >
      <div className="absolute inset-0 bg-section-calm" aria-hidden />

      <div className="container mx-auto px-4 sm:px-6 relative z-10 mb-8 sm:mb-10">
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
              <span
                className={[
                  'inline-flex min-h-[2.75rem] items-center justify-center rounded-xl px-5 sm:px-6',
                  'border border-border/55 glass-card text-sm font-semibold tracking-wide text-foreground/85',
                  'whitespace-nowrap shadow-sm',
                ].join(' ')}
              >
                {name}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-8 text-center text-[11px] text-foreground/55 max-w-md mx-auto px-4">
        {footnote}
      </p>
    </section>
  );
};
