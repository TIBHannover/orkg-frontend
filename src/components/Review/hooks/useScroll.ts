import { isString } from 'lodash';
import { useEffect, useState } from 'react';
import { useDebounce, usePrevious, useWindowScroll } from 'react-use';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import useParams from 'components/useParams/useParams';

const useScroll = () => {
    const [scrollTop, setScrollTop] = useState<number | null>(null);
    const router = useRouter();
    const prevHash = usePrevious(window?.location?.hash || null);
    const { y: windowScrollY } = useWindowScroll();
    const prevWindowScrollY = usePrevious(windowScrollY);
    const pathname = usePathname();
    const params = useParams();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (!window || !document) {
            return;
        }
        const scrollToQuote = () => {
            const { hash } = window.location;
            const id = isString(hash) ? hash.replace('#', '') : null;

            if (id && document.getElementById(id)) {
                setScrollTop((document.getElementById(id)?.getBoundingClientRect()?.top ?? 0) + window.scrollY - 90);
            }
        };
        const { hash } = window.location;
        if (prevHash !== hash) {
            scrollToQuote();
        }
    }, [params, prevHash]);

    // start the scrolling
    useEffect(() => {
        if (scrollTop && scrollTop >= 0) {
            window.scrollTo({
                behavior: 'smooth',
                top: scrollTop,
            });
        }
    }, [scrollTop]);

    // remove the hash from the url when the user scrolls to a different position
    useEffect(() => {
        if (scrollTop === -1 && windowScrollY !== prevWindowScrollY && window.location.hash) {
            router.push(`${pathname}?${searchParams.toString()}`, { scroll: false });
        }
    }, [router, params, pathname, prevWindowScrollY, scrollTop, windowScrollY, searchParams]);

    // set scrollTop to -1 when window.scrollTo is finished
    useDebounce(
        () => {
            if (scrollTop) {
                setScrollTop(-1);
            }
        },
        100,
        [windowScrollY],
    );
};

export default useScroll;
