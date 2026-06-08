import { useState } from 'react';
import { useIntersectionObserver } from '@/hooks/use-intersection-observer';
import { Quote } from 'lucide-react';
import { testimonials, type Testimonial } from '@/data/testimonials';
import { testimonialAvatarSrc } from '@/lib/testimonialAvatar';
import { cn } from '@/lib/utils';
import { SectionBackdrop } from '@/components/SectionBackdrop';
import { SectionHeader } from '@/components/SectionHeader';

function testimonialDisplayName(attribution: string): string {
  return attribution.split(' · ')[0]?.trim() || attribution;
}

function TestimonialAvatar({ t, name }: { t: Testimonial; name: string }) {
  const staticSrc = testimonialAvatarSrc(t);
  const [showPhoto, setShowPhoto] = useState(Boolean(staticSrc));

  const shellClass =
    'flex size-10 sm:size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-primary/22 to-primary/6';

  if (!staticSrc || !showPhoto) {
    return (
      <div
        className={cn(shellClass, 'text-xs sm:text-sm font-display font-bold leading-none text-primary')}
        aria-hidden
      >
        {t.initials}
      </div>
    );
  }

  return (
    <div className={shellClass}>
      <img
        src={staticSrc}
        alt={`${name} profile photo`}
        className="h-full w-full object-cover"
        width={44}
        height={44}
        loading="lazy"
        decoding="async"
        onError={() => setShowPhoto(false)}
      />
    </div>
  );
}

function ReviewCard({ t, index, visible }: { t: Testimonial; index: number; visible: boolean }) {
  const displayName = testimonialDisplayName(t.attribution);
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
              <TestimonialAvatar t={t} name={displayName} />
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
      <SectionBackdrop variant="elevated" grid />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <SectionHeader
          id="reviews-heading"
          eyebrow="REVIEWS"
          title={
            <>
              What people <span className="gradient-text-transparent">say</span>
            </>
          }
          description="Representative feedback from shipped work."
          visible={isSectionVisible}
        />

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
