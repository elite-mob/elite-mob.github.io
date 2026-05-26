import { useEffect } from "react";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SkipToMain } from "@/components/SkipToMain";
import { RouteAnnouncer } from "@/components/RouteAnnouncer";
import { AnalyticsRouteTracker } from "@/components/AnalyticsRouteTracker";
import { AnalyticsButtonClickTracker } from "@/components/AnalyticsButtonClickTracker";
import { recordVisit } from "@/lib/visitTracking";
import Index from "./pages/Index";
import ProjectDetail from "./pages/ProjectDetail";
import NotFound from "./pages/NotFound";
import Privacy from "./pages/Privacy";
import { ChatbotWidget } from "@/components/chatbot/ChatbotWidget";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  useEffect(() => {
    recordVisit();
  }, []);
  return (
  <ErrorBoundary>
    <HelmetProvider>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem storageKey="elite-mob-theme" disableTransitionOnChange>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter
          basename={
            import.meta.env.BASE_URL === "/" ? undefined : import.meta.env.BASE_URL.replace(/\/$/, "")
          }
        >
          <SkipToMain />
          <RouteAnnouncer />
          <AnalyticsRouteTracker />
          <AnalyticsButtonClickTracker />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/project/:id" element={<ProjectDetail />} />
            <Route path="/privacy" element={<Privacy />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <ChatbotWidget />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
    </ThemeProvider>
    </HelmetProvider>
  </ErrorBoundary>
  );
};

export default App;
