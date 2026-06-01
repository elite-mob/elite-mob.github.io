import { useCallback, useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { useIntersectionObserver } from '@/hooks/use-intersection-observer';

const SLIDE_MS = 4200;
const FADE_MS = 900;

type ProjectImageSliderProps = {
  images: string[];
  alt: string;
  priority?: boolean;
  className?: string;
};

export function ProjectImageSlider({
  images,
  alt,
  priority = false,
  className,
}: ProjectImageSliderProps) {
  const slides = useMemo(() => images.filter(Boolean), [images]);
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [containerRef, inView] = useIntersectionObserver({ threshold: 0.25, rootMargin: '40px' });

  useEffect(() => {
    setReduceMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  useEffect(() => {
    if (index >= slides.length) setIndex(0);
  }, [index, slides.length]);

  useEffect(() => {
    if (!inView || paused || reduceMotion || slides.length <= 1) return;
    const timer = window.setInterval(() => {
      setVisible(false);
      window.setTimeout(() => {
        setIndex((prev) => (prev + 1) % slides.length);
        setVisible(true);
      }, FADE_MS);
    }, SLIDE_MS);
    return () => window.clearInterval(timer);
  }, [inView, paused, reduceMotion, slides.length]);

  useEffect(() => {
    setVisible(true);
  }, [index]);

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
        const active = i === index;
        return (
          <div
            key={`${src}-${i}`}
            className={cn(
              'absolute inset-0 transition-opacity ease-in-out',
              active && visible ? 'opacity-100 z-[1]' : 'opacity-0 z-0',
            )}
            style={{ transitionDuration: `${FADE_MS}ms` }}
            aria-hidden={!active}
          >
            <img
              src={src}
              alt={active ? alt : ''}
              sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
              loading={priority && i === 0 ? 'eager' : 'lazy'}
              decoding="async"
              fetchPriority={priority && i === 0 ? 'high' : undefined}
              draggable={false}
              className={cn(
                'h-full w-full object-cover select-none',
                active && inView && !reduceMotion && !single && kenBurnsVariant(i),
                active && inView && !reduceMotion && single && 'animate-portfolio-ken-burns-a',
              )}
              onContextMenu={(e) => e.preventDefault()}
              onDragStart={(e) => e.preventDefault()}
            />
          </div>
        );
      })}

      {/* Living light sweep */}
      {!reduceMotion && inView && (
        <div
          className="pointer-events-none absolute inset-0 z-[2] overflow-hidden opacity-25"
          aria-hidden
        >
          <div className="absolute inset-y-0 -left-1/2 w-1/2 animate-portfolio-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
        </div>
      )}

      <div
        className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-t from-black/35 via-transparent to-black/10"
        aria-hidden
      />

      {slides.length > 1 && (
        <div
          className="absolute bottom-2.5 left-0 right-0 z-[3] flex justify-center gap-1.5 px-3"
          aria-hidden
        >
          {slides.map((_, i) => (
            <span
              key={i}
              className={cn(
                'h-1 rounded-full transition-all duration-500',
                i === index
                  ? 'w-5 bg-white/90 shadow-sm'
                  : 'w-1.5 bg-white/45',
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
