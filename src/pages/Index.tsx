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
import { handleHashNavigation } from '@/lib/navigation';
import { Seo } from '@/components/Seo';
import { JsonLdHome } from '@/components/JsonLd';

const Index = () => {
  const location = useLocation();

  useEffect(() => {
    const hash = location.hash || window.location.hash;

    if (hash) {
      handleHashNavigation();
      return;
    }

    // Home without a hash: show hero (skip if user is mid cross-page hash navigation)
    const scrollHomeTop = window.setTimeout(() => {
      if (!window.location.hash) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 100);

    return () => window.clearTimeout(scrollHomeTop);
  }, [location.pathname, location.hash, location.search]);

  // Also listen for hash changes directly (in case React Router doesn't update location.hash)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash) {
        handleHashNavigation();
        if (hash === '#portfolio') {
          window.dispatchEvent(new CustomEvent('portfolioShowContent'));
        }
      }
    };

    // Check hash on mount
    handleHashChange();
    
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <div className="min-h-screen perspective-4d relative bg-gradient-to-b from-[hsl(156_26%_96.5%)] via-[hsl(200_24%_98%)] to-background dark:from-[hsl(220_18%_15%)] dark:via-[hsl(200_14%_17%)] dark:to-background">
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
