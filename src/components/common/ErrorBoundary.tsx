declare const process: { env: { NODE_ENV: string } };

import type { ReactNode } from "react";
import React, { Component } from "react";
import type { ErrorInfo } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  private _isMounted = false;

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  public componentDidMount() {
    this._isMounted = true;
  }

  public componentWillUnmount() {
    this._isMounted = false;
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("❌ Error caught by ErrorBoundary:", error);
    console.error("🛠️ Error Info:", errorInfo);

    // Optional external logging
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    } else if (process.env.NODE_ENV === "production") {
      // Example: send to your API or logging service (e.g. Sentry)
      fetch("/api/log-error", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: error.message,
          stack: error.stack,
          info: errorInfo.componentStack,
        }),
      });
    }
  }

  private handleRetry = () => {
    if (this._isMounted) {
      this.setState({ hasError: false, error: null });
    }
  };

  public render() {
    if (this.state.hasError) {
      // Custom fallback provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
          <div className="max-w-md w-full space-y-8 text-center">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Something went wrong
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {this.state.error?.message || "An unexpected error occurred."}
              </p>
              <div className="space-x-4">
                <button
                  onClick={this.handleRetry}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Try again
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Reload page
                </button>
              </div>
            </div>

            {/* Show stack only in development */}
            {process.env.NODE_ENV === "development" &&
              this.state.error?.stack && (
                <pre className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-md text-left overflow-auto text-sm text-red-600 dark:text-red-300">
                  {this.state.error.stack}
                </pre>
              )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
