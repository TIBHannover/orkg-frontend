import useResizeObserver from '@react-hook/resize-observer';
import { debounce } from 'lodash';
import { UIEvent, useRef, useState } from 'react';

const useScrollSync = () => {
    const theadRef = useRef<HTMLTableSectionElement>(null);
    const tbodyRef = useRef<HTMLTableSectionElement>(null);
    const scrollbarRef = useRef<HTMLTableSectionElement>(null);

    const [scrollWidth, setScrollWidth] = useState(0);
    useResizeObserver(tbodyRef, () => {
        setScrollWidth(tbodyRef.current?.scrollWidth || 0);
    });

    // debounce to ensure the scroll event isn't trigger too often, which can cause performance issues
    // could possibly be optimized by removing the events listener when scrolling is performed:
    // http://github.com/okonet/react-scroll-sync/blob/master/src/ScrollSync.jsx#L128
    const syncScroll = debounce((event: UIEvent<HTMLTableSectionElement | HTMLDivElement>) => {
        const target = event.target as HTMLElement;
        if (!theadRef.current || !tbodyRef.current || !scrollbarRef.current) return;

        const { scrollLeft } = target;

        if (target !== theadRef.current) theadRef.current.scrollLeft = scrollLeft;
        if (target !== tbodyRef.current) tbodyRef.current.scrollLeft = scrollLeft;
        if (target !== scrollbarRef.current) scrollbarRef.current.scrollLeft = scrollLeft;
    }, 1);

    return {
        theadRef,
        tbodyRef,
        scrollbarRef,
        scrollWidth,
        syncScroll,
    };
};

export default useScrollSync;
