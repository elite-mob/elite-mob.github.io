import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to error reporting service in production
    if (import.meta.env.PROD) {
      // Error reporting service would go here
    } else {
      console.error('Uncaught error:', error, errorInfo);
    }
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
          <div className="text-center glass-card p-12 rounded-3xl border border-primary/20 max-w-2xl mx-auto">
            <AlertTriangle className="w-16 h-16 text-accent mx-auto mb-6" />
            <h1 className="font-display text-3xl font-bold text-foreground/85 mb-4">
              Something went wrong
            </h1>
            <p className="text-foreground/75 mb-8">
              We're sorry, but something unexpected happened. Please try refreshing the page.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="hero"
                size="lg"
                className="gap-2"
                onClick={() => {
                  window.location.href = new URL(
                    import.meta.env.BASE_URL,
                    window.location.origin,
                  ).href;
                }}
                aria-label="Return to home"
              >
                <Home className="w-5 h-5" />
                Return to Home
              </Button>
              <Button
                variant="heroOutline"
                size="lg"
                onClick={() => window.location.reload()}
                className="gap-2"
              >
                Refresh Page
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
