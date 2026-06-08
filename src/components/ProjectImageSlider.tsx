import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { useIntersectionObserver } from '@/hooks/use-intersection-observer';
import { isImagePrefetched } from '@/lib/prefetchImage';
import {
  getHighResSrc,
  getLowResSrc,
  resolvePortfolioSlideSources,
  type PortfolioSlideSources,
} from '@/lib/portfolioImageVariants';

const SLIDE_MS = 5000;
const CROSSFADE_MS = 1400;
const SWIPE_THRESHOLD_PX = 36;
const SWIPE_LOCK_RATIO = 1.35;
const USER_PAUSE_MS = 12000;

type ProjectImageSliderProps = {
  images: string[];
  alt: string;
  priority?: boolean;
  className?: string;
  variant?: 'card' | 'hero';
  objectFit?: 'cover' | 'contain';
  interactive?: boolean;
  onOpenRequest?: () => void;
  preload?: boolean;
};

const IMAGE_SIZES = {
  card: '(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw',
  hero: '(max-width: 1023px) 100vw, min(50vw, 720px)',
} as const;

function slideNeighbors(activeIndex: number, length: number) {
  if (length <= 1) return new Set([activeIndex]);
  const prev = (activeIndex - 1 + length) % length;
  const next = (activeIndex + 1) % length;
  return new Set([activeIndex, prev, next]);
}

