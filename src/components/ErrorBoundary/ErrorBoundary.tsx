'use client';

import { sendEvent } from '@socialgouv/matomo-next';
import { detect } from 'detect-browser';
import { Component, ReactNode } from 'react';

import ErrorFallback from '@/components/ErrorBoundary/ErrorFallback';

type ErrorBoundaryProps = {
    children: ReactNode;
    fallback?: ReactNode;
};

type ErrorBoundaryState = {
    hasError: boolean;
    error?: Error | null;
};

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    componentDidCatch(error: Error) {
        // log the error as matomo event
        const browser = detect();
        sendEvent({
            category: 'errors',
            action: error.toString().replace(' ', ''),
            name: `Location ${window.location.href} Browser:${JSON.stringify(browser)}`,
        });
    }

    render() {
        const { hasError, error } = this.state;
        const { fallback, children } = this.props;
        if (hasError && error) {
            // render any custom fallback UI
            return fallback || <ErrorFallback error={error} />;
        }
        return children;
    }
}

export default ErrorBoundary;
