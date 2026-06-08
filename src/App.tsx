import { lazy, Suspense } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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

const App = () => {
  return (
    <ErrorBoundary>
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
            <Sonner />
            <BrowserRouter
              basename={
                import.meta.env.BASE_URL === '/'
                  ? undefined
                  : import.meta.env.BASE_URL.replace(/\/$/, '')
              }
            >
              <SiteBackground />
              <SkipToMain />
              <RouteAnnouncer />
              <Suspense fallback={<PageRouteFallback />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/project/:id" element={<ProjectDetail />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
              <DeferredChatbot />
            </BrowserRouter>
          </TooltipProvider>
        </ThemeProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
};

export default App;
