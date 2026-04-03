import { footerTagline } from '@/data/siteContent';
import { ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { RouterNavButton } from '@/components/RouterNavButton';
import { VisitStats } from '@/components/VisitStats';
import { navigateToSection, navigateToPortfolio } from '@/lib/navigation';

const footerLinks = [
  { hash: '#home', label: 'Home', isPortfolio: false },
  { hash: '#portfolio', label: 'Portfolio', isPortfolio: true },
  { hash: '#about', label: 'About', isPortfolio: false },
  { hash: '#reviews', label: 'Reviews', isPortfolio: false },
  { hash: '#contact', label: 'Contact', isPortfolio: false },
] as const;

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();

  return (
    <footer className="print:hidden py-10 sm:py-12 border-t border-border/40 relative overflow-hidden perspective-4d bg-section-calm">
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
              <div className="font-display text-xl sm:text-2xl font-bold text-foreground">
                {footerTagline}
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs text-foreground/72">
                <ShieldCheck className="w-3.5 h-3.5 text-primary/80" />
                Secure connection
              </span>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
              {footerLinks.map(({ hash, label, isPortfolio }) => (
                <button
                  key={hash}
                  type="button"
                  onClick={() =>
                    isPortfolio
                      ? navigateToPortfolio(undefined, navigate)
                      : navigateToSection(hash, navigate)
                  }
                  className="text-foreground/82 hover:text-foreground transition-colors duration-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background rounded min-h-[44px] min-w-[44px] px-3 py-2 inline-flex items-center justify-center"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-foreground/85 text-sm sm:text-base text-center pt-6 border-t border-border/40 flex-wrap">
            <span>Copyright © {currentYear} Hans Chan. All rights reserved.</span>
            <RouterNavButton
              to="/privacy"
              className="text-foreground/65 hover:text-primary text-xs sm:text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 rounded min-h-[44px] inline-flex items-center px-1"
            >
              Privacy Policy
            </RouterNavButton>
            <span className="text-foreground/65 text-xs">Here when you need.</span>
          </div>
          <div className="pt-3">
            <VisitStats />
          </div>
        </div>
      </div>
    </footer>
  );
};
