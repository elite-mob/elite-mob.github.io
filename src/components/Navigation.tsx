import { useState, useEffect } from 'react';
import { useLocation, useMatch, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { navigateToSection, navigateToPortfolio } from '@/lib/navigation';
import { ThemeToggle } from '@/components/ThemeToggle';
import { SITE_BRAND } from '@/lib/site';

const navLinks = [
  { href: '#home', label: 'Home', path: '/' },
  { href: '#about', label: 'About', path: '/' },
  { href: '#portfolio', label: 'Portfolio', path: '/' },
  { href: '#skills', label: 'Skills', path: '/' },
  { href: '#reviews', label: 'Reviews', path: '/' },
  { href: '#contact', label: 'Contact', path: '/' },
];

export const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const homeMatch = useMatch({ path: '/', end: true });
  const isHomePage = homeMatch !== null;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /* Lock body scroll when mobile menu is open */
  useEffect(() => {
    if (isMobileMenuOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
    } else {
      const top = document.body.style.top;
      const scrollY = top ? Math.abs(parseInt(top, 10) || 0) : 0;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      if (scrollY > 0) window.scrollTo(0, scrollY);
    }
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
    };
  }, [isMobileMenuOpen]);


  return (
    <nav
      aria-label="Primary navigation"
      className={`print:hidden fixed top-0 left-0 right-0 z-50 transition-all duration-500 transform-3d ${
        isScrolled
          ? 'glass-card py-3 shadow-4d'
          : 'bg-transparent py-6'
      }`}
      style={{
        transform: 'translateZ(0)',
        paddingTop: `max(${isScrolled ? '0.75rem' : '1.5rem'}, calc(${isScrolled ? '0.75rem' : '1.5rem'} + env(safe-area-inset-top, 0px)))`,
      }}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        {isHomePage ? (
          <button
            type="button"
            onClick={() => navigateToSection('#home', navigate)}
            className="font-display text-2xl font-bold gradient-text text-left focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background rounded"
            aria-label="Scroll to top"
          >
            {SITE_BRAND}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => navigateToSection('#home', navigate)}
            className="font-display text-2xl font-bold gradient-text text-left focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background rounded"
            aria-label="Go to home"
          >
            {SITE_BRAND}
          </button>
        )}

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4 lg:gap-6">
          {navLinks.map((link) => (
            link.href === '#portfolio' ? (
              <button
                key={link.href}
                type="button"
                onClick={() => {
                  const category = localStorage.getItem('portfolioCategory') || 'featured';
                  navigateToPortfolio(category, navigate);
                }}
                className="text-foreground/75 hover:text-foreground transition-all duration-300 font-medium drop-shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background rounded-lg px-2 py-1"
              >
                {link.label}
              </button>
            ) : (
              <button
                key={link.href}
                type="button"
                onClick={() => navigateToSection(link.href, navigate)}
                className="text-foreground/75 hover:text-foreground transition-all duration-300 font-medium drop-shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background rounded-lg px-2 py-1"
              >
                {link.label}
              </button>
            )
          ))}
          <ThemeToggle />
        </div>

        {/* Mobile: theme toggle + menu */}
        <div className="md:hidden flex items-center gap-0">
          <ThemeToggle />
          <button
            type="button"
            className="text-foreground/85 hover:text-foreground min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-primary/10 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background -mr-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X size={24} className="transition-transform duration-300" /> : <Menu size={24} className="transition-transform duration-300" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu - Enhanced with modern slide animation */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden animate-fade-in"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
          {/* Menu - scrollable if many items, safe area aware */}
          <div className="md:hidden glass-card mt-2 mx-4 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-2xl p-6 animate-scale-in border border-primary/20 shadow-4d z-[60] relative" style={{ marginLeft: 'max(1rem, env(safe-area-inset-left))', marginRight: 'max(1rem, env(safe-area-inset-right))' }}>
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                link.href === '#portfolio' ? (
                  <button
                    key={link.href}
                    onClick={() => {
                      const category = localStorage.getItem('portfolioCategory') || 'featured';
                      navigateToPortfolio(category, navigate);
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-foreground/75 hover:text-foreground hover:bg-primary/10 rounded-lg px-4 py-3 min-h-[44px] flex items-center transition-all duration-300 font-medium text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background text-left w-full"
                  >
                    {link.label}
                  </button>
                ) : (
                  <button
                    key={link.href}
                    type="button"
                    onClick={() => {
                      navigateToSection(link.href, navigate);
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-foreground/75 hover:text-foreground hover:bg-primary/10 rounded-lg px-4 py-3 min-h-[44px] flex items-center transition-all duration-300 font-medium text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background text-left w-full"
                  >
                    {link.label}
                  </button>
                )
              ))}
            </div>
          </div>
        </>
      )}
    </nav>
  );
};
