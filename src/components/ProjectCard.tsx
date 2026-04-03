import { Project } from '@/data/portfolioData';
import { RouterNavButton } from '@/components/RouterNavButton';
import { logProjectCardClick } from '@/integrations/firebase/analytics';
import { Code2, Smartphone, Brain } from 'lucide-react';
import { use3DTilt } from '@/hooks/use-3d-tilt';
import { useIntersectionObserver } from '@/hooks/use-intersection-observer';
import { useCallback } from 'react';

/** Home grid card: teaser only; outcome, role, stack, and CTAs live on the project detail page. */

interface ProjectCardProps {
  project: Project;
  index: number;
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

export const ProjectCard = ({ project, index }: ProjectCardProps) => {
  const navigatePath = `/project/${project.id}`;
  const Icon = categoryIcons[project.category];
  const tiltRef = use3DTilt({ maxTilt: 5, scale: 1.02 });
  const [observerRef, isVisible] = useIntersectionObserver({ threshold: 0.1, rootMargin: '50px' });

  const combinedRef = useCallback(
    (node: HTMLDivElement | null) => {
      tiltRef.current = node;
      observerRef.current = node;
    },
    [tiltRef, observerRef],
  );

  const getAnimationClass = () => {
    if (!isVisible) return 'opacity-0';
    const animationType = index % 3;
    if (animationType === 0) return 'animate-portfolio-card';
    if (animationType === 1) return 'animate-portfolio-card-stagger';
    return 'animate-portfolio-card-cascade';
  };

  const animationDelay = isVisible ? (index % 6) * 0.1 : 0;

  const logNavigate = () => {
    void logProjectCardClick({
      project_id: project.id,
      project_title: project.title,
      category: project.category,
    });
  };

  return (
    <article
      ref={combinedRef}
      className={`group relative glass-card rounded-2xl overflow-hidden perspective-4d transform-3d shadow-4d hover:shadow-4d-hover ${getAnimationClass()} flex flex-col`}
      style={{ animationDelay: `${animationDelay}s`, animationFillMode: 'forwards' }}
    >
      <div className="relative h-48 sm:h-52 overflow-hidden bg-secondary shrink-0">
        <RouterNavButton
          to={navigatePath}
          onClick={logNavigate}
          className="absolute inset-0 z-[1] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
          aria-label={`Open case study: ${project.title}`}
        >
          {project.imageUrl && project.imageUrl !== '/placeholder.svg' ? (
            <img
              src={project.imageUrl}
              alt=""
              sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
              loading={index < 6 ? 'eager' : 'lazy'}
              decoding="async"
              fetchPriority={index < 6 ? 'high' : undefined}
              draggable={false}
              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 select-none"
              onContextMenu={(e) => e.preventDefault()}
              onDragStart={(e) => e.preventDefault()}
            />
          ) : (
            <>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/12 to-primary/6 group-hover:opacity-90 transition-opacity duration-500" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Icon className="w-16 h-16 text-muted-foreground/30 group-hover:scale-110 transition-transform duration-500" aria-hidden />
              </div>
            </>
          )}
        </RouterNavButton>

        {project.featured && (
          <div className="absolute top-3 right-3 z-[2] px-2.5 py-1 rounded-lg bg-accent text-accent-foreground text-[11px] font-semibold uppercase tracking-wide shadow-sm">
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
          <p className="text-foreground/65 text-sm leading-relaxed line-clamp-3">{project.description}</p>
        </div>
      </div>

      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none transform-3d">
        <div className="absolute inset-0 rounded-2xl ring-1 ring-primary/20" />
      </div>
    </article>
  );
};
