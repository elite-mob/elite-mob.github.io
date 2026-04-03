import { trustStripContent } from '@/data/siteContent';

/**
 * Premium trust strip: collaboration name chips; optional logo swap when assets exist.
 */
export const LogoStrip = () => {
  const { eyebrow, supporting, collaborationNames, footnote } = trustStripContent;

  return (
    <section
      aria-labelledby="trust-strip-eyebrow"
      className="relative border-y border-border/40 bg-section-calm py-20 md:py-28"
    >
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 relative z-10">
        <header className="text-center mb-9 sm:mb-11 md:mb-12">
          <p
            id="trust-strip-eyebrow"
            className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-3 sm:mb-4"
          >
            {eyebrow}
          </p>
          <p className="text-sm sm:text-base text-foreground/88 max-w-xl mx-auto leading-relaxed font-medium">
            {supporting}
          </p>
        </header>

        <ul
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-x-5 gap-y-4 sm:gap-x-6 sm:gap-y-4 md:gap-x-7 md:gap-y-5 list-none m-0 p-0 justify-items-stretch"
          aria-label="Selected collaboration names"
        >
          {collaborationNames.map((name) => (
            <li key={name} className="min-w-0">
              <div
                className={[
                  'group flex min-h-[3.75rem] sm:min-h-[4rem] items-center justify-center rounded-xl',
                  'border border-border/60 bg-card shadow-sm',
                  'px-5 py-3.5 sm:px-6 sm:py-4',
                  'text-center text-sm sm:text-[0.95rem] font-semibold tracking-[0.045em] text-foreground',
                  'transition-[color,background-color,border-color,box-shadow] duration-300 ease-out',
                  'hover:border-border hover:shadow-md',
                ].join(' ')}
              >
                <span className="leading-snug [text-wrap:balance]">{name}</span>
              </div>
            </li>
          ))}
        </ul>

        <p className="mt-8 sm:mt-10 text-center text-[11px] sm:text-xs text-foreground/62 max-w-md mx-auto leading-relaxed">
          {footnote}
        </p>
      </div>
    </section>
  );
};
