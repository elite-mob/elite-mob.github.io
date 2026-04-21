import { useState, useEffect, useMemo } from 'react';
import { projects, ProjectCategory, getPortfolioDisplayIndex } from '@/data/portfolioData';
import { ProjectCard } from './ProjectCard';
import { Button } from '@/components/ui/button';
import { Code2, Smartphone, Brain, Layers, Sparkles, TrendingUp, Star } from 'lucide-react';
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
      // Force show content when navigating back to portfolio
      setShowFilters(true);
      setTimeout(() => {
        setShowPortfolioItems(true);
      }, 100);
    };

    window.addEventListener('portfolioFilterChange', handleFilterChange as EventListener);
    window.addEventListener('portfolioShowContent', handleShowContent);
    
    // Check URL params on mount
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    if (categoryParam && ['all', 'featured', 'web', 'mobile', 'ai'].includes(categoryParam)) {
      setActiveFilter(categoryParam as FilterType);
    }

    // Check if we're navigating to portfolio section (hash in URL)
    if (window.location.hash === '#portfolio') {
      // Delay to ensure component is mounted
      setTimeout(() => {
        handleShowContent();
      }, 50);
    }

    return () => {
      window.removeEventListener('portfolioFilterChange', handleFilterChange as EventListener);
      window.removeEventListener('portfolioShowContent', handleShowContent);
    };
  }, []);

  // Also listen for hash changes and check on mount
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#portfolio') {
        setShowFilters(true);
        setTimeout(() => {
          setShowPortfolioItems(true);
        }, 100);
      }
    };

    // Check on mount if we're at portfolio section
    if (window.location.hash === '#portfolio') {
      setShowFilters(true);
      setTimeout(() => {
        setShowPortfolioItems(true);
      }, 100);
    }

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Featured first, then curated display order (scale → trust → breadth)
  const allProjects = [...projects].sort((a, b) => {
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

  // Show filters after header animation, then portfolio items after filters
  useEffect(() => {
    // Check if we're navigating to portfolio (hash in URL) - show immediately
    const isNavigatingToPortfolio = window.location.hash === '#portfolio';
    
    if (isSectionVisible || isNavigatingToPortfolio) {
      // Show filters after header (shorter delay on mobile)
      const timer1 = setTimeout(() => {
        setShowFilters(true);
      }, isNavigatingToPortfolio ? 50 : 400);
      
      // Show portfolio items after filters have animated
      const timer2 = setTimeout(() => {
        setShowPortfolioItems(true);
      }, isNavigatingToPortfolio ? 200 : 1000);
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    } else {
      // Only hide if we're not navigating to portfolio
      if (!isNavigatingToPortfolio) {
        setShowFilters(false);
        setShowPortfolioItems(false);
      }
    }
  }, [isSectionVisible]);

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

  // Reset portfolio items visibility when filter changes
  useEffect(() => {
    if (showPortfolioItems) {
      setShowPortfolioItems(false);
      const timer = setTimeout(() => {
        setShowPortfolioItems(true);
      }, 100);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilter]);

  return (
    <section
      id="portfolio"
      aria-labelledby="portfolio-heading"
      className="py-20 md:py-28 relative overflow-hidden min-h-[50vh]"
      ref={sectionRef}
    >
      <div className="absolute inset-0 z-0 bg-section-elevated" aria-hidden />
      <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden" aria-hidden>
        <div
          className="absolute left-1/2 top-[34%] h-[min(58vh,30rem)] w-[min(104vw,56rem)] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[72px] sm:blur-[90px]"
          style={{
            background:
              'radial-gradient(circle at center, hsl(187 52% 50% / 0.07) 0%, hsl(187 52% 50% / 0.02) 42%, transparent 62%)',
          }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
          {filterAnnouncement}
        </div>
        {/* Section Header - Enhanced */}
        <div className={`text-center mb-10 sm:mb-12 md:mb-14 relative ${
          isSectionVisible || showFilters ? 'animate-fade-in-up' : 'opacity-0'
        }`}>
          <h2
            id="portfolio-heading"
            className={`font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground mb-3 sm:mb-4 md:mb-6 px-4 ${
              isSectionVisible || showFilters ? 'animate-text-reveal stagger-delay-1' : 'opacity-0'
            }`}
          >
            Case <span className="gradient-text-transparent">Studies</span>
          </h2>
          <p
            className={`text-sm sm:text-base md:text-lg text-foreground/90 max-w-3xl mx-auto leading-relaxed px-4 mb-6 sm:mb-8 md:mb-9 ${
              isSectionVisible || showFilters ? 'animate-fade-in-up stagger-delay-2' : 'opacity-0'
            }`}
          >
            Shipped work with roles, stacks, and outcomes: filter by featured, web, mobile, or AI, then open a card for the full story.
          </p>
        </div>

        {/* Filter Buttons - Enhanced with better interactions */}
        <div className={`flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4 mb-8 sm:mb-12 md:mb-16 px-4 transition-opacity duration-500 ${
          showFilters ? 'animate-fade-in-up stagger-delay-4 opacity-100' : 'opacity-0'
        }`}>
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
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 md:gap-7 transition-opacity duration-500 ${
          showPortfolioItems ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`} aria-label="Portfolio projects">
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project, index) => (
              <ProjectCard 
                key={project.id} 
                project={project} 
                index={index}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-foreground/72">Nothing in this filter. Try another or browse all.</p>
            </div>
          )}
        </div>

        {/* Stats: light inline strip; subtle hover */}
        <div
          className={`grid grid-cols-2 md:grid-cols-4 gap-5 sm:gap-6 md:gap-8 lg:gap-10 mt-16 sm:mt-20 md:mt-24 relative ${
            isSectionVisible ? 'animate-fade-in-up stagger-delay-6' : 'opacity-0'
          }`}
        >
          {[
            { value: '100+', label: 'Projects Delivered', icon: Layers },
            { value: '200+', label: 'Clients Served', icon: Sparkles },
            { value: '10+', label: 'Years Experience', icon: TrendingUp },
            { value: '99%', label: 'Client Satisfaction', icon: Brain },
          ].map((stat, index) => {
            const Icon = stat.icon;
            const delayClass = index === 0 ? 'stagger-delay-1' : index === 1 ? 'stagger-delay-2' : index === 2 ? 'stagger-delay-3' : 'stagger-delay-4';
            return (
              <div
                key={stat.label}
                className={`group relative text-center rounded-xl sm:rounded-2xl border border-border/70 glass-card shadow-sm px-3 py-5 sm:px-4 sm:py-6 md:py-7 transition-colors duration-300 hover:border-border hover:shadow-md ${
                  isSectionVisible ? `animate-fade-in-scale ${delayClass}` : 'opacity-0'
                }`}
              >
                <div className="relative z-10 flex flex-col items-center gap-2 sm:gap-2.5 md:gap-3">
                  <div className="inline-flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-primary/[0.08] text-primary ring-1 ring-primary/10 transition-transform duration-300 group-hover:scale-[1.03]">
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden />
                  </div>
                  <div className="font-display text-2xl sm:text-3xl md:text-4xl font-bold gradient-text-transparent leading-none tracking-tight">
                    {stat.value}
                  </div>
                  <div className="text-foreground/74 text-[11px] sm:text-xs font-medium leading-snug max-w-[11rem] mx-auto">
                    {stat.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
