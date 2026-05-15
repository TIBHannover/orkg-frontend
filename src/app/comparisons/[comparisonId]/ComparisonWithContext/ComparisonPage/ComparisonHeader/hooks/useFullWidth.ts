import { useCookies } from 'next-client-cookies';
import { env } from 'next-runtime-env';
import { useSyncExternalStore } from 'react';

const COOKIE_NAME = 'useFullWidthForComparisonTable';

// next-client-cookies `set` mutates an internal map and does not trigger a re-render,
// so consumers subscribe to a shared notifier that fires whenever the cookie changes.
const listeners = new Set<() => void>();
const subscribe = (cb: () => void) => {
    listeners.add(cb);
    return () => {
        listeners.delete(cb);
    };
};

const useFullWidth = ({ sourceAmount }: { sourceAmount: number }) => {
    const cookies = useCookies();
    const getSnapshot = () => cookies.get(COOKIE_NAME);
    const raw = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
    const isFullWidth = raw !== undefined ? raw === 'true' : sourceAmount > 3;

    const toggleIsFullWidth = () => {
        cookies.set(COOKIE_NAME, String(!isFullWidth), { path: env('NEXT_PUBLIC_PUBLIC_URL'), expires: 365 });
        listeners.forEach((cb) => cb());
    };

    return { isFullWidth, toggleIsFullWidth };
};

export default useFullWidth;
