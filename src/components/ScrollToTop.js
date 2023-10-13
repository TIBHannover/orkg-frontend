import { useEffect } from 'react';
import ROUTES from 'constants/routes.js';
import { match } from 'path-to-regexp';
import { usePrevious } from 'react-use';
import usePathname from 'components/NextJsMigration/usePathname';

/* Scrolls browser window to top when new page is visited,
but preserves scroll position when previous page is visited */
const ScrollToTop = props => {
    const pathname = usePathname();
    const prevPathname = usePrevious(pathname);

    useEffect(() => {
        const excludePages = [
            ROUTES.VIEW_PAPER_CONTRIBUTION,
            ROUTES.VIEW_PAPER,
            ROUTES.FEATURED_COMPARISONS,
            ROUTES.REVIEW,
            ROUTES.LIST,
            ROUTES.RESEARCH_FIELD,
        ];
        let preventScrollTop = false;

        for (const page of excludePages) {
            const matchPage = match(page);
            if (matchPage(pathname) && matchPage(prevPathname)) {
                preventScrollTop = true;
                break;
            }
        }
        if (!preventScrollTop) {
            window.scrollTo(0, 0);
        }
    }, [pathname, prevPathname]);

    return props.children;
};

export default ScrollToTop;
