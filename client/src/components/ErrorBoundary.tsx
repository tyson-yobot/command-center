import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorFallbackProps {
  error?: Error;
  onRetry?: () => void;
  title?: string;
  message?: string;
}

export function ErrorFallback({ 
  error, 
  onRetry, 
  title = "Unable to load data",
  message = "There was an issue loading this information. Please try again." 
}: ErrorFallbackProps) {
  return (
    <Card className="bg-red-900/20 border border-red-500/30">
      <CardContent className="p-6 text-center">
        <div className="flex flex-col items-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-red-400" />
          <div>
            <h3 className="text-lg font-semibold text-red-400 mb-2">{title}</h3>
            <p className="text-slate-300 text-sm mb-4">{message}</p>
            {error && (
              <p className="text-xs text-slate-400 font-mono bg-slate-800 p-2 rounded">
                {error.message}
              </p>
            )}
          </div>
          {onRetry && (
            <Button 
              onClick={onRetry} 
              variant="outline" 
              className="border-red-500 text-red-400 hover:bg-red-500/10"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{ fallback?: React.ComponentType<ErrorFallbackProps> }>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{ fallback?: React.ComponentType<ErrorFallbackProps> }>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || ErrorFallback;
      return (
        <FallbackComponent 
          error={this.state.error}
          onRetry={() => this.setState({ hasError: false, error: undefined })}
        />
      );
    }

    return this.props.children;
  }
}