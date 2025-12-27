import React from 'react';
import { Translation } from 'react-i18next';
import { sendClientError } from '@/lib/logging';

type ErrorBoundaryProps = {
  children: React.ReactNode;
  onError?: (error: Error, info: React.ErrorInfo) => void;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error?: Error;
};

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Basic client-side error logging; can be extended to send to server
    // Redact potentially sensitive info from stack traces before sending
    const safe = {
      message: error?.message,
      name: error?.name,
      componentStack: info?.componentStack?.slice(0, 2000),
    };
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary]', safe);
    // Fire-and-forget send to server
    sendClientError({
      message: error?.message,
      name: error?.name,
      stack: error?.stack,
      componentStack: info?.componentStack || undefined,
      tags: ['react', 'boundary'],
    });
    this.props.onError?.(error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Translation>
          {(t) => (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
              <div className="max-w-md text-center">
                <h1 className="text-xl font-semibold mb-2">{t('errors.somethingWentWrong')}</h1>
                <p className="text-sm text-muted-foreground mb-4">
                  {t('errors.unexpectedError')}
                </p>
                <button
                  className="px-4 py-2 rounded bg-primary text-primary-foreground hover:opacity-90"
                  onClick={() => {
                    this.setState({ hasError: false, error: undefined });
                    window.location.reload();
                  }}
                >
                  {t('common.reload')}
                </button>
              </div>
            </div>
          )}
        </Translation>
      );
    }
    return this.props.children;
  }
}
