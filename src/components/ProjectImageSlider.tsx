import { useCallback, useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { useIntersectionObserver } from '@/hooks/use-intersection-observer';

const SLIDE_MS = 5000;
const CROSSFADE_MS = 1400;

type ProjectImageSliderProps = {
  images: string[];
  alt: string;
  priority?: boolean;
  className?: string;
  variant?: 'card' | 'hero';
  objectFit?: 'cover' | 'contain';
};

const IMAGE_SIZES = {
  card: '(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw',
  hero: '(max-width: 1023px) 100vw, min(50vw, 720px)',
} as const;

export function ProjectImageSlider({
  images,
  alt,
  priority = false,
  className,
  variant = 'card',
  objectFit = 'cover',
}: ProjectImageSliderProps) {
  const slides = useMemo(() => images.filter(Boolean), [images]);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [failedSrc, setFailedSrc] = useState<Set<string>>(() => new Set());
  const [containerRef, inView] = useIntersectionObserver({ threshold: 0.25, rootMargin: '40px' });

  useEffect(() => {
    setFailedSrc(new Set());
    setIndex(0);
  }, [images]);

  useEffect(() => {
    setReduceMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  useEffect(() => {
    if (index >= slides.length) setIndex(0);
  }, [index, slides.length]);

  useEffect(() => {
    if (!inView || paused || reduceMotion || slides.length <= 1) return;
    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, SLIDE_MS);
    return () => window.clearInterval(timer);
  }, [inView, paused, reduceMotion, slides.length]);

  const kenBurnsVariant = useCallback((i: number) => {
    const variants = [
      'animate-portfolio-ken-burns-a',
      'animate-portfolio-ken-burns-b',
      'animate-portfolio-ken-burns-c',
    ] as const;
    return variants[i % variants.length];
  }, []);

  if (slides.length === 0) return null;

  const single = slides.length === 1;
  /** Ken Burns only on detail hero, 3D transforms on cards caused blank/grey previews in some browsers. */
  const motionReady = variant === 'hero' && inView && !reduceMotion;

  return (
    <div
      ref={containerRef}
      className={cn('absolute inset-0 overflow-hidden bg-secondary', className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {slides.map((src, i) => {
        if (failedSrc.has(src)) return null;
        const active = i === index;
        return (
          <div
            key={`${src}-${i}`}
            className={cn(
              'absolute inset-0 portfolio-slide-layer',
              active ? 'opacity-100 z-[2]' : 'opacity-0 z-[1]',
            )}
            style={{ transitionDuration: `${CROSSFADE_MS}ms` }}
            aria-hidden={!active}
          >
            <img
              src={src}
              alt={active ? alt : ''}
              sizes={IMAGE_SIZES[variant]}
              loading="eager"
              decoding="async"
              {...(priority && i === 0 ? { fetchpriority: 'high' as const } : {})}
              draggable={false}
              className={cn(
                'h-full w-full select-none',
                objectFit === 'contain' ? 'object-contain' : 'object-cover',
                motionReady && !single && active && kenBurnsVariant(i),
                motionReady && single && active && 'animate-portfolio-ken-burns-a',
              )}
              onContextMenu={(e) => e.preventDefault()}
              onDragStart={(e) => e.preventDefault()}
              onError={() => {
                setFailedSrc((prev) => {
                  const next = new Set(prev);
                  next.add(src);
                  if (active) {
                    setIndex((current) => {
                      for (let step = 1; step <= slides.length; step++) {
                        const candidate = (current + step) % slides.length;
                        if (!next.has(slides[candidate])) return candidate;
                      }
                      return current;
                    });
                  }
                  return next;
                });
              }}
            />
          </div>
        );
      })}

      {motionReady && (
        <div
          className="pointer-events-none absolute inset-0 z-[3] overflow-hidden opacity-20"
          aria-hidden
        >
          <div className="absolute inset-y-0 -left-1/2 w-1/2 animate-portfolio-shimmer bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-12" />
        </div>
      )}

      <div
        className="pointer-events-none absolute inset-0 z-[3] bg-gradient-to-t from-black/40 via-transparent to-black/10"
        aria-hidden
      />

      {slides.length > 1 && (
        <div
          className={cn(
            'absolute left-0 right-0 z-[4] flex items-center justify-center gap-1.5 px-3',
            variant === 'hero' ? 'bottom-4' : 'bottom-2.5',
          )}
          aria-hidden
        >
          {slides.map((_, i) => (
            <span
              key={i}
              className={cn(
                'rounded-full transition-all duration-700 ease-out',
                variant === 'hero' ? 'h-1.5' : 'h-1',
                i === index
                  ? variant === 'hero'
                    ? 'w-7 bg-white/95 shadow-sm'
                    : 'w-5 bg-white/95 shadow-sm'
                  : variant === 'hero'
                    ? 'w-2 bg-white/40'
                    : 'w-1.5 bg-white/40',
              )}
            />
          ))}
        </div>
      )}

      {variant === 'hero' && slides.length > 1 && (
        <div
          className="pointer-events-none absolute top-3 left-3 z-[4] rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-medium text-white/90 backdrop-blur-sm"
          aria-hidden
        >
          {index + 1} / {slides.length}
        </div>
      )}
    </div>
  );
}
