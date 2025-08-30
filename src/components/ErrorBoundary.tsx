'use client';

import React, { Component, ReactNode, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  level?: 'page' | 'component' | 'feature';
  feature?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details
    const errorDetails = {
      errorId: this.state.errorId,
      message: error.message,
      stack: error.stack,
      level: this.props.level || 'component',
      feature: this.props.feature,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', errorDetails);
    }

    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      this.logErrorToService(errorDetails);
    }

    // Update state with error info
    this.setState({ errorInfo });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  private async logErrorToService(errorDetails: any) {
    try {
      // In production, this would send to your error tracking service (Sentry, LogRocket, etc.)
      await fetch('/api/errors/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorDetails),
      });
    } catch (logError) {
      console.error('Failed to log error to service:', logError);
      
      // Fallback: store in localStorage for later retry
      try {
        const storedErrors = JSON.parse(localStorage.getItem('spinverse-error-queue') || '[]');
        storedErrors.push(errorDetails);
        
        // Keep only last 10 errors to avoid storage bloat
        if (storedErrors.length > 10) {
          storedErrors.splice(0, storedErrors.length - 10);
        }
        
        localStorage.setItem('spinverse-error-queue', JSON.stringify(storedErrors));
      } catch (storageError) {
        console.error('Failed to store error in localStorage:', storageError);
      }
    }
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    });
  };

  private handleReportError = () => {
    const { error, errorInfo, errorId } = this.state;
    const errorReport = {
      errorId,
      message: error?.message,
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      level: this.props.level,
      feature: this.props.feature,
      timestamp: new Date().toISOString(),
      url: window.location.href,
    };

    // Create a mailto link with pre-filled error report
    const subject = encodeURIComponent(`SpinVerse Error Report - ${errorId}`);
    const body = encodeURIComponent(`
Error Report:

Error ID: ${errorReport.errorId}
Timestamp: ${errorReport.timestamp}
URL: ${errorReport.url}
Level: ${errorReport.level}
Feature: ${errorReport.feature || 'unknown'}

Error Message:
${errorReport.message}

Technical Details:
${errorReport.stack}

Component Stack:
${errorReport.componentStack}

Please describe what you were doing when this error occurred:
[Your description here]
    `);

    window.open(`mailto:support@spinverse.app?subject=${subject}&body=${body}`);
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { level = 'component', feature } = this.props;
      const { error, errorId } = this.state;

      // Different error UIs based on error level
      if (level === 'page') {
        return (
          <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-gray-800 rounded-xl shadow-2xl border border-gray-700 p-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-red-500 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                
                <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
                <p className="text-gray-400 mb-6">
                  We encountered an unexpected error. This has been reported to our team.
                </p>
                
                {process.env.NODE_ENV === 'development' && (
                  <div className="mb-6 p-4 bg-gray-900 rounded-lg text-left">
                    <p className="text-xs text-gray-400 mb-2">Error ID: {errorId}</p>
                    <p className="text-sm text-red-400 font-mono break-all">
                      {error?.message}
                    </p>
                  </div>
                )}
                
                <div className="space-y-3">
                  <button
                    onClick={this.handleReload}
                    className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-medium transition-all duration-200"
                  >
                    Reload Page
                  </button>
                  
                  <button
                    onClick={this.handleReportError}
                    className="w-full px-4 py-2 border border-gray-600 text-gray-300 hover:bg-gray-700 rounded-lg font-medium transition-colors"
                  >
                    Report This Error
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      }

      if (level === 'feature') {
        return (
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-400 mb-1">
                  {feature ? `${feature} Error` : 'Feature Error'}
                </h3>
                <p className="text-sm text-red-300 mb-3">
                  This feature is temporarily unavailable. Please try again or use other parts of the app.
                </p>
                
                <div className="flex space-x-2">
                  <button
                    onClick={this.handleReset}
                    className="text-xs px-3 py-1 bg-red-800 hover:bg-red-700 text-red-100 rounded transition-colors"
                  >
                    Try Again
                  </button>
                  
                  {process.env.NODE_ENV === 'development' && (
                    <button
                      onClick={() => console.log('Error details:', { error, errorInfo: this.state.errorInfo })}
                      className="text-xs px-3 py-1 border border-red-600 text-red-300 hover:bg-red-800 rounded transition-colors"
                    >
                      Debug
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      }

      // Default component-level error
      return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium text-yellow-400">Component Error</span>
          </div>
          
          <p className="text-sm text-gray-400 mb-3">
            A component failed to load. This won't affect other parts of the app.
          </p>
          
          <button
            onClick={this.handleReset}
            className="text-xs px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded transition-colors"
          >
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Specialized error boundaries for different parts of the app

export function PageErrorBoundary({ children, onError }: { children: ReactNode; onError?: (error: Error, errorInfo: ErrorInfo) => void }) {
  return (
    <ErrorBoundary level="page" onError={onError}>
      {children}
    </ErrorBoundary>
  );
}

export function FeatureErrorBoundary({ 
  children, 
  feature, 
  fallback, 
  onError 
}: { 
  children: ReactNode; 
  feature: string; 
  fallback?: ReactNode; 
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}) {
  return (
    <ErrorBoundary level="feature" feature={feature} fallback={fallback} onError={onError}>
      {children}
    </ErrorBoundary>
  );
}

export function ComponentErrorBoundary({ children, onError }: { children: ReactNode; onError?: (error: Error, errorInfo: ErrorInfo) => void }) {
  return (
    <ErrorBoundary level="component" onError={onError}>
      {children}
    </ErrorBoundary>
  );
}

// Hook for programmatic error handling
export function useErrorHandler() {
  const handleError = React.useCallback((error: Error, context?: string) => {
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
    };

    if (process.env.NODE_ENV === 'development') {
      console.error('Manual error report:', errorDetails);
    } else {
      // In production, log to error service
      fetch('/api/errors/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorDetails),
      }).catch(logError => {
        console.error('Failed to log error:', logError);
      });
    }
  }, []);

  return handleError;
}

// Utility to recover from localStorage corruption
export function recoverFromStorageError(storageKey: string, defaultValue: any) {
  try {
    const stored = localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (error) {
    console.warn(`Corrupted localStorage for key ${storageKey}, using default:`, error);
    
    // Clear corrupted data
    try {
      localStorage.removeItem(storageKey);
    } catch (clearError) {
      console.error('Failed to clear corrupted localStorage:', clearError);
    }
    
    return defaultValue;
  }
}

// Utility to handle async errors in components
export function useAsyncError() {
  const [, setError] = React.useState();
  
  return React.useCallback((error: Error) => {
    setError(() => {
      throw error;
    });
  }, []);
}

export default ErrorBoundary;