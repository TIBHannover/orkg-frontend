import { useMatomo } from '@jonkoops/matomo-tracker-react';

/**
 * A HOC to use the Matomo hooks in class components
 */
function withMatomo(Component) {
    return function WrappedComponent(props) {
        const { trackPageView, trackEvent } = useMatomo();
        return <Component {...props} trackPageView={trackPageView} trackEvent={trackEvent} />;
    };
}

export default withMatomo;
