import { useCookies } from 'next-client-cookies';
import { env } from 'next-runtime-env';
import { useSyncExternalStore } from 'react';

export const DEFAULT_COLUMN_WIDTH = 250;
const COOKIE_NAME = 'comparisonColumnWidth';

// next-client-cookies `set`/`remove` mutate an internal map without triggering a re-render,
// so consumers subscribe to a shared notifier fired when the cookie changes.
const listeners = new Set<() => void>();
const subscribe = (cb: () => void) => {
    listeners.add(cb);
    return () => {
        listeners.delete(cb);
    };
};

const useColumnWidth = () => {
    const cookies = useCookies();
    const getSnapshot = () => cookies.get(COOKIE_NAME);
    const raw = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
    const columnWidth =
        raw !== undefined && raw !== ''
            ? (() => {
                  const n = Number(raw);
                  return !Number.isNaN(n) ? n : DEFAULT_COLUMN_WIDTH;
              })()
            : DEFAULT_COLUMN_WIDTH;

    const setColumnWidth = (width: number) => {
        if (Number.isNaN(width)) {
            return;
        }
        if (width === DEFAULT_COLUMN_WIDTH) {
            cookies.remove(COOKIE_NAME, { path: env('NEXT_PUBLIC_PUBLIC_URL') });
        } else {
            cookies.set(COOKIE_NAME, String(width), { path: env('NEXT_PUBLIC_PUBLIC_URL'), expires: 7 });
        }
        listeners.forEach((cb) => cb());
    };

    return { columnWidth, setColumnWidth };
};

export default useColumnWidth;
