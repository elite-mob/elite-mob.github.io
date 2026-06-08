import { useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { RouterNavButton } from '@/components/RouterNavButton';
import { ProjectImageSlider } from '@/components/ProjectImageSlider';
import { projects, type Project } from '@/data/portfolioData';
import { getPortfolioDisplayIndex } from '@/data/portfolioDisplayOrder';
import { getProjectSliderImages } from '@/lib/portfolioGallery';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronRight, ExternalLink, Code2, Smartphone, Brain, Calendar, User, Layers, Target, Lightbulb, CheckCircle2, Sparkles, Zap } from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { useIntersectionObserver } from '@/hooks/use-intersection-observer';
import { navigateToPortfolio } from '@/lib/navigation';
import { Seo } from '@/components/Seo';
import { JsonLdProject, JsonLdBreadcrumbList } from '@/components/JsonLd';
import { AppStoreRating } from '@/components/AppStoreRating';
import { getStoreLinksForProject, projectHasStoreRating } from '@/lib/appStoreRating';
import { absoluteUrl, pageTitle, SITE_URL } from '@/lib/site';
import { cn } from '@/lib/utils';

const categoryIcons = {
  web: Code2,
  mobile: Smartphone,
  ai: Brain,
};

const categoryLabels = {
  web: 'Web Development',
  mobile: 'Mobile Development',
  ai: 'AI & Machine Learning',
};

function truncateCaseStudyText(text: string, max: number) {
  if (text.length <= max) return text;
  return `${text.slice(0, Math.max(0, max - 1))}…`;
}

