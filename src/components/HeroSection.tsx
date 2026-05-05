import { ArrowDown, Code2, Smartphone, Brain, CheckCircle2, CalendarClock } from 'lucide-react';
import heroBg from '@/assets/background1.png';
import { navigateToPortfolio, navigateToSection } from '@/lib/navigation';
import { heroContent, scheduleMeetingContent } from '@/data/siteContent';
import { motion, useReducedMotion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { getScheduleMeetingUrl } from '@/lib/scheduleMeeting';

const heroMotion = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
};

export const HeroSection = () => {
  const prefersReducedMotion = useReducedMotion();
  const scheduleMeetingUrl = getScheduleMeetingUrl();

  return (
    <section
      id="home"
      aria-labelledby="hero-heading"
      className="min-h-screen flex items-center justify-center relative overflow-hidden pt-[calc(5rem+env(safe-area-inset-top,0px))]"
    >
      {/* Soft green wash: home screen base tint */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-[hsl(154_26%_94.5%)] via-[hsl(172_22%_96%)] to-[hsl(198_20%_97%)] dark:from-[hsl(220_18%_14%)] dark:via-[hsl(188_14%_16%)] dark:to-[hsl(200_12%_17%)]"
        aria-hidden
      />
      {/* Hero BG: LCP candidate; slight darkening reduces washout behind overlays. */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-[1.03] sm:scale-100 brightness-[0.86] sm:brightness-[0.88] dark:brightness-[0.64] dark:sm:brightness-[0.66]"
        style={{ backgroundImage: `url(${heroBg})` }}
        aria-hidden
      />
      {/* Readability stack: higher-opacity base + teal tint + edge darkening */}
      <div className="absolute inset-0 bg-gradient-to-b from-[hsl(200_25%_98%_/_0.94)] via-[hsl(188_22%_97%_/_0.82)] to-[hsl(165_18%_97%_/_0.96)] dark:from-[hsl(220_16%_17%_/_0.88)] dark:via-[hsl(200_12%_19%_/_0.78)] dark:to-[hsl(188_12%_19%_/_0.9)]" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/62 via-background/32 to-background/62" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(187_50%_32%_/_0.09)_0%,hsl(187_85%_42%_/_0.04)_45%,transparent_62%)] dark:bg-[radial-gradient(ellipse_at_center,hsl(187_55%_42%_/_0.1)_0%,hsl(187_60%_48%_/_0.05)_45%,transparent_62%)]" />
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,hsl(220_25%_18%_/_0.12)_100%)] dark:bg-[radial-gradient(ellipse_at_center,transparent_0%,hsl(220_30%_8%_/_0.32)_100%)]"
        aria-hidden
      />

      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl" aria-hidden />
      <div
        className="absolute bottom-1/4 -right-32 w-96 h-96 bg-primary/4 rounded-full blur-3xl"
        aria-hidden
        style={{ animationDelay: '1.5s' }}
      />

      <div
        className="absolute inset-0 opacity-[0.018] sm:opacity-[0.022]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
        aria-hidden
      />

      <div className="container mx-auto px-4 sm:px-6 relative z-10 pt-16 sm:pt-20 md:pt-24 lg:pt-28">
        <motion.div
          className="max-w-3xl mx-auto text-center"
          {...(prefersReducedMotion ? {} : { initial: heroMotion.initial, animate: heroMotion.animate, transition: heroMotion.transition })}
        >
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
        </motion.div>

        {!prefersReducedMotion && (
          <motion.div
            className="flex justify-center mt-12 sm:mt-16 md:mt-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.4 }}
          >
            <button
              type="button"
              onClick={() => navigateToPortfolio()}
              className="group flex flex-col items-center gap-2 text-foreground/75 hover:text-primary transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-full p-3 min-h-[44px] min-w-[44px] active:scale-95"
              aria-label="Scroll to case studies"
            >
              <span className="text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                View work
              </span>
              <ArrowDown className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden />
            </button>
          </motion.div>
        )}
        {prefersReducedMotion && (
          <div className="flex justify-center mt-12 sm:mt-16 md:mt-20">
            <button
              type="button"
              onClick={() => navigateToPortfolio()}
              className="group flex flex-col items-center gap-2 text-foreground/75 hover:text-primary transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-full p-3 min-h-[44px] min-w-[44px]"
              aria-label="Scroll to case studies"
            >
              <span className="text-xs font-medium">View work</span>
              <ArrowDown className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
