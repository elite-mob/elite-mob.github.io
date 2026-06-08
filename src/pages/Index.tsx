import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { HeroSection } from '@/components/HeroSection';
import { LogoStrip } from '@/components/LogoStrip';
import { PortfolioSection } from '@/components/PortfolioSection';
import { AboutSection } from '@/components/AboutSection';
import { WorkHistorySection } from '@/components/WorkHistorySection';
import { ReviewsSection } from '@/components/ReviewsSection';
import { SkillsSection } from '@/components/SkillsSection';
import { ContactSection } from '@/components/ContactSection';
import { Footer } from '@/components/Footer';
import { handleHashNavigation, shouldSuppressHashAutoScroll } from '@/lib/navigation';
import { Seo } from '@/components/Seo';
import { JsonLdHome } from '@/components/JsonLd';

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
      if (!window.location.hash) {
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
        <LogoStrip />
        <AboutSection />
        <PortfolioSection />
        <WorkHistorySection />
        <SkillsSection />
        <ReviewsSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
