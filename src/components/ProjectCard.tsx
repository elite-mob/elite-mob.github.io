import type { PortfolioGridProject } from '@/data/portfolioGrid';
import { RouterNavButton } from '@/components/RouterNavButton';
import { ProjectImageSlider } from '@/components/ProjectImageSlider';
import { AppStoreRating } from '@/components/AppStoreRating';
import { getProjectSliderImages, getProjectSliderSources } from '@/lib/portfolioGallery';
import { getHighResSrc, getLowResSrc } from '@/lib/portfolioImageVariants';
import { getStoreLinksForProject } from '@/lib/appStoreRating';
import { Code2, Smartphone, Brain } from 'lucide-react';
import { use3DTilt } from '@/hooks/use-3d-tilt';
import { useNearViewport } from '@/hooks/use-near-viewport';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { prefetchSlideProgressive } from '@/lib/prefetchImage';
import { prefetchAppRatings } from '@/lib/ratingCache';
import { useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

/** Home grid card: teaser only; outcome, role, stack, and CTAs live on the project detail page. */

interface ProjectCardProps {
  project: PortfolioGridProject;
  index: number;
  /** Portfolio grid is visible, avoids hiding card previews behind opacity-0 entrance state. */
  revealed?: boolean;
}

const categoryIcons = {
  web: Code2,
  mobile: Smartphone,
  ai: Brain,
};

const categoryLabels = {
  web: 'Web',
  mobile: 'Mobile',
  ai: 'AI',
};

export const ProjectCard = ({ project, index, revealed = true }: ProjectCardProps) => {
  const navigate = useNavigate();
  const navigatePath = `/project/${project.id}`;
  const Icon = categoryIcons[project.category];
  const isMobile = useIsMobile();
  const tiltRef = use3DTilt({ maxTilt: isMobile ? 0 : 5, scale: isMobile ? 1 : 1.02 });
  const [viewportRef, isNear, isInView] = useNearViewport({
    nearMargin: isMobile ? '280px 0px 360px 0px' : '360px 0px 480px 0px',
    visibleMargin: isMobile ? '40px 0px 80px 0px' : '100px 0px 240px 0px',
    visibleThreshold: 0.05,
  });
  const shouldPreload = revealed && isNear;

  const combinedRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (!isMobile) tiltRef.current = node;
      viewportRef.current = node;
    },
    [isMobile, tiltRef, viewportRef],
  );

  const sliderImages = useMemo(
    () => getProjectSliderImages(project.id, project.imageUrl),
    [project.id, project.imageUrl],
  );
  const sliderSources = useMemo(
    () => getProjectSliderSources(project.id, project.imageUrl),
    [project.id, project.imageUrl],
  );
  const storeLinks = useMemo(() => getStoreLinksForProject(project), [project]);
  const hasVisual = sliderImages.length > 0 && sliderImages[0] !== '/placeholder.svg';
  const hasMultipleImages = sliderImages.length > 1;

  useEffect(() => {
    if (!shouldPreload) return;
    const limit = hasMultipleImages ? 2 : 1;
    const slice = sliderSources.slice(0, limit);
    void prefetchSlideProgressive(
      slice.map(getLowResSrc),
      isInView ? slice.map((s) => getHighResSrc(s, 'card')) : [],
      limit,
    );
    if (storeLinks.length > 0) {
      void prefetchAppRatings(storeLinks);
    }
  }, [shouldPreload, isInView, sliderSources, hasMultipleImages, storeLinks]);

  const shouldAnimate = revealed && (isMobile || isInView);

  const animationClass = useMemo(() => {
    if (!revealed) return 'opacity-0 pointer-events-none';
    if (!shouldAnimate) return 'opacity-100';
    if (isMobile) return 'animate-portfolio-card-mobile';
    return 'animate-portfolio-card';
  }, [revealed, shouldAnimate, isMobile]);

  const animationDelay = shouldAnimate
    ? isMobile
      ? Math.min(index, 10) * 0.055
      : (index % 6) * 0.1
    : 0;

  const openProject = useCallback(() => {
    navigate(navigatePath);
  }, [navigate, navigatePath]);

  return (
    <article
      ref={combinedRef}
      className={cn(
        'portfolio-grid-card group relative glass-card rounded-2xl overflow-hidden shadow-4d flex flex-col',
        !isMobile && 'perspective-4d transform-3d hover:shadow-4d-hover',
        animationClass,
      )}
      style={{ animationDelay: `${animationDelay}s`, animationFillMode: 'forwards' }}
    >
      <div className="relative h-48 sm:h-52 overflow-hidden bg-secondary shrink-0 isolate [transform:translateZ(0)]">
        {hasVisual ? (
          <ProjectImageSlider
            images={sliderImages}
            alt={`${project.title} preview`}
            priority={index < (isMobile ? 2 : 3)}
            preload={shouldPreload}
            interactive={hasMultipleImages}
            onOpenRequest={hasMultipleImages ? openProject : undefined}
          />
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-primary/12 to-primary/6 group-hover:opacity-90 transition-opacity duration-500" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Icon className="w-16 h-16 text-muted-foreground/30 group-hover:scale-110 transition-transform duration-500" aria-hidden />
            </div>
          </>
        )}
        {!hasMultipleImages && (
          <RouterNavButton
            to={navigatePath}
            className="absolute inset-0 z-[5] bg-transparent cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
            aria-label={`Open case study: ${project.title}`}
          />
        )}

        {project.featured && (
          <div className="pointer-events-none absolute top-3 right-3 z-[6] px-2.5 py-1 rounded-lg bg-primary text-primary-foreground text-[11px] font-semibold uppercase tracking-wide shadow-sm ring-1 ring-primary/30">
            Featured
          </div>
        )}
      </div>

      <div className="p-6 sm:p-8 flex flex-col flex-1">
        <div className="space-y-2 sm:space-y-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary/65">
            {categoryLabels[project.category]}
          </p>
          <h3 className="font-display text-lg sm:text-xl font-bold text-foreground leading-snug tracking-tight group-hover:text-primary transition-colors">
            <RouterNavButton
              to={navigatePath}
              className="inline text-left font-inherit p-0 m-0 border-0 bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded cursor-pointer hover:text-primary"
            >
              {project.title}
            </RouterNavButton>
          </h3>
          {storeLinks.length > 0 && (
            <div
              className={cn(
                'w-full min-w-0',
                storeLinks.length > 1 ? 'pt-2 pb-1 min-h-[88px] md:min-h-[52px]' : 'pt-1.5 pb-0.5 min-h-[52px]',
              )}
            >
              <AppStoreRating
                storeLinks={storeLinks}
                variant="compact"
                prefetch={shouldPreload}
                enabled={shouldPreload}
              />
            </div>
          )}
          <p className="text-foreground/65 text-sm leading-relaxed line-clamp-3">{project.description}</p>
        </div>
      </div>

      {!isMobile && (
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none transform-3d">
          <div className="absolute inset-0 rounded-2xl ring-1 ring-primary/20" />
        </div>
      )}
    </article>
  );
};
