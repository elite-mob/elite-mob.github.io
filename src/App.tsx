import { lazy, Suspense, type ReactNode } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { BrowserRouter, Routes, Route, useLocation, useParams } from 'react-router-dom';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { SkipToMain } from '@/components/SkipToMain';
import { RouteAnnouncer } from '@/components/RouteAnnouncer';
import { PageRouteFallback } from '@/components/PageRouteFallback';
import { DeferredChatbot } from '@/components/chatbot/DeferredChatbot';
import { SiteBackground } from '@/components/SiteBackground';
import Index from './pages/Index';

const ProjectDetail = lazy(() => import('./pages/ProjectDetail'));
const Privacy = lazy(() => import('./pages/Privacy'));
const NotFound = lazy(() => import('./pages/NotFound'));

/** Reset error UI when the route changes (e.g. switching case studies). */
function RouteErrorBoundary({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  return <ErrorBoundary key={pathname}>{children}</ErrorBoundary>;
}

/** Remount detail page when :id changes so sliders and observers reset cleanly. */
function ProjectDetailRoute() {
  const { id } = useParams<{ id: string }>();
  return <ProjectDetail key={id} />;
}

const App = () => {
  return (
    <HelmetProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem={false}
        storageKey="elite-mob-theme"
        disableTransitionOnChange
      >
        <TooltipProvider>
          <Toaster />
          <BrowserRouter
            basename={
              import.meta.env.BASE_URL === '/'
                ? undefined
                : import.meta.env.BASE_URL.replace(/\/$/, '')
            }
          >
            <RouteErrorBoundary>
              <SiteBackground />
              <SkipToMain />
              <RouteAnnouncer />
              <Suspense fallback={<PageRouteFallback />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/project/:id" element={<ProjectDetailRoute />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
              <DeferredChatbot />
            </RouteErrorBoundary>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
};

export default App;
