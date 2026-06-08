import { footerTagline } from '@/data/siteContent';
import { useNavigate } from 'react-router-dom';
import { RouterNavButton } from '@/components/RouterNavButton';
import { navigateToSection, navigateToPortfolio } from '@/lib/navigation';

const footerLinks = [
  { hash: '#home', label: 'Home', isPortfolio: false },
  { hash: '#about', label: 'About', isPortfolio: false },
  { hash: '#portfolio', label: 'Work', isPortfolio: true },
  { hash: '#experience', label: 'Experience', isPortfolio: false },
  { hash: '#skills', label: 'Skills', isPortfolio: false },
  { hash: '#reviews', label: 'Reviews', isPortfolio: false },
  { hash: '#contact', label: 'Contact', isPortfolio: false },
] as const;

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();

  return (
    <footer className="print:hidden py-10 sm:py-12 border-t border-border/35 relative overflow-hidden bg-section-calm/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="font-display text-xl sm:text-2xl font-bold text-foreground text-center md:text-left">
              {footerTagline}
            </p>

            <nav
              className="flex flex-wrap justify-center gap-4 sm:gap-6"
              aria-label="Footer"
            >
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
            </nav>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-border/40 text-sm text-foreground/70">
            <p className="text-center sm:text-left">
              Copyright © {currentYear}. All rights reserved.
            </p>
            <RouterNavButton
              to="/privacy"
              className="text-foreground/70 hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background rounded min-h-[44px] inline-flex items-center px-2"
            >
              Privacy Policy
            </RouterNavButton>
          </div>
        </div>
      </div>
    </footer>
  );
};
