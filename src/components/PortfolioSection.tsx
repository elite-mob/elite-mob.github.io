import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import type { ProjectCategory } from '@/data/portfolioData';
import { getPortfolioDisplayIndex } from '@/data/portfolioDisplayOrder';
import { portfolioGridProjects } from '@/data/portfolioGrid';
import { getProjectSliderSources } from '@/lib/portfolioGallery';
import { getHighResSrc, getLowResSrc } from '@/lib/portfolioImageVariants';
import { getStoreLinksForProject } from '@/lib/appStoreRating';
import { prefetchAppRatings } from '@/lib/ratingCache';
import { prefetchSlideProgressive } from '@/lib/prefetchImage';
import { ProjectCard } from './ProjectCard';
import { Button } from '@/components/ui/button';
import { Code2, Smartphone, Brain, Layers, Star } from 'lucide-react';
import { SectionBackdrop } from '@/components/SectionBackdrop';
import { SectionHeader } from '@/components/SectionHeader';
import { useIntersectionObserver } from '@/hooks/use-intersection-observer';

type FilterType = 'all' | 'featured' | ProjectCategory;

const filters: { value: FilterType; label: string; icon: React.ElementType }[] = [
  { value: 'all', label: 'All Projects', icon: Layers },
  { value: 'featured', label: 'Featured', icon: Star },
  { value: 'web', label: 'Web', icon: Code2 },
  { value: 'mobile', label: 'Mobile', icon: Smartphone },
  { value: 'ai', label: 'AI', icon: Brain },
];

