import { useIntersectionObserver } from '@/hooks/use-intersection-observer';
import { Quote } from 'lucide-react';
import { testimonials, type Testimonial } from '@/data/testimonials';
import { cn } from '@/lib/utils';

function ReviewCard({ t, index, visible }: { t: Testimonial; index: number; visible: boolean }) {
  return (
    <article
      className={cn(
        'relative rounded-2xl sm:rounded-3xl border border-primary/20 glass-card shadow-sm transition-all duration-300',
        'hover:border-primary/35 hover:shadow-md hover:shadow-primary/[0.06]',
        visible ? 'animate-fade-in-up' : 'opacity-0',
      )}
      style={{ animationDelay: visible ? `${Math.min(index, 8) * 45}ms` : undefined }}
    >
      <div className="flex gap-0">
        <div
          className="w-1 shrink-0 rounded-l-2xl sm:rounded-l-3xl bg-gradient-to-b from-primary via-primary/55 to-primary/15"
          aria-hidden
        />
        <div className="relative flex-1 min-w-0 py-5 pl-4 pr-4 sm:py-6 sm:pl-5 sm:pr-6">
          <Quote
            className="pointer-events-none absolute right-4 top-4 h-14 w-14 sm:h-16 sm:w-16 text-primary/[0.07]"
            aria-hidden
          />

          <div className="relative z-10 flex flex-col gap-4">
            {t.context && (
              <span className="inline-flex w-fit items-center rounded-full border border-primary/20 bg-primary/8 px-2.5 py-1 text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-primary">
                {t.context}
              </span>
            )}

            <blockquote className="m-0">
              <p className="text-sm sm:text-[0.95rem] leading-[1.65] text-foreground/95 [text-wrap:pretty] pr-2">
                {t.quote}
              </p>
            </blockquote>

            <footer className="flex items-center gap-3 pt-3 border-t border-border/65">
              <div
                className="flex size-10 sm:size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/22 to-primary/6 border border-primary/20 text-xs sm:text-sm font-display font-bold leading-none text-primary"
                aria-hidden
              >
                {t.initials}
              </div>
              <cite className="min-w-0 flex-1 not-italic text-sm sm:text-[0.95rem] font-semibold leading-[1.35] text-foreground [text-wrap:balance]">
                {t.attribution}
              </cite>
            </footer>
          </div>
        </div>
      </div>
    </article>
  );
}

export const ReviewsSection = () => {
  const [sectionRef, isSectionVisible] = useIntersectionObserver({ threshold: 0.08 });

  return (
    <section
      id="reviews"
      aria-labelledby="reviews-heading"
      className="py-20 md:py-28 relative overflow-hidden scroll-mt-24"
      ref={sectionRef}
    >
      <div className="absolute inset-0 z-0 bg-section-elevated" aria-hidden />
      <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden" aria-hidden>
        <div
          className="absolute right-0 top-1/3 h-[min(50vh,28rem)] w-[min(90vw,36rem)] translate-x-1/4 rounded-full blur-[100px] opacity-90"
          style={{
            background:
              'radial-gradient(circle at center, hsl(187 55% 48% / 0.07) 0%, hsl(187 50% 52% / 0.02) 55%, transparent 70%)',
          }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <header
          className={`text-center max-w-3xl mx-auto mb-12 sm:mb-14 md:mb-16 ${
            isSectionVisible ? 'animate-fade-in-up' : 'opacity-0'
          }`}
        >
          <h2
            id="reviews-heading"
            className={`font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 sm:mb-5 ${
              isSectionVisible ? 'animate-text-reveal stagger-delay-2' : 'opacity-0'
            }`}
          >
            What people <span className="gradient-text-transparent">say</span>
          </h2>
          <p
            className={`text-sm sm:text-base text-foreground/78 leading-relaxed [text-wrap:balance] ${
              isSectionVisible ? 'animate-fade-in-up stagger-delay-3' : 'opacity-0'
            }`}
          >
            Representative feedback from shipped work; update testimonials data when NDAs require anonymization.
          </p>
        </header>

        <div
          className={cn(
            'columns-1 md:columns-2 xl:columns-3 gap-x-6 sm:gap-x-8 max-w-[1400px] mx-auto',
            isSectionVisible ? '' : 'opacity-0',
          )}
        >
          {testimonials.map((t, i) => (
            <div key={`review-${i}`} className="break-inside-avoid mb-6 sm:mb-8">
              <ReviewCard t={t} index={i} visible={isSectionVisible} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
