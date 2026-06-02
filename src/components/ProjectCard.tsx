import { Project } from '@/data/portfolioData';
import { RouterNavButton } from '@/components/RouterNavButton';
import { ProjectImageSlider } from '@/components/ProjectImageSlider';
import { AppStoreRating } from '@/components/AppStoreRating';
import { getProjectSliderImages } from '@/lib/portfolioGallery';
import { getStoreLinksForProject } from '@/lib/appStoreRating';
import { logProjectCardClick } from '@/integrations/firebase/analytics';
import { Code2, Smartphone, Brain } from 'lucide-react';
import { use3DTilt } from '@/hooks/use-3d-tilt';
import { useIntersectionObserver } from '@/hooks/use-intersection-observer';
import { useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';

/** Home grid card: teaser only; outcome, role, stack, and CTAs live on the project detail page. */

interface ProjectCardProps {
  project: Project;
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
  const navigatePath = `/project/${project.id}`;
  const Icon = categoryIcons[project.category];
  const tiltRef = use3DTilt({ maxTilt: 5, scale: 1.02 });
  const [observerRef, isInView] = useIntersectionObserver({
    threshold: 0.05,
    rootMargin: '120px 0px 280px 0px',
  });
  const isVisible = revealed && isInView;

  const combinedRef = useCallback(
    (node: HTMLDivElement | null) => {
      tiltRef.current = node;
      observerRef.current = node;
    },
    [tiltRef, observerRef],
  );

  const getAnimationClass = () => {
    if (!revealed) return 'opacity-0 pointer-events-none';
    // Show previews as soon as the grid is revealed; animate only when scrolled into view.
    if (!isInView) return 'opacity-100';
    const animationType = index % 3;
    if (animationType === 0) return 'animate-portfolio-card';
    if (animationType === 1) return 'animate-portfolio-card-stagger';
    return 'animate-portfolio-card-cascade';
  };

  const animationDelay = isInView ? (index % 6) * 0.1 : 0;

  const logNavigate = () => {
    void logProjectCardClick({
      project_id: project.id,
      project_title: project.title,
      category: project.category,
    });
  };

  const sliderImages = useMemo(
    () => getProjectSliderImages(project.id, project.imageUrl),
    [project.id, project.imageUrl],
  );
  const storeLinks = useMemo(() => getStoreLinksForProject(project), [project]);
  const hasVisual = sliderImages.length > 0 && sliderImages[0] !== '/placeholder.svg';

  return (
    <article
      ref={combinedRef}
      className={`group relative glass-card rounded-2xl overflow-hidden perspective-4d transform-3d shadow-4d hover:shadow-4d-hover ${getAnimationClass()} flex flex-col`}
      style={{ animationDelay: `${animationDelay}s`, animationFillMode: 'forwards' }}
    >
      <div className="relative h-48 sm:h-52 overflow-hidden bg-secondary shrink-0 isolate [transform:translateZ(0)]">
        {hasVisual ? (
          <ProjectImageSlider
            images={sliderImages}
            alt={`${project.title} preview`}
            priority
          />
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-primary/12 to-primary/6 group-hover:opacity-90 transition-opacity duration-500" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Icon className="w-16 h-16 text-muted-foreground/30 group-hover:scale-110 transition-transform duration-500" aria-hidden />
            </div>
          </>
        )}
        <RouterNavButton
          to={navigatePath}
          onClick={logNavigate}
          className="absolute inset-0 z-[5] bg-transparent cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
          aria-label={`Open case study: ${project.title}`}
        />

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
              onClick={logNavigate}
              className="inline text-left font-inherit p-0 m-0 border-0 bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded cursor-pointer hover:text-primary"
            >
              {project.title}
            </RouterNavButton>
          </h3>
          {storeLinks.length > 0 && (
            <div
              className={cn(
                'w-full min-w-0',
                storeLinks.length > 1 ? 'pt-2 pb-1' : 'pt-1.5 pb-0.5',
              )}
            >
              <AppStoreRating storeLinks={storeLinks} variant="compact" enabled={isVisible} />
            </div>
          )}
          <p className="text-foreground/65 text-sm leading-relaxed line-clamp-3">{project.description}</p>
        </div>
      </div>

      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none transform-3d">
        <div className="absolute inset-0 rounded-2xl ring-1 ring-primary/20" />
      </div>
    </article>
  );
};
