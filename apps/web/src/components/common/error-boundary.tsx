import { Component, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
          <div className="max-w-md w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
            <div className="flex justify-center mb-4">
              <span className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
                <AlertTriangle className="w-7 h-7 text-red-500" />
              </span>
            </div>
            <h2 className="text-lg font-semibold text-afrilink-dark mb-2">
              Une erreur est survenue
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              {this.state.error?.message || 'Erreur inattendue. Veuillez réessayer.'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="h-10 px-6 rounded-lg bg-afrilink-green text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Réessayer
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