export function ProjectImageSlider({
  images,
  alt,
  priority = false,
  className,
  variant = 'card',
  objectFit = 'cover',
  interactive: interactiveProp,
  onOpenRequest,
  preload = false,
}: ProjectImageSliderProps) {
  const slides = useMemo(() => images.filter(Boolean), [images]);
  const slideSources = useMemo(() => resolvePortfolioSlideSources(slides), [slides]);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [failedSrc, setFailedSrc] = useState<Set<string>>(() => new Set());
  const [loadedSrc, setLoadedSrc] = useState<Set<string>>(() => new Set());
  const [containerRef, inView] = useIntersectionObserver({
    threshold: 0.12,
    rootMargin: variant === 'card' ? '240px 0px 320px 0px' : '120px 0px 160px 0px',
  });
  const shouldLoad = inView || preload || priority;

  const interactive = interactiveProp ?? slides.length > 1;
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const pointerLocked = useRef<'horizontal' | null>(null);
  const didSwipe = useRef(false);
  const resumeTimerRef = useRef<number | null>(null);

  const markLoaded = useCallback((src: string) => {
    setLoadedSrc((prev) => {
      if (prev.has(src)) return prev;
      const next = new Set(prev);
      next.add(src);
      return next;
    });
  }, []);

  const isSrcReady = useCallback(
    (src: string) => loadedSrc.has(src) || isImagePrefetched(src),
    [loadedSrc],
  );

  const pauseAutoAdvance = useCallback((durationMs = USER_PAUSE_MS) => {
    setPaused(true);
    if (resumeTimerRef.current !== null) {
      window.clearTimeout(resumeTimerRef.current);
    }
    resumeTimerRef.current = window.setTimeout(() => {
      setPaused(false);
      resumeTimerRef.current = null;
    }, durationMs);
  }, []);

  const goToSlide = useCallback(
    (nextIndex: number) => {
      if (slides.length <= 1) return;
      const normalized = ((nextIndex % slides.length) + slides.length) % slides.length;
      setIndex(normalized);
      pauseAutoAdvance();
    },
    [pauseAutoAdvance, slides.length],
  );

  const stepSlide = useCallback(
    (direction: -1 | 1) => {
      goToSlide(index + direction);
    },
    [goToSlide, index],
  );

  useEffect(() => {
    setFailedSrc(new Set());
    const seeded = new Set<string>();
    slideSources.forEach((sources) => {
      const low = getLowResSrc(sources);
      const high = getHighResSrc(sources, variant);
      if (isImagePrefetched(low)) seeded.add(low);
      if (isImagePrefetched(high)) seeded.add(high);
    });
    setLoadedSrc(seeded);
    setIndex(0);
  }, [images, slideSources, variant]);

  useEffect(() => {
    setReduceMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  useEffect(() => {
    if (index >= slides.length) setIndex(0);
  }, [index, slides.length]);

  useEffect(() => {
    return () => {
      if (resumeTimerRef.current !== null) {
        window.clearTimeout(resumeTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!inView || paused || reduceMotion || slides.length <= 1) return;
    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, SLIDE_MS);
    return () => window.clearInterval(timer);
  }, [inView, paused, reduceMotion, slides.length]);

  const mountedSlides = useMemo(() => slideNeighbors(index, slides.length), [index, slides.length]);

  const shouldLoadLowRes = useCallback(
    (slideIndex: number) => {
      if (!shouldLoad) return false;
      if (priority && slideIndex === 0) return true;
      return mountedSlides.has(slideIndex);
    },
    [shouldLoad, priority, mountedSlides],
  );

  const shouldLoadHighRes = useCallback(
    (slideIndex: number, active: boolean) => {
      if (!shouldLoad) return false;
      if (variant === 'hero') return inView && active;
      return inView && mountedSlides.has(slideIndex);
    },
    [shouldLoad, variant, inView, mountedSlides],
  );

  useEffect(() => {
    if (!shouldLoad || slides.length <= 1) return;
    const nextSources = slideSources[(index + 1) % slides.length];
    if (!nextSources) return;

    const low = getLowResSrc(nextSources);
    const high = getHighResSrc(nextSources, variant);
    if (!failedSrc.has(nextSources.full) && !isSrcReady(low)) {
      const img = new Image();
      img.decoding = 'async';
      img.src = low;
      img.onload = () => markLoaded(low);
    }
    if (
      inView &&
      high !== low &&
      !failedSrc.has(nextSources.full) &&
      !isSrcReady(high)
    ) {
      const img = new Image();
      img.decoding = 'async';
      img.src = high;
      img.onload = () => markLoaded(high);
    }
  }, [failedSrc, shouldLoad, inView, index, isSrcReady, markLoaded, slideSources, slides.length, variant]);

  const kenBurnsVariant = useCallback((i: number) => {
    const variants = [
      'animate-portfolio-ken-burns-a',
      'animate-portfolio-ken-burns-b',
      'animate-portfolio-ken-burns-c',
    ] as const;
    return variants[i % variants.length];
  }, []);

  const handleImageRef = useCallback(
    (node: HTMLImageElement | null, src: string) => {
      if (node?.complete && node.naturalWidth > 0) {
        markLoaded(src);
      }
    },
    [markLoaded],
  );

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!interactive || slides.length <= 1) return;
      pointerStart.current = { x: event.clientX, y: event.clientY };
      pointerLocked.current = null;
      didSwipe.current = false;
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [interactive, slides.length],
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!interactive || !pointerStart.current) return;

      const dx = event.clientX - pointerStart.current.x;
      const dy = event.clientY - pointerStart.current.y;

      if (!pointerLocked.current) {
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
        if (Math.abs(dx) > Math.abs(dy) * SWIPE_LOCK_RATIO) {
          pointerLocked.current = 'horizontal';
        } else {
          pointerStart.current = null;
          return;
        }
      }

      if (pointerLocked.current === 'horizontal') {
        event.preventDefault();
      }
    },
    [interactive],
  );

  const handlePointerUp = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!interactive || slides.length <= 1) return;

      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }

      const start = pointerStart.current;
      pointerStart.current = null;
      pointerLocked.current = null;

      if (!start) return;

      const dx = event.clientX - start.x;
      const dy = event.clientY - start.y;

      if (Math.abs(dx) >= SWIPE_THRESHOLD_PX && Math.abs(dx) > Math.abs(dy) * SWIPE_LOCK_RATIO) {
        didSwipe.current = true;
        event.stopPropagation();
        stepSlide(dx < 0 ? 1 : -1);
        return;
      }

      if (didSwipe.current) return;

      const width = event.currentTarget.clientWidth;
      const relativeX = event.clientX - event.currentTarget.getBoundingClientRect().left;

      if (relativeX < width * 0.28) {
        event.stopPropagation();
        stepSlide(-1);
        return;
      }

      if (relativeX > width * 0.72) {
        event.stopPropagation();
        stepSlide(1);
        return;
      }

      if (onOpenRequest) {
        event.stopPropagation();
        onOpenRequest();
      }
    },
    [interactive, onOpenRequest, slides.length, stepSlide],
  );

  const handlePointerCancel = useCallback(() => {
    pointerStart.current = null;
    pointerLocked.current = null;
  }, []);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (!interactive || slides.length <= 1) return;
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        stepSlide(-1);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        stepSlide(1);
      }
    },
    [interactive, slides.length, stepSlide],
  );

  const renderSlideImage = (
    sources: PortfolioSlideSources,
    slideKey: string,
    active: boolean,
    slideIndex: number,
  ) => {
    if (failedSrc.has(sources.full)) return null;

    const lowSrc = getLowResSrc(sources);
    const highSrc = getHighResSrc(sources, variant);
    const progressive = lowSrc !== highSrc;
    const loadLow = shouldLoadLowRes(slideIndex);
    const loadHigh = shouldLoadHighRes(slideIndex, active);
    const lowReady = isSrcReady(lowSrc);
    const highReady = isSrcReady(highSrc);
    const paintReady = highReady || lowReady;
    const showPlaceholder = shouldLoad && !paintReady;

    const imageClass = cn(
      'portfolio-slide-image pointer-events-none h-full w-full select-none',
      objectFit === 'contain' ? 'object-contain' : 'object-cover object-center',
    );

    const onImageError = (failedUrl: string) => {
      if (failedUrl === highSrc && lowReady) return;
      setFailedSrc((prev) => {
        const next = new Set(prev);
        next.add(sources.full);
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
    };

    return (
      <div
        key={slideKey}
        className={cn(
          'absolute inset-0 portfolio-slide-layer',
          active ? 'opacity-100 z-[2]' : 'opacity-0 z-[1]',
        )}
        style={{ transitionDuration: `${CROSSFADE_MS}ms` }}
        aria-hidden={!active}
      >
        {showPlaceholder && (
          <div className="absolute inset-0 portfolio-image-placeholder" aria-hidden />
        )}

        {progressive && loadLow && (
          <img
            ref={(node) => handleImageRef(node, lowSrc)}
            src={lowSrc}
            alt=""
            sizes={IMAGE_SIZES[variant]}
            loading={loadLow && (priority || preload) ? 'eager' : 'lazy'}
            decoding="async"
            {...(priority && slideIndex === 0 ? { fetchpriority: 'high' as const } : {})}
            draggable={false}
            className={cn(
              imageClass,
              'portfolio-slide-image--low',
              lowReady && 'portfolio-slide-image--loaded',
              highReady && 'portfolio-slide-image--superseded',
              lowReady && isImagePrefetched(lowSrc) && 'portfolio-slide-image--prefetched',
            )}
            onContextMenu={(e) => e.preventDefault()}
            onDragStart={(e) => e.preventDefault()}
            onLoad={() => markLoaded(lowSrc)}
            onError={() => onImageError(lowSrc)}
          />
        )}

        {(progressive ? loadHigh : loadLow) && (
          <img
            ref={(node) => handleImageRef(node, progressive ? highSrc : lowSrc)}
            src={progressive ? highSrc : lowSrc}
            alt={active ? alt : ''}
            sizes={IMAGE_SIZES[variant]}
            loading={loadHigh || (priority && slideIndex === 0) ? 'eager' : 'lazy'}
            decoding="async"
            draggable={false}
            className={cn(
              imageClass,
              progressive && 'portfolio-slide-image--high',
              paintReady && 'portfolio-slide-image--loaded',
              paintReady && isImagePrefetched(progressive ? highSrc : lowSrc) && 'portfolio-slide-image--prefetched',
              motionReady && paintReady && !single && active && kenBurnsVariant(slideIndex),
              motionReady && paintReady && single && active && 'animate-portfolio-ken-burns-a',
            )}
            onContextMenu={(e) => e.preventDefault()}
            onDragStart={(e) => e.preventDefault()}
            onLoad={() => markLoaded(progressive ? highSrc : lowSrc)}
            onError={() => onImageError(progressive ? highSrc : lowSrc)}
          />
        )}
      </div>
    );
  };

  if (slides.length === 0) return null;

  const single = slides.length === 1;
  const motionReady = variant === 'hero' && inView && !reduceMotion;

  const slideMounted = (i: number, sources: PortfolioSlideSources) => {
    const low = getLowResSrc(sources);
    const high = getHighResSrc(sources, variant);
    return (
      mountedSlides.has(i) ||
      loadedSrc.has(low) ||
      loadedSrc.has(high) ||
      isImagePrefetched(low) ||
      isImagePrefetched(high)
    );
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'absolute inset-0 overflow-hidden bg-secondary',
        interactive && slides.length > 1 && 'portfolio-slider-interactive z-[5]',
        className,
      )}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => {
        if (resumeTimerRef.current === null) setPaused(false);
      }}
      onFocus={() => setPaused(true)}
      onBlur={() => {
        if (resumeTimerRef.current === null) setPaused(false);
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onKeyDown={handleKeyDown}
      role={interactive && slides.length > 1 ? 'group' : undefined}
      aria-roledescription={interactive && slides.length > 1 ? 'carousel' : undefined}
      aria-label={interactive && slides.length > 1 ? `${alt} image gallery` : undefined}
      tabIndex={interactive && slides.length > 1 ? 0 : undefined}
    >
      {slides.map((src, i) => {
        const sources = slideSources[i];
        if (!sources || !slideMounted(i, sources)) return null;
        return renderSlideImage(sources, `${src}-${i}`, i === index, i);
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
            interactive && 'pointer-events-auto',
          )}
          role={interactive ? 'tablist' : undefined}
          aria-label={interactive ? 'Select project image' : undefined}
        >
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              role={interactive ? 'tab' : undefined}
              aria-selected={interactive ? i === index : undefined}
              aria-label={interactive ? `Show image ${i + 1} of ${slides.length}` : undefined}
              disabled={!interactive}
              onPointerDown={(event) => event.stopPropagation()}
              onPointerUp={(event) => event.stopPropagation()}
              onClick={(event) => {
                if (!interactive) return;
                event.stopPropagation();
                goToSlide(i);
              }}
              className={cn(
                'rounded-full transition-all duration-500 ease-out',
                variant === 'hero' ? 'h-1.5' : 'h-1',
                interactive && 'cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80',
                i === index
                  ? variant === 'hero'
                    ? 'w-7 bg-white/95 shadow-sm'
                    : 'w-5 bg-white/95 shadow-sm'
                  : variant === 'hero'
                    ? 'w-2 bg-white/40 hover:bg-white/60'
                    : 'w-1.5 bg-white/40 hover:bg-white/60',
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
};
