import { ArrowDown, Code2, Smartphone, Brain, CheckCircle2, CalendarClock } from 'lucide-react';
import { navigateToPortfolio, navigateToSection } from '@/lib/navigation';
import { heroContent, scheduleMeetingContent } from '@/data/siteContent';
import { Button } from '@/components/ui/button';
import { getScheduleMeetingUrl } from '@/lib/scheduleMeeting';
import { publicAssetUrl } from '@/lib/publicAssetUrl';

const heroMobileBg = publicAssetUrl('/hero/background-mobile.webp');
const heroDesktopBg = publicAssetUrl('/hero/background-desktop.webp');

export const HeroSection = () => {
  const scheduleMeetingUrl = getScheduleMeetingUrl();

  return (
    <section
      id="home"
      aria-labelledby="hero-heading"
      className="min-h-screen flex items-center justify-center relative overflow-hidden pt-[calc(5rem+env(safe-area-inset-top,0px))]"
    >
      <div
        className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background/88 dark:from-[hsl(222_22%_8%)] dark:via-[hsl(222_20%_9%)] dark:to-[hsl(222_18%_10%)]"
        aria-hidden
      />

      <picture className="absolute inset-0 block scale-[1.02] opacity-[0.42] dark:opacity-[0.28] saturate-[0.85] dark:saturate-[0.7]" aria-hidden>
        <source media="(min-width: 768px)" srcSet={heroDesktopBg} type="image/webp" />
        <img
          src={heroMobileBg}
          alt=""
          width={768}
          height={432}
          decoding="async"
          fetchpriority="high"
          className="h-full w-full object-cover object-center"
        />
      </picture>

      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_20%,hsl(187_55%_42%/0.12),transparent_55%)] dark:bg-[radial-gradient(ellipse_at_50%_18%,hsl(187_50%_48%/0.14),transparent_58%)]"
        aria-hidden
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent dark:from-[hsl(222_22%_8%)] dark:via-[hsl(222_20%_9%/0.55)]" aria-hidden />
      <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-background/80 dark:from-[hsl(222_22%_8%/0.92)] dark:to-[hsl(222_22%_8%/0.92)]" aria-hidden />

      <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-primary/8 blur-[100px] max-md:blur-[60px]" aria-hidden />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-primary/6 blur-[100px] max-md:blur-[60px]" aria-hidden />

      <div
        className="absolute inset-0 opacity-[0.018] sm:opacity-[0.022]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
        aria-hidden
      />

      <div className="container mx-auto px-4 sm:px-6 relative z-10 pt-16 sm:pt-20 md:pt-24 lg:pt-28">
        <div className="hero-content-reveal max-w-3xl mx-auto text-center">
          <div className="glass-card rounded-2xl sm:rounded-3xl border-primary/22 px-5 py-9 sm:px-9 sm:py-11 md:px-12 md:py-12 shadow-4d">
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.18em] text-primary mb-4">
              {heroContent.eyebrow}
            </p>

            <h1
              id="hero-heading"
              className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-[1.1] mb-5 sm:mb-6 px-1 [text-wrap:balance] [text-shadow:0_1px_2px_hsl(var(--background)/0.5)]"
            >
              {heroContent.headline}
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-foreground/[0.96] max-w-2xl mx-auto leading-relaxed mb-8">
              {heroContent.supporting}
            </p>

            <ul className="text-left max-w-xl mx-auto space-y-3.5 mb-8 sm:mb-10">
              {heroContent.trustBullets.map((line) => (
                <li key={line} className="flex gap-3 text-sm sm:text-base text-foreground/90 leading-snug">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" aria-hidden />
                  <span>{line}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center mb-10 sm:mb-12">
              <button
                type="button"
                onClick={() => navigateToPortfolio()}
                className="inline-flex items-center justify-center gap-2 min-h-[48px] rounded-xl px-6 sm:px-8 text-base font-semibold shadow-4d border-2 border-primary/50 hover:border-primary/80 text-foreground bg-primary/10 hover:bg-primary/15 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98]"
                aria-label={`${heroContent.primaryCta}: scroll to portfolio`}
              >
                {heroContent.primaryCta}
              </button>
              {scheduleMeetingUrl && (
                <Button
                  type="button"
                  variant="heroOutline"
                  size="lg"
                  className="min-h-[48px] rounded-xl px-6 sm:px-8 text-base gap-2 active:scale-[0.98]"
                  onClick={() =>
                    window.open(scheduleMeetingUrl, '_blank', 'noopener,noreferrer')
                  }
                  data-analytics-button=""
                  data-analytics-label="Schedule a meeting (hero)"
                  aria-label={`${scheduleMeetingContent.ctaLabel} (opens in new tab)`}
                >
                  <CalendarClock className="w-5 h-5" aria-hidden />
                  {scheduleMeetingContent.ctaLabel}
                </Button>
              )}
            </div>

            <p className="text-xs sm:text-sm text-foreground/70 mb-6">
              Prefer email first?{' '}
              <button
                type="button"
                onClick={() => navigateToSection('#contact')}
                className="text-primary font-semibold underline underline-offset-2 hover:text-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-full px-1 min-h-[44px] inline-flex items-center"
              >
                Jump to the contact form
              </button>
            </p>

            <div className="flex flex-wrap justify-center gap-3 sm:gap-3.5">
              {[
                { icon: Code2, label: 'Web', category: 'web' as const },
                { icon: Smartphone, label: 'Mobile', category: 'mobile' as const },
                { icon: Brain, label: 'AI', category: 'ai' as const },
              ].map(({ icon: Icon, label, category }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => navigateToPortfolio(category)}
                  className="group relative flex items-center gap-2 px-4 py-3 min-h-[48px] min-w-[44px] rounded-xl glass-card border border-primary/22 hover:border-primary/45 shadow-4d transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98]"
                  aria-label={`Filter portfolio to ${label} case studies`}
                >
                  <div className="p-2 rounded-lg bg-gradient-to-br from-primary/18 to-primary/8 border border-primary/28">
                    <Icon className="w-4 h-4 text-primary" aria-hidden />
                  </div>
                  <span className="font-semibold text-foreground text-sm sm:text-base">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="hero-scroll-hint flex justify-center mt-12 sm:mt-16 md:mt-20">
          <button
            type="button"
            onClick={() => navigateToPortfolio()}
            className="group flex flex-col items-center gap-2 text-foreground/75 hover:text-primary transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-full p-3 min-h-[44px] min-w-[44px] active:scale-95"
            aria-label="Scroll to case studies"
          >
            <span className="text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity max-md:opacity-70">
              View work
            </span>
            <ArrowDown className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden />
          </button>
        </div>
      </div>
    </section>
  );
};
