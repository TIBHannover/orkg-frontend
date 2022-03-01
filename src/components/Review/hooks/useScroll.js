import { isString } from 'lodash';
import { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router';
import { useDebounce, usePrevious, useWindowScroll } from 'react-use';

const useScroll = () => {
    const [scrollTop, setScrollTop] = useState(null);
    const location = useLocation();
    const history = useHistory();
    const prevHash = usePrevious(location.hash);
    const { y: windowScrollY } = useWindowScroll();
    const prevWindowScrollY = usePrevious(windowScrollY);

    useEffect(() => {
        const scrollToQuote = () => {
            const hash = location.hash;
            const id = isString(hash) ? hash.replace('#', '') : null;

            if (id && document.getElementById(id)) {
                setScrollTop(document.getElementById(id).getBoundingClientRect().top + window.scrollY - 90);
            }
        };
        if (prevHash !== location.hash) {
            scrollToQuote();
        }
    }, [location.hash, prevHash]);

    // start the scrolling
    useEffect(() => {
        if (scrollTop >= 0) {
            window.scrollTo({
                behavior: 'smooth',
                top: scrollTop
            });
        }
    }, [scrollTop]);

    // remove the hash from the url when the user scrolls to a different position
    useEffect(() => {
        if (scrollTop === -1 && windowScrollY !== prevWindowScrollY && location.hash) {
            history.push(location.pathname);
        }
    }, [history, location.hash, location.pathname, prevWindowScrollY, scrollTop, windowScrollY]);

    // set scrollTop to -1 when window.scrollTo is finished
    useDebounce(
        () => {
            if (scrollTop) {
                setScrollTop(-1);
            }
        },
        100,
        [windowScrollY]
    );
};

export default useScroll;
