import { env } from 'next-runtime-env';
import { useCookies } from 'react-cookie';

export const DEFAULT_COLUMN_WIDTH = 250;
const COOKIE_NAME = 'comparisonColumnWidth';

const useColumnWidth = () => {
    const [cookies, setCookie, removeCookie] = useCookies([COOKIE_NAME]);
    const columnWidth = cookies[COOKIE_NAME] || DEFAULT_COLUMN_WIDTH;

    const setColumnWidth = (width: number) => {
        if (width === DEFAULT_COLUMN_WIDTH) {
            removeCookie(COOKIE_NAME, { path: env('NEXT_PUBLIC_PUBLIC_URL') });
            return;
        }
        if (Number.isNaN(width)) {
            return;
        }
        setCookie(COOKIE_NAME, width, { path: env('NEXT_PUBLIC_PUBLIC_URL'), maxAge: 60 * 60 * 24 * 7 }); // << one week
    };

    return { columnWidth, setColumnWidth };
};

export default useColumnWidth;
