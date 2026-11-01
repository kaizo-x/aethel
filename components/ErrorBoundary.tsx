'use client';

import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary — catches client-side render exceptions in the subtree and
 * presents a graceful recovery surface instead of a blank screen.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('Aethel ErrorBoundary caught an exception:', error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-cream-100 px-6">
          <div className="max-w-md w-full bg-white border border-atelier-border rounded-lg p-8 shadow-atelier text-center space-y-4">
            <h1 className="font-serif text-2xl font-medium text-charcoal-900">
              Something went awry in the atelier
            </h1>
            <p className="text-sm text-charcoal-600 font-sans">
              An unexpected error interrupted this view. Your saved event plans remain intact.
            </p>
            {this.state.error && (
              <p className="text-xs text-charcoal-400 font-mono break-words">
                {this.state.error.message}
              </p>
            )}
            <button
              type="button"
              onClick={this.handleReset}
              aria-label="Retry rendering the application"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-md bg-forest text-cream-50 hover:bg-forest-light transition-colors shadow-atelier"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
