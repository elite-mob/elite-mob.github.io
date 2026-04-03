/**
 * Utility functions for navigation with hash support
 */

function isHomePath(): boolean {
  const base = import.meta.env.BASE_URL;
  const pathname = window.location.pathname.replace(/\/$/, '') || '/';
  if (base === '/') return pathname === '/' || pathname === '';
  const homePath = base.replace(/\/$/, '');
  return pathname === homePath;
}

function homeHrefWithHash(hash: string): string {
  const fragment = hash.startsWith('#') ? hash : `#${hash}`;
  return new URL(fragment, window.location.origin + import.meta.env.BASE_URL).href;
}

export const navigateToSection = (hash: string, navigate?: (path: string) => void) => {
  // If we're on the home page, just scroll to the section
  if (isHomePath()) {
    const element = document.querySelector(hash);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  } else {
    // If we're on another page, navigate to home with hash using React Router
    if (navigate) {
      navigate('/');
      // Set hash after navigation completes
      setTimeout(() => {
        window.location.hash = hash;
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 50);
    } else {
      window.location.href = homeHrefWithHash(hash);
    }
  }
};

export const navigateToPortfolio = (category?: string, navigate?: (path: string) => void) => {
  const categoryParam = category ? `?category=${category}` : '';
  if (isHomePath()) {
    // Ensure portfolio section is visible
    const element = document.querySelector('#portfolio');
    if (element) {
      // Force show portfolio items immediately
      window.dispatchEvent(new CustomEvent('portfolioShowContent'));
      
      // Update filter immediately
      if (category) {
        localStorage.setItem('portfolioCategory', category);
        window.dispatchEvent(new CustomEvent('portfolioFilterChange', { detail: { category } }));
      }
      
      // Scroll to section after a brief delay to ensure content is shown
      setTimeout(() => {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
    // Update URL without reload
    if (categoryParam) {
      const u = new URL(import.meta.env.BASE_URL, window.location.origin);
      u.search = categoryParam.startsWith('?') ? categoryParam.slice(1) : categoryParam;
      window.history.pushState({}, '', u.pathname + u.search + u.hash);
    }
  } else {
    // Navigate to home with hash and category
    if (navigate) {
      // Store category before navigation
      if (category) {
        localStorage.setItem('portfolioCategory', category);
      }
      // Navigate to home first, then handle hash
      navigate('/');
      // Use setTimeout to ensure navigation completes and component is mounted
      setTimeout(() => {
        // Set hash in URL - this will trigger hashchange event
        window.location.hash = '#portfolio';
        // Dispatch events to show content
        window.dispatchEvent(new CustomEvent('portfolioShowContent'));
        if (category) {
          window.dispatchEvent(new CustomEvent('portfolioFilterChange', { detail: { category } }));
        }
        // Scroll to portfolio section after a longer delay to ensure DOM is ready
        setTimeout(() => {
          const element = document.querySelector('#portfolio');
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 200);
      }, 100);
    } else {
      const u = new URL(import.meta.env.BASE_URL, window.location.origin);
      u.hash = '#portfolio';
      if (categoryParam) {
        u.search = categoryParam.startsWith('?') ? categoryParam.slice(1) : categoryParam;
      }
      window.location.href = u.href;
    }
  }
};

// Handle hash navigation on page load
export const handleHashNavigation = () => {
  const hash = window.location.hash || window.location.pathname.split('#')[1];
  if (hash) {
    const hashValue = hash.startsWith('#') ? hash : `#${hash}`;
    const element = document.querySelector(hashValue);
    if (element) {
      // Small delay to ensure page is fully loaded
      setTimeout(() => {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }
};
