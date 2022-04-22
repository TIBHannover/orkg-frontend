import { useEffect } from 'react';
import ROUTES from 'constants/routes.js';
import { match } from 'path-to-regexp';
import { useLocation } from 'react-router-dom';
import { usePrevious } from 'react-use';

/* Scrolls browser window to top when new page is visited,
but preserves scroll position when previous page is visited */
const ScrollToTop = props => {
    const location = useLocation();
    const prevPathname = usePrevious(location.pathname);

    useEffect(() => {
        const excludePages = [ROUTES.VIEW_PAPER, ROUTES.FEATURED_COMPARISONS, ROUTES.REVIEW, ROUTES.LIST, ROUTES.RESEARCH_FIELD];
        let preventScrollTop = false;

        for (const page of excludePages) {
            const matchPage = match(page);
            if (matchPage(location.pathname) && matchPage(prevPathname)) {
                preventScrollTop = true;
                break;
            }
        }
        if (!preventScrollTop) {
            window.scrollTo(0, 0);
        }
    }, [location.pathname, prevPathname]);

    return props.children;
};

export default ScrollToTop;