/** Problem → role → stack → outcome when `outcomeHighlight` is set in portfolioData */
function CaseStudyAtAGlance({ project }: { project: Project }) {
  if (!project.outcomeHighlight) return null;

  const problem = project.challenge
    ? truncateCaseStudyText(project.challenge, 240)
    : truncateCaseStudyText(project.description, 240);
  const outcome = project.outcomeHighlight;
  const stack = project.technologies.slice(0, 10).join(' · ');
  const roleLine = [project.role, project.duration].filter(Boolean).join(' · ') || '-';

  return (
    <section
      aria-labelledby="case-study-at-a-glance-heading"
      className="container mx-auto px-4 sm:px-6 mb-8 sm:mb-10 md:mb-12"
    >
      <div className="glass-card rounded-2xl sm:rounded-3xl border border-primary/25 shadow-4d p-5 sm:p-6 md:p-8 bg-gradient-to-br from-primary/[0.04] to-transparent">
        <div className="flex items-center gap-2 mb-4 sm:mb-5">
          <Target className="w-5 h-5 text-primary shrink-0" aria-hidden />
          <h2
            id="case-study-at-a-glance-heading"
            className="font-display text-lg sm:text-xl md:text-2xl font-bold text-foreground/90"
          >
            Case study at a glance
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          <div data-allow-select>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-primary/90 mb-2">Problem</h3>
            <p className="text-sm text-foreground/80 leading-relaxed">{problem}</p>
          </div>
          <div data-allow-select>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-primary/90 mb-2">Role &amp; timeline</h3>
            <p className="text-sm text-foreground/80 leading-relaxed">{roleLine}</p>
          </div>
          <div data-allow-select>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-primary/90 mb-2">Stack</h3>
            <p className="text-sm text-foreground/80 leading-relaxed">{stack}</p>
          </div>
          <div data-allow-select>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-primary/90 mb-2">Outcome</h3>
            <p className="text-sm text-foreground/80 leading-relaxed">{outcome}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const project = projects.find((p) => p.id === id);
  const navigate = useNavigate();

  // Use the category the user had selected in portfolio (so Back returns to same filter)
  const getReturnCategory = () => {
    return localStorage.getItem('portfolioCategory') || 'featured';
  };

  // Intersection observers for different sections
  const [backButtonRef, isBackButtonVisible] = useIntersectionObserver({ threshold: 0.1 });
  const [heroImageRef, isHeroImageVisible] = useIntersectionObserver({ threshold: 0.1 });
  const [heroInfoRef, isHeroInfoVisible] = useIntersectionObserver({ threshold: 0.1 });
  const [technologiesRef, isTechnologiesVisible] = useIntersectionObserver({ threshold: 0.1 });
  const [challengeRef, isChallengeVisible] = useIntersectionObserver({ threshold: 0.1 });
  const [solutionRef, isSolutionVisible] = useIntersectionObserver({ threshold: 0.1 });
  const [featuresRef, isFeaturesVisible] = useIntersectionObserver({ threshold: 0.1 });
  const [relatedRef, isRelatedVisible] = useIntersectionObserver({ threshold: 0.1 });

  // Scroll to top when component mounts or project ID changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const sliderImages = useMemo(() => {
    if (!project) return [];
    return getProjectSliderImages(project.id, project.imageUrl);
  }, [project]);

  const storeLinks = useMemo(() => {
    if (!project) return [];
    return getStoreLinksForProject(project);
  }, [project]);

  if (!project) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <Seo
          title={pageTitle('Project not found')}
          description="The project you are looking for is not in this portfolio."
          noindex
        />
        <Navigation />
        <main
          id="main-content"
          tabIndex={-1}
          className="min-h-screen flex items-center justify-center pt-24 pb-16 outline-none"
        >
          <div className="text-center glass-card p-12 sm:p-16 rounded-3xl border border-primary/20 transform-3d shadow-4d max-w-2xl mx-auto">
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground/85 mb-4 drop-shadow-lg">Project Not Found</h1>
            <p className="text-foreground/75 mb-8 text-base sm:text-lg drop-shadow-sm">The project you're looking for doesn't exist.</p>
            <Button 
              variant="hero" 
              size="lg" 
              className="gap-2"
              onClick={() => navigateToPortfolio(getReturnCategory(), navigate)}
            >
              Back to Portfolio
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const Icon = categoryIcons[project.category];
  const relatedProjects = projects
    .filter((p) => p.category === project.category && p.id !== project.id)
    .sort((a, b) => getPortfolioDisplayIndex(a.id) - getPortfolioDisplayIndex(b.id))
    .slice(0, 3);

  const pagePath = `/project/${project.id}`;
  const canonicalUrl = absoluteUrl(pagePath);
  const metaDescription =
    project.description.length > 165 ? `${project.description.slice(0, 162)}…` : project.description;
  const ogImageSrc =
    typeof project.imageUrl === 'string' ? project.imageUrl : String(project.imageUrl);

  const hasVisual = sliderImages.length > 0 && sliderImages[0] !== '/placeholder.svg';

  return (
    <div className="min-h-screen relative overflow-hidden">
      <Seo
        title={pageTitle(project.title)}
        description={metaDescription}
        image={ogImageSrc}
        imageAlt={`${project.title}: project preview`}
        canonicalPath={pagePath}
      />
      <JsonLdProject project={project} pageUrl={canonicalUrl} />
      <JsonLdBreadcrumbList
        items={[
          { name: 'Home', url: SITE_URL },
          { name: 'Portfolio', url: `${SITE_URL}/#portfolio` },
          { name: project.title, url: canonicalUrl },
        ]}
      />

      <Navigation />
      
      <main
        id="main-content"
        tabIndex={-1}
        className="pt-[calc(5rem+env(safe-area-inset-top,0px))] sm:pt-[calc(6rem+env(safe-area-inset-top,0px))] pb-12 sm:pb-16 relative z-10 outline-none"
      >
        {/* Breadcrumb + back */}
        <div className="container mx-auto px-4 sm:px-6 mb-6 sm:mb-8" ref={backButtonRef}>
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex flex-wrap items-center gap-1 sm:gap-1.5 text-xs sm:text-sm text-foreground/70">
              <li className="inline-flex min-h-[44px] items-center">
                <RouterNavButton
                  to="/"
                  className="hover:text-primary transition-colors rounded-md px-1 py-2 -mx-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  Home
                </RouterNavButton>
              </li>
              <li aria-hidden className="flex items-center text-foreground/35">
                <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </li>
              <li className="inline-flex min-h-[44px] items-center">
                <RouterNavButton
                  to="/#portfolio"
                  className="hover:text-primary transition-colors rounded-md px-1 py-2 -mx-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  Portfolio
                </RouterNavButton>
              </li>
              <li aria-hidden className="flex items-center text-foreground/35">
                <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </li>
              <li
                className="inline-flex min-h-[44px] max-w-[min(72vw,28rem)] items-center font-medium text-foreground/90 truncate"
                aria-current="page"
              >
                {project.title}
              </li>
            </ol>
          </nav>
          <button
            onClick={() => navigateToPortfolio(getReturnCategory(), navigate)}
            className={`inline-flex items-center gap-2 min-h-[44px] py-2 pr-2 pl-1 -ml-1 text-sm sm:text-base text-foreground/75 hover:text-primary transition-colors group drop-shadow-sm active:scale-95 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 ${
              isBackButtonVisible ? 'animate-fade-in-up' : 'opacity-0'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Portfolio
          </button>
        </div>

        <CaseStudyAtAGlance project={project} />

        {/* Hero Section */}
        <section className="container mx-auto px-4 sm:px-6 mb-10 sm:mb-12 md:mb-20">
          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12 items-center">
            {/* Project gallery, artwork + live link previews */}
            <div className={`relative group ${isHeroImageVisible ? 'animate-slide-in-left' : 'opacity-0'}`} ref={heroImageRef}>
              <div className="rounded-3xl overflow-hidden glass-card shadow-4d ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all duration-500 bg-secondary/30">
                <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] min-h-[220px] max-h-[min(70vh,720px)]">
                  {hasVisual ? (
                    <ProjectImageSlider
                      images={sliderImages}
                      alt={`${project.title} preview`}
                      priority
                      variant="hero"
                      objectFit="cover"
                    />
                  ) : (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Icon className="w-32 h-32 text-muted-foreground/20" aria-hidden />
                      </div>
                    </>
                  )}
                </div>
              </div>
              {project.featured && (
                <div className="absolute top-4 right-4 z-[4] px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold ring-1 ring-primary/30">
                  Featured
                </div>
              )}
            </div>

            {/* Project Info */}
            <div className={`space-y-4 sm:space-y-5 md:space-y-6 ${isHeroInfoVisible ? 'animate-slide-in-right' : 'opacity-0'}`} ref={heroInfoRef}>
              <div className={`flex items-center gap-2 sm:gap-3 ${isHeroInfoVisible ? 'animate-fade-in-up stagger-delay-1' : 'opacity-0'}`}>
                <span className="px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-gradient-to-r from-primary/20 to-primary/10 text-primary text-xs sm:text-sm font-semibold border border-primary/30">
                  {categoryLabels[project.category]}
                </span>
              </div>
              
              <h1 className={`font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground/85 leading-tight drop-shadow-lg ${
                isHeroInfoVisible ? 'animate-text-reveal stagger-delay-2' : 'opacity-0'
              }`}>
                <span className="gradient-text-transparent drop-shadow-lg">{project.title}</span>
              </h1>

              {storeLinks.length > 0 && (
                <div
                  className={cn(
                    'w-full',
                    isHeroInfoVisible ? 'animate-fade-in-up stagger-delay-2' : 'opacity-0',
                  )}
                >
                  <AppStoreRating storeLinks={storeLinks} variant="detail" className="w-full" />
                </div>
              )}
              
              {/* Enhanced Description */}
              <div className={`glass-card rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 border-l-4 border-primary transform-3d shadow-4d hover:shadow-4d-hover hover:translate-y-[-5px] hover:translate-z-20 transition-all duration-300 ${
                isHeroInfoVisible ? 'animate-fade-in-up stagger-delay-3' : 'opacity-0'
              }`}>
                <div className="flex items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-primary flex-shrink-0 mt-0.5" />
                  <h3 className="font-semibold text-foreground/85 text-sm sm:text-base md:text-lg drop-shadow-md">Project Overview</h3>
                </div>
                <p className="text-xs sm:text-sm md:text-base text-foreground/75 leading-relaxed pl-5 sm:pl-6 md:pl-8 drop-shadow-sm">
                  {project.description}
                </p>
              </div>

              <div className={`flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 ${isHeroInfoVisible ? 'animate-fade-in-up stagger-delay-4' : 'opacity-0'}`}>
                {project.link && (
                  <button
                    type="button"
                    onClick={() => window.open(project.link!, '_blank', 'noopener,noreferrer')}
                    className="inline-flex items-center justify-center gap-2 h-11 sm:h-12 rounded-lg px-5 sm:px-6 md:px-8 text-sm sm:text-base font-semibold shadow-4d hover:shadow-4d-hover transform-3d hover:translate-y-[-5px] hover:translate-z-20 transition-all duration-300 group backdrop-blur-sm border-2 border-primary/60 hover:border-primary/80 text-foreground/90 hover:text-foreground drop-shadow-lg bg-transparent hover:bg-transparent active:scale-95"
                    style={{ transformStyle: 'preserve-3d' }}
                    aria-label="View live project"
                  >
                    <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" style={{ transform: 'translateZ(10px)' }} />
                    <span style={{ transform: 'translateZ(10px)' }}>View Live Project</span>
                  </button>
                )}
              </div>

              {/* Duration / role / type: only when there is no case-study strip (avoids duplicating role, timeline, stack) */}
              {!project.outcomeHighlight && (
                <div className={`grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 ${isHeroInfoVisible ? 'animate-fade-in-up stagger-delay-5' : 'opacity-0'}`}>
                  <div className="p-2.5 sm:p-3 md:p-4 lg:p-5 rounded-lg sm:rounded-xl glass-card text-center hover:scale-105 transition-transform duration-300 border border-primary/10 hover:border-primary/30 active:scale-95">
                    <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-primary mx-auto mb-1 sm:mb-1.5 md:mb-2" />
                    <div className="text-[10px] sm:text-xs text-foreground/70 uppercase tracking-wide mb-0.5 sm:mb-1 drop-shadow-sm">Duration</div>
                    <div className="font-bold text-foreground/85 text-[10px] sm:text-xs md:text-sm break-words drop-shadow-md leading-tight">{project.duration || 'N/A'}</div>
                  </div>
                  <div className="p-2.5 sm:p-3 md:p-4 lg:p-5 rounded-lg sm:rounded-xl glass-card text-center hover:scale-105 transition-transform duration-300 border border-primary/10 hover:border-primary/30 active:scale-95">
                    <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-primary mx-auto mb-1 sm:mb-1.5 md:mb-2" />
                    <div className="text-[10px] sm:text-xs text-foreground/70 uppercase tracking-wide mb-0.5 sm:mb-1 drop-shadow-sm">Role</div>
                    <div className="font-bold text-foreground/85 text-[10px] sm:text-xs md:text-sm break-words drop-shadow-md leading-tight">{project.role || 'N/A'}</div>
                  </div>
                  <div className="p-2.5 sm:p-3 md:p-4 lg:p-5 rounded-lg sm:rounded-xl glass-card text-center hover:scale-105 transition-transform duration-300 border border-primary/10 hover:border-primary/30 active:scale-95">
                    <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-primary mx-auto mb-1 sm:mb-1.5 md:mb-2" />
                    <div className="text-[10px] sm:text-xs text-foreground/70 uppercase tracking-wide mb-0.5 sm:mb-1 drop-shadow-sm">Type</div>
                    <div className="font-bold text-foreground/85 text-[10px] sm:text-xs md:text-sm capitalize break-words drop-shadow-md leading-tight">{project.category}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Technologies Section - Enhanced with 3D effects */}
        <section className="container mx-auto px-4 sm:px-6 mb-10 sm:mb-12 md:mb-20 relative" ref={technologiesRef}>
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 rounded-xl sm:rounded-2xl md:rounded-3xl" />
          <div className={`relative glass-card rounded-xl sm:rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-10 border border-primary/20 hover:border-primary/40 transform-3d shadow-4d hover:shadow-4d-hover hover:translate-y-[-8px] hover:translate-z-30 transition-all duration-300 overflow-hidden group ${
            isTechnologiesVisible ? 'animate-fade-in-up' : 'opacity-0'
          }`}>
            <div className="absolute top-0 right-0 w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 bg-primary/5 rounded-full -mr-12 sm:-mr-14 md:-mr-16 -mt-12 sm:-mt-14 md:-mt-16 group-hover:scale-150 transition-transform duration-700" />
            <div className="relative z-10">
              <div className={`flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 md:mb-8 ${
                isTechnologiesVisible ? 'animate-fade-in-scale stagger-delay-1' : 'opacity-0'
              }`}>
                <div className="p-1.5 sm:p-2 md:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-primary" />
                </div>
                <h2 className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-foreground/85 drop-shadow-md">
                  Technologies <span className="gradient-text-transparent drop-shadow-md">Used</span>
                </h2>
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-4">
                {project.technologies.map((tech, index) => {
                  const delayClass = index < 6 ? `stagger-delay-${Math.min(index + 2, 8)}` : 'stagger-delay-1';
                  return (
                    <span
                      key={tech}
                      className={`group/tech px-2.5 sm:px-3 md:px-4 lg:px-5 py-1.5 sm:py-2 md:py-2.5 lg:py-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-secondary to-secondary/80 text-foreground/85 font-semibold hover:from-primary/20 hover:to-primary/10 hover:text-primary border border-primary/10 hover:border-primary/40 transition-all duration-300 hover:scale-110 hover:shadow-lg cursor-default text-xs sm:text-sm md:text-base drop-shadow-sm transform-3d hover:translate-y-[-3px] hover:translate-z-10 ${
                        isTechnologiesVisible ? `animate-fade-in-scale ${delayClass}` : 'opacity-0'
                      }`}
                    >
                      {tech}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Challenge & Solution Section - Enhanced */}
        {(project.challenge || project.solution) && (
          <section className="container mx-auto px-4 sm:px-6 mb-10 sm:mb-12 md:mb-20">
            <div className="grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
              {project.challenge && (
                <div className={`glass-card rounded-xl sm:rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-10 border-l-4 border-red-500/50 hover:border-red-500/80 transform-3d shadow-4d hover:shadow-4d-hover hover:translate-y-[-8px] hover:translate-z-30 transition-all duration-300 relative overflow-hidden group ${
                  isChallengeVisible ? 'animate-slide-in-left' : 'opacity-0'
                }`} ref={challengeRef}>
                  <div className="absolute top-0 right-0 w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 bg-red-500/5 rounded-full -mr-12 sm:-mr-14 md:-mr-16 -mt-12 sm:-mt-14 md:-mt-16 group-hover:scale-150 transition-transform duration-500" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4 md:mb-6">
                      <div className="p-1.5 sm:p-2 md:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-red-500/20 to-red-500/10 border border-red-500/30">
                        <Target className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-red-500" />
                      </div>
                      <h2 className="font-display text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-foreground/85 drop-shadow-md">
                        The <span className="text-red-500/90 drop-shadow-md">Challenge</span>
                      </h2>
                    </div>
                    <p className="text-xs sm:text-sm md:text-base text-foreground/75 leading-relaxed drop-shadow-sm">
                      {project.challenge}
                    </p>
                  </div>
                </div>
              )}
              {project.solution && (
                <div className={`glass-card rounded-xl sm:rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-10 border-l-4 border-green-500/50 hover:border-green-500/80 transform-3d shadow-4d hover:shadow-4d-hover hover:translate-y-[-8px] hover:translate-z-30 transition-all duration-300 relative overflow-hidden group ${
                  isSolutionVisible ? 'animate-slide-in-right' : 'opacity-0'
                }`} ref={solutionRef}>
                  <div className="absolute top-0 right-0 w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 bg-green-500/5 rounded-full -mr-12 sm:-mr-14 md:-mr-16 -mt-12 sm:-mt-14 md:-mt-16 group-hover:scale-150 transition-transform duration-500" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4 md:mb-6">
                      <div className="p-1.5 sm:p-2 md:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-green-500/20 to-green-500/10 border border-green-500/30">
                        <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-green-500" />
                      </div>
                      <h2 className="font-display text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-foreground/85 drop-shadow-md">
                        The <span className="text-green-500/90 drop-shadow-md">Solution</span>
                      </h2>
                    </div>
                    <p className="text-xs sm:text-sm md:text-base text-foreground/75 leading-relaxed drop-shadow-sm">
                      {project.solution}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Key Features Section - Enhanced */}
        {project.features && project.features.length > 0 && (
          <section className="container mx-auto px-4 sm:px-6 mb-10 sm:mb-12 md:mb-20 relative" ref={featuresRef}>
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-primary/5 rounded-xl sm:rounded-2xl md:rounded-3xl" />
            <div className={`relative glass-card rounded-xl sm:rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-10 border border-primary/20 transform-3d shadow-4d hover:shadow-4d-hover hover:translate-y-[-8px] hover:translate-z-30 transition-all duration-300 ${
              isFeaturesVisible ? 'animate-fade-in-up' : 'opacity-0'
            }`}>
              <div className={`flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 md:mb-8 lg:mb-10 ${
                isFeaturesVisible ? 'animate-fade-in-scale stagger-delay-1' : 'opacity-0'
              }`}>
                <div className="p-1.5 sm:p-2 md:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 border border-accent/30">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-accent" />
                </div>
                <h2 className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-foreground/85 drop-shadow-md">
                  Key <span className="gradient-text-transparent drop-shadow-md">Features</span>
                </h2>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
                {project.features.map((feature, index) => {
                  const delayClass = index < 6 ? `stagger-delay-${Math.min(index + 2, 8)}` : 'stagger-delay-1';
                  return (
                    <div
                      key={feature}
                      className={`group flex items-start gap-2 sm:gap-3 md:gap-4 p-3 sm:p-4 md:p-5 rounded-lg sm:rounded-xl bg-gradient-to-br from-secondary/80 to-secondary/50 border border-primary/10 hover:border-primary/40 hover:from-primary/10 hover:to-primary/5 transform-3d shadow-4d hover:shadow-4d-hover hover:translate-y-[-5px] hover:translate-z-20 transition-all duration-300 active:scale-95 ${
                        isFeaturesVisible ? `animate-fade-in-scale ${delayClass}` : 'opacity-0'
                      }`}
                    >
                      <div className="mt-0.5 sm:mt-1 p-1 sm:p-1.5 md:p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 group-hover:scale-110 transition-transform duration-300">
                        <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-primary" />
                      </div>
                      <span className="text-xs sm:text-sm md:text-base text-foreground/85 font-medium leading-relaxed flex-1 drop-shadow-sm">{feature}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Related Projects */}
        {relatedProjects.length > 0 && (
          <section className="container mx-auto px-4 sm:px-6" ref={relatedRef}>
            <h2 className={`font-display text-xl sm:text-2xl font-bold text-foreground/85 mb-6 sm:mb-8 drop-shadow-md ${
              isRelatedVisible ? 'animate-fade-in-up' : 'opacity-0'
            }`}>
              Related Projects
            </h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
              {relatedProjects.map((relatedProject, index) => {
                const RelatedIcon = categoryIcons[relatedProject.category];
                const relatedImages = getProjectSliderImages(relatedProject.id, relatedProject.imageUrl);
                const relatedHasVisual =
                  relatedImages.length > 0 && relatedImages[0] !== '/placeholder.svg';
                const delayClass = index === 0 ? 'stagger-delay-1' : index === 1 ? 'stagger-delay-2' : 'stagger-delay-3';
                return (
                  <div
                    key={relatedProject.id}
                    role="button"
                    tabIndex={0}
                    className={`group glass-card rounded-2xl overflow-hidden shadow-4d hover:shadow-4d-hover hover:scale-[1.02] transition-all duration-300 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                      isRelatedVisible ? `animate-portfolio-card ${delayClass}` : 'opacity-0'
                    }`}
                    onClick={() => navigate(`/project/${relatedProject.id}`)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        navigate(`/project/${relatedProject.id}`);
                      }
                    }}
                    aria-label={`View related project: ${relatedProject.title}`}
                  >
                    <div className="relative h-40 bg-secondary overflow-hidden">
                      {relatedHasVisual ? (
                        <ProjectImageSlider
                          images={relatedImages}
                          alt={`${relatedProject.title} preview`}
                          interactive={relatedImages.length > 1}
                          onOpenRequest={
                            relatedImages.length > 1
                              ? () => navigate(`/project/${relatedProject.id}`)
                              : undefined
                          }
                        />
                      ) : (
                        <>
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <RelatedIcon className="w-12 h-12 text-muted-foreground/30" aria-hidden />
                          </div>
                        </>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="font-display text-lg font-bold text-foreground/85 group-hover:text-primary transition-colors drop-shadow-md">
                        {relatedProject.title}
                      </h3>
                      {projectHasStoreRating(relatedProject) && (
                        <div
                          className={cn(
                            'w-full min-w-0',
                            getStoreLinksForProject(relatedProject).length > 1
                              ? 'mt-2 mb-1'
                              : 'mt-1.5',
                          )}
                        >
                          <AppStoreRating
                            storeLinks={getStoreLinksForProject(relatedProject)}
                            variant="compact"
                            enabled={isRelatedVisible}
                          />
                        </div>
                      )}
                      <p className="text-sm text-foreground/75 mt-1 line-clamp-2 drop-shadow-sm">
                        {relatedProject.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ProjectDetail;
