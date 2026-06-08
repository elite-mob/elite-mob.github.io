import { lazy, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { HeroSection } from '@/components/HeroSection';
import { Footer } from '@/components/Footer';
import { LazySection } from '@/components/LazySection';
import { handleHashNavigation, shouldSuppressHashAutoScroll } from '@/lib/navigation';
import { Seo } from '@/components/Seo';
import { JsonLdHome } from '@/components/JsonLd';

const LogoStrip = lazy(() =>
  import('@/components/LogoStrip').then((m) => ({ default: m.LogoStrip })),
);
const AboutSection = lazy(() =>
  import('@/components/AboutSection').then((m) => ({ default: m.AboutSection })),
);
const PortfolioSection = lazy(() =>
  import('@/components/PortfolioSection').then((m) => ({ default: m.PortfolioSection })),
);
const WorkHistorySection = lazy(() =>
  import('@/components/WorkHistorySection').then((m) => ({ default: m.WorkHistorySection })),
);
const SkillsSection = lazy(() =>
  import('@/components/SkillsSection').then((m) => ({ default: m.SkillsSection })),
);
const ReviewsSection = lazy(() =>
  import('@/components/ReviewsSection').then((m) => ({ default: m.ReviewsSection })),
);
const ContactSection = lazy(() =>
  import('@/components/ContactSection').then((m) => ({ default: m.ContactSection })),
);

const Index = () => {
  const location = useLocation();

  useEffect(() => {
    const hash = location.hash || window.location.hash;

    if (hash) {
      if (!shouldSuppressHashAutoScroll()) {
        handleHashNavigation();
      }
      return;
    }

    const scrollHomeTop = window.setTimeout(() => {
      if (!window.location.hash && !shouldSuppressHashAutoScroll()) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 100);

    return () => window.clearTimeout(scrollHomeTop);
  }, [location.pathname, location.hash, location.search]);

  return (
    <div className="min-h-screen relative">
      <Seo />
      <JsonLdHome />
      <Navigation />
      <main id="main-content" tabIndex={-1} className="relative z-10 transform-3d outline-none">
        <HeroSection />
        <LazySection minHeight="10rem">
          <LogoStrip />
        </LazySection>
        <LazySection minHeight="18rem" sectionId="about">
          <AboutSection />
        </LazySection>
        <LazySection
          minHeight="28rem"
          rootMargin="480px 0px 520px 0px"
          sectionId="portfolio"
        >
          <PortfolioSection />
        </LazySection>
        <LazySection minHeight="20rem" sectionId="experience">
          <WorkHistorySection />
        </LazySection>
        <LazySection minHeight="16rem" sectionId="skills">
          <SkillsSection />
        </LazySection>
        <LazySection minHeight="18rem" sectionId="reviews">
          <ReviewsSection />
        </LazySection>
        <LazySection minHeight="22rem" sectionId="contact">
          <ContactSection />
        </LazySection>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
