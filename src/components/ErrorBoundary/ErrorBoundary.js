import { Component } from 'react';
import PropTypes from 'prop-types';
import withMatomo from 'components/Matomo/withMatomo';
import { detect } from 'detect-browser';
import ErrorFallback from 'components/ErrorBoundary/ErrorFallback';

class ErrorBoundary extends Component {
    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, browser: null };
    }

    componentDidCatch(error) {
        // log the error as matomo event
        const browser = detect();
        this.props.trackEvent({
            category: 'errors',
            action: error.toString().replace(' ', ''),
            name: `Location ${window.location.href} Browser:${JSON.stringify(browser)}`,
        });
    }

    render() {
        if (this.state.hasError) {
            // render any custom fallback UI
            return this.props.fallback ? this.props.fallback : <ErrorFallback error={this.state.error} />;
        }
        return this.props.children;
    }
}

ErrorBoundary.propTypes = {
    children: PropTypes.node,
    trackEvent: PropTypes.func.isRequired,
    fallback: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
};

export default withMatomo(ErrorBoundary);
