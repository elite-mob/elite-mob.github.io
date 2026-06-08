import { useState, useEffect, useLayoutEffect, useCallback, useRef } from 'react';
import { useMatch, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import {
  navigateToSection,
  navigateToPortfolio,
  navigateToSectionFromMenu,
  navigateToPortfolioFromMenu,
} from '@/lib/navigation';
import { ThemeToggle } from '@/components/ThemeToggle';
import { SITE_BRAND } from '@/lib/site';
import { useActiveSection } from '@/hooks/use-active-section';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '#home', label: 'Home', path: '/' },
  { href: '#about', label: 'About', path: '/' },
  { href: '#portfolio', label: 'Work', path: '/' },
  { href: '#experience', label: 'Experience', path: '/' },
  { href: '#skills', label: 'Skills', path: '/' },
  { href: '#reviews', label: 'Reviews', path: '/' },
  { href: '#contact', label: 'Contact', path: '/' },
] as const;

const MOBILE_MENU_OPEN_CLASS = 'mobile-menu-open';

function sectionIdFromHash(hash: string): string {
  return hash.replace(/^#/, '');
}

function navLinkClass(isActive: boolean) {
  return cn(
    'relative font-medium transition-colors duration-200 rounded-lg px-2 py-1 min-h-[44px] inline-flex items-center w-full md:w-auto justify-start md:justify-center',
    'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background',
    isActive ? 'text-primary' : 'text-foreground/75 hover:text-foreground',
  );
}

export const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const homeMatch = useMatch({ path: '/', end: true });
  const isHomePage = homeMatch !== null;
  const activeSection = useActiveSection(isHomePage);

  const lockedScrollYRef = useRef(0);
  const pendingMenuNavRef = useRef<((lockedScrollY: number) => void) | null>(null);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useLayoutEffect(() => {
    if (!isMobileMenuOpen) return;

    lockedScrollYRef.current = window.scrollY;
    document.documentElement.classList.add(MOBILE_MENU_OPEN_CLASS);

    return () => {
      document.documentElement.classList.remove(MOBILE_MENU_OPEN_CLASS);
      const lockedY = lockedScrollYRef.current;
      const pending = pendingMenuNavRef.current;
      pendingMenuNavRef.current = null;

      if (pending) {
        pending(lockedY);
        return;
      }

      window.scrollTo({ top: lockedY, left: 0, behavior: 'auto' });
    };
  }, [isMobileMenuOpen]);

  const handleNavAction = useCallback(
    (action: () => void, menuAction?: (lockedScrollY: number) => void) => {
      if (isMobileMenuOpen && menuAction) {
        lockedScrollYRef.current = window.scrollY;
        pendingMenuNavRef.current = menuAction;
        closeMobileMenu();
        return;
      }
      action();
    },
    [isMobileMenuOpen, closeMobileMenu],
  );

  const renderNavButton = (link: (typeof navLinks)[number]) => {
    const id = sectionIdFromHash(link.href);
    const isActive = isHomePage && activeSection === id;

    const className = cn(
      navLinkClass(isActive),
      'after:absolute after:bottom-1 after:left-2 after:right-2 after:h-0.5 after:rounded-full after:bg-primary after:transition-opacity',
      isActive ? 'after:opacity-100' : 'after:opacity-0',
    );

    if (link.href === '#portfolio') {
      return (
        <button
          key={link.href}
          type="button"
          onClick={() => {
            const category = localStorage.getItem('portfolioCategory') || 'featured';
            handleNavAction(
              () => navigateToPortfolio(category, navigate),
              (lockedScrollY) => navigateToPortfolioFromMenu(lockedScrollY, navigate, category),
            );
          }}
          className={className}
          aria-current={isActive ? 'true' : undefined}
        >
          {link.label}
        </button>
      );
    }

    return (
      <button
        key={link.href}
        type="button"
        onClick={() =>
          handleNavAction(
            () => navigateToSection(link.href, navigate),
            (lockedScrollY) => navigateToSectionFromMenu(link.href, lockedScrollY, navigate),
          )
        }
        className={className}
        aria-current={isActive ? 'true' : undefined}
      >
        {link.label}
      </button>
    );
  };

  return (
    <nav
      aria-label="Primary navigation"
      className={cn(
        'print:hidden fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        isScrolled ? 'glass-card py-3 shadow-4d' : 'bg-transparent py-6',
      )}
      style={{
        paddingTop: `max(${isScrolled ? '0.75rem' : '1.5rem'}, calc(${isScrolled ? '0.75rem' : '1.5rem'} + env(safe-area-inset-top, 0px)))`,
      }}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() =>
            handleNavAction(
              () => navigateToSection('#home', navigate),
              (lockedScrollY) => navigateToSectionFromMenu('#home', lockedScrollY, navigate),
            )
          }
          className="font-display text-2xl font-bold gradient-text text-left focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background rounded"
          aria-label={isHomePage ? 'Scroll to top' : 'Go to home'}
        >
          {SITE_BRAND}
        </button>

        <div className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => renderNavButton(link))}
          <ThemeToggle />
        </div>

        <div className="md:hidden flex items-center gap-0">
          <ThemeToggle />
          <button
            type="button"
            className="text-foreground/85 hover:text-foreground min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-primary/10 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background -mr-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden animate-fade-in"
            onClick={closeMobileMenu}
            aria-hidden
          />
          <div
            className="md:hidden glass-card mt-2 mx-4 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-2xl p-4 border border-primary/20 shadow-4d z-[60] relative"
            style={{
              marginLeft: 'max(1rem, env(safe-area-inset-left))',
              marginRight: 'max(1rem, env(safe-area-inset-right))',
            }}
          >
            <div className="flex flex-col gap-0.5">
              {navLinks.map((link) => renderNavButton(link))}
            </div>
          </div>
        </>
      )}
    </nav>
  );
};
