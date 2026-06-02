import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, LayoutGrid } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { navigateToPortfolio } from "@/lib/navigation";
import { Seo } from "@/components/Seo";
import { pageTitle } from "@/lib/site";
import { logPageView } from "@/integrations/firebase/analytics";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const path = `${location.pathname}${location.search}`;
    void logPageView({
      page_path: path || "/404",
      page_title: "Page not found",
      page_location: typeof window !== "undefined" ? window.location.href : "",
    });
  }, [location.pathname, location.search]);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden perspective-4d">
      <Seo
        title={pageTitle('Page not found')}
        description="This page does not exist. Return to the portfolio home."
        noindex
      />
      <div className="fixed inset-0 bg-section-calm pointer-events-none" aria-hidden />

      <Navigation />
      
      <main
        id="main-content"
        tabIndex={-1}
        className="flex min-h-screen items-center justify-center pt-[calc(6rem+env(safe-area-inset-top,0px))] pb-16 relative z-10 outline-none"
      >
        <div className="text-center glass-card p-12 sm:p-16 rounded-3xl border border-primary/20 transform-3d shadow-4d max-w-2xl mx-auto">
          <div className="mb-6">
            <h1 className="font-display text-6xl sm:text-8xl font-bold gradient-text-transparent mb-4 drop-shadow-lg">404</h1>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground/85 mb-4 drop-shadow-md">
              Page Not Found
            </h2>
            <p className="text-base sm:text-lg text-foreground/75 mb-8 leading-relaxed drop-shadow-sm">
              This page wandered off, but the rest of the site is alive and here. Head back and explore.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="hero"
              size="lg"
              className="gap-2 min-h-[44px]"
              onClick={() => navigate('/')}
              aria-label="Return to home"
            >
              <Home className="w-5 h-5" />
              Return to Home
            </Button>
            <Button
              variant="heroOutline"
              size="lg"
              className="gap-2 min-h-[44px]"
              onClick={() => navigateToPortfolio(undefined, navigate)}
              aria-label="View portfolio"
            >
              <LayoutGrid className="w-5 h-5" aria-hidden />
              View Portfolio
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFound;
