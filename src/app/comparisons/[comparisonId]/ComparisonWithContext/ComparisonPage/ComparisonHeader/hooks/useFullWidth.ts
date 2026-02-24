import { env } from 'next-runtime-env';
import { useCookies } from 'react-cookie';

const COOKIE_NAME = 'useFullWidthForComparisonTable';

const useFullWidth = ({ sourceAmount }: { sourceAmount: number }) => {
    const [cookies, setCookie] = useCookies([COOKIE_NAME]);
    const isFullWidth = cookies[COOKIE_NAME] ?? sourceAmount > 3;

    const toggleIsFullWidth = () => {
        setCookie(COOKIE_NAME, !isFullWidth, { path: env('NEXT_PUBLIC_PUBLIC_URL'), maxAge: 60 * 60 * 24 * 365 }); // << one year
    };

    return { isFullWidth, toggleIsFullWidth };
};

export default useFullWidth;