export const PortfolioSection = () => {
  // Restore category from localStorage or default to 'featured'
  const [activeFilter, setActiveFilter] = useState<FilterType>(() => {
    const savedCategory = localStorage.getItem('portfolioCategory') as FilterType;
    return savedCategory && ['all', 'featured', 'web', 'mobile', 'ai'].includes(savedCategory) ? savedCategory : 'featured';
  });
  const [sectionRef, isSectionVisible] = useIntersectionObserver({ threshold: 0.05, rootMargin: '100px' });
  const [showFilters, setShowFilters] = useState(() => window.location.hash === '#portfolio');
  const [showPortfolioItems, setShowPortfolioItems] = useState(() => window.location.hash === '#portfolio');
  const hasRevealedContentRef = useRef(showFilters || showPortfolioItems);

  const revealPortfolioContent = useCallback(() => {
    hasRevealedContentRef.current = true;
    setShowFilters(true);
    setShowPortfolioItems(true);
  }, []);

  // Update localStorage when filter changes
  useEffect(() => {
    localStorage.setItem('portfolioCategory', activeFilter);
  }, [activeFilter]);

  // Listen for category changes from navigation
  useEffect(() => {
    const handleFilterChange = (event: CustomEvent) => {
      const category = event.detail?.category;
      if (category && ['all', 'featured', 'web', 'mobile', 'ai'].includes(category)) {
        setActiveFilter(category as FilterType);
      }
    };

    const handleShowContent = () => {
      revealPortfolioContent();
    };

    const handleHashChange = () => {
      if (window.location.hash === '#portfolio') {
        revealPortfolioContent();
      }
    };

    window.addEventListener('portfolioFilterChange', handleFilterChange as EventListener);
    window.addEventListener('portfolioShowContent', handleShowContent);
    window.addEventListener('hashchange', handleHashChange);

    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    if (categoryParam && ['all', 'featured', 'web', 'mobile', 'ai'].includes(categoryParam)) {
      setActiveFilter(categoryParam as FilterType);
    }

    handleHashChange();

    return () => {
      window.removeEventListener('portfolioFilterChange', handleFilterChange as EventListener);
      window.removeEventListener('portfolioShowContent', handleShowContent);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [revealPortfolioContent]);

  // Featured first, then curated display order (scale → trust → breadth)
  const allProjects = [...portfolioGridProjects].sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    const ia = getPortfolioDisplayIndex(a.id);
    const ib = getPortfolioDisplayIndex(b.id);
    if (ia !== ib) return ia - ib;
    return a.id.localeCompare(b.id);
  });
  
  const filteredProjects =
    activeFilter === 'all'
      ? allProjects
      : activeFilter === 'featured'
      ? allProjects.filter((p) => p.featured === true)
      : allProjects.filter((p) => p.category === activeFilter);

  const filterAnnouncement = useMemo(() => {
    const label = filters.find((f) => f.value === activeFilter)?.label ?? 'All Projects';
    const n = filteredProjects.length;
    return `Showing ${n} project${n === 1 ? '' : 's'}. Filter: ${label}.`;
  }, [activeFilter, filteredProjects.length]);

  // Reveal on scroll for passive visitors; programmatic nav pre-expands via portfolioShowContent.
  useEffect(() => {
    if (hasRevealedContentRef.current) return;

    const isNavigatingToPortfolio = window.location.hash === '#portfolio';
    const isMobile = window.matchMedia('(max-width: 767px)').matches;

    if (isSectionVisible || isNavigatingToPortfolio) {
      const filterDelay = isNavigatingToPortfolio ? 40 : isMobile ? 50 : 120;
      const itemsDelay = isNavigatingToPortfolio ? 80 : isMobile ? 120 : 280;

      const timer1 = setTimeout(() => {
        setShowFilters(true);
      }, filterDelay);

      const timer2 = setTimeout(() => {
        hasRevealedContentRef.current = true;
        setShowPortfolioItems(true);
      }, itemsDelay);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [isSectionVisible]);

  // Warm the first screen of cards before staggered entrance finishes.
  useEffect(() => {
    if (!showPortfolioItems) return;

    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    const warmCount = isMobile ? 6 : 9;

    filteredProjects.slice(0, warmCount).forEach((project) => {
      const sources = getProjectSliderSources(project.id, project.imageUrl);
      const limit = sources.length > 1 ? 2 : 1;
      const slice = sources.slice(0, limit);
      void prefetchSlideProgressive(
        slice.map(getLowResSrc),
        slice.map((s) => getHighResSrc(s, 'card')),
        limit,
      );
      const storeLinks = getStoreLinksForProject(project);
      if (storeLinks.length > 0) {
        void prefetchAppRatings(storeLinks);
      }
    });
  }, [showPortfolioItems, filteredProjects]);

  // Fallback: Show content after a delay even if intersection observer doesn't trigger (for mobile)
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      if (!isSectionVisible && !showFilters) {
        setShowFilters(true);
        setTimeout(() => setShowPortfolioItems(true), 600);
      }
    }, 2000);
    
    return () => clearTimeout(fallbackTimer);
  }, [isSectionVisible, showFilters]);

  return (
    <section
      id="portfolio"
      aria-labelledby="portfolio-heading"
      className="py-20 md:py-28 relative overflow-hidden min-h-[50vh] scroll-mt-24"
      ref={sectionRef}
    >
      <SectionBackdrop variant="elevated" grid />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
          {filterAnnouncement}
        </div>
        <SectionHeader
          id="portfolio-heading"
          eyebrow="PORTFOLIO"
          title={
            <>
              Case <span className="gradient-text-transparent">studies</span>
            </>
          }
          description="Shipped work with roles, stacks, and outcomes. Filter by type, then open a card for the full story."
          visible={isSectionVisible || showFilters}
        />

        {/* Filter Buttons - Enhanced with better interactions */}
        <div
          className={`flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4 mb-8 sm:mb-12 md:mb-16 px-4 transition-opacity duration-300 md:duration-500 ${
            showFilters ? 'opacity-100 max-md:animate-fade-in-up md:animate-fade-in-up md:stagger-delay-4' : 'opacity-0'
          }`}
        >
          {filters.map(({ value, label, icon: Icon }, index) => {
            const isActive = activeFilter === value;
            const count = 
              value === 'all' 
                ? allProjects.length 
                : value === 'featured'
                ? allProjects.filter((p) => p.featured === true).length
                : allProjects.filter((p) => p.category === value).length;
            const delayClass = index === 0 ? 'stagger-delay-1' : index === 1 ? 'stagger-delay-2' : index === 2 ? 'stagger-delay-3' : index === 3 ? 'stagger-delay-4' : 'stagger-delay-5';
            return isActive ? (
              <button
                key={value}
                onClick={() => setActiveFilter(value)}
                data-active-filter={value}
                className={`inline-flex items-center justify-center gap-1.5 sm:gap-2 min-h-[44px] h-11 sm:h-12 rounded-lg px-3 sm:px-4 md:px-6 text-xs sm:text-sm md:text-base font-semibold shadow-md scale-105 border-2 border-primary/50 hover:border-primary/70 text-foreground glass-card transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background group active:scale-95 ${
                  showFilters ? `animate-filter-button ${delayClass}` : 'opacity-0'
                }`}
                aria-pressed={true}
                aria-label={`Filter by ${label}`}
              >
                <Icon className="w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-300 scale-110" />
                <span className="hidden sm:inline">{label}</span>
                <span className="sm:hidden">{label.split(' ')[0]}</span>
                <span className="ml-0.5 sm:ml-1 px-1 sm:px-1.5 md:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-primary/20 text-primary scale-110 transition-all duration-300">
                  {count}
                </span>
              </button>
            ) : (
              <Button
                key={value}
                variant="glass"
                size="lg"
                onClick={() => setActiveFilter(value)}
                className={`gap-1.5 sm:gap-2 min-h-[44px] h-11 sm:h-12 px-3 sm:px-4 md:px-6 text-xs sm:text-sm md:text-base transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background hover:scale-105 hover:border-primary/30 border border-transparent hover:shadow-lg active:scale-95 ${
                  showFilters ? `animate-filter-button ${delayClass}` : 'opacity-0'
                }`}
                aria-pressed={false}
                aria-label={`Filter by ${label}`}
              >
                <Icon className="w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-300 group-hover:scale-110" />
                <span className="hidden sm:inline">{label}</span>
                <span className="sm:hidden">{label.split(' ')[0]}</span>
                <span className="ml-0.5 sm:ml-1 px-1 sm:px-1.5 md:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold transition-all duration-300 bg-secondary text-foreground/70 group-hover:bg-primary/10 group-hover:text-primary">
                  {count}
                </span>
              </Button>
            );
          })}
        </div>

        {/* Projects Grid - Cards animate on scroll after filters */}
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 md:gap-7 transition-opacity duration-300 md:duration-500 ${
            showPortfolioItems ? 'opacity-100' : 'opacity-0 max-md:pointer-events-none'
          }`}
          aria-label="Portfolio projects"
        >
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project, index) => (
              <ProjectCard
                key={`${activeFilter}-${project.id}`}
                project={project}
                index={index}
                revealed={showPortfolioItems}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-foreground/72">Nothing in this filter. Try another or browse all.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
