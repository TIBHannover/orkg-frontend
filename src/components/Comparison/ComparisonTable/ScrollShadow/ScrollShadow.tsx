import useResizeObserver from '@react-hook/resize-observer';
import { debounce } from 'lodash';
import { FC, ReactNode, RefObject, useState } from 'react';
import { useEvent } from 'react-use';

const SCROLL_AMOUNT = 500;

type ScrollShadowProps = {
    children: ReactNode;
    tbodyRef: RefObject<HTMLTableSectionElement | null>;
};

const ScrollShadow: FC<ScrollShadowProps> = ({ children, tbodyRef }) => {
    const [showBackButton, setShowBackButton] = useState(false);
    const [showNextButton, setShowNextButton] = useState(false);

    const handleScroll = debounce((target) => {
        if (!target) {
            return;
        }

        const { scrollWidth, offsetWidth, scrollLeft } = target;
        const _showBackButton = target.scrollLeft !== 0;
        const _showNextButton = offsetWidth + scrollLeft !== scrollWidth;

        if (showBackButton !== _showBackButton || showNextButton !== _showNextButton) {
            setShowBackButton(_showBackButton);
            setShowNextButton(_showNextButton);
        }
    }, 10);

    useResizeObserver(tbodyRef, () => {
        handleScroll(tbodyRef.current);
    });

    useEvent('scroll', (e) => handleScroll(e.target), tbodyRef.current);

    const scrollNext = () => {
        const table = tbodyRef.current;
        if (!table) {
            return;
        }
        table.scrollTo({
            top: 0,
            left: table.scrollLeft + SCROLL_AMOUNT,
            behavior: 'smooth',
        });
    };

    const scrollBack = () => {
        const table = tbodyRef.current;
        if (!table) {
            return;
        }
        table.scrollTo({
            top: 0,
            left: table.scrollLeft - SCROLL_AMOUNT,
            behavior: 'smooth',
        });
    };

    return (
        <>
            <div className="tw:[&>button]:w-[30px] tw:[&>button]:border-0 tw:[&>button]:absolute tw:[&>button]:z-30 tw:[&>button]:bg-transparent tw:[&>button]:transition-shadow tw:[&>button]:duration-500 tw:[&>button]:top-0  tw:[&>button]:outline-0">
                {showBackButton && (
                    <button
                        type="button"
                        className="tw:!cursor-pointer tw:left-[250px] tw:h-[calc(100%-12px)] tw:!shadow-[inset_9px_0px_5px_-5px_rgba(0,_0,_0,_0.18)] tw:hover:!shadow-[inset_13px_0px_5px_-5px_rgba(0,_0,_0,_0.25)]"
                        onClick={scrollBack}
                        aria-label="scroll to the left"
                        tabIndex={-1}
                    />
                )}
                {showNextButton && (
                    <button
                        type="button"
                        className="tw:!cursor-pointer tw:right-0 tw:h-[calc(100%-2px)] tw:!shadow-[inset_-9px_0px_5px_-5px_rgba(0,_0,_0,_0.18)] tw:hover:!shadow-[inset_-13px_0px_5px_-5px_rgba(0,_0,_0,_0.25)]"
                        onClick={scrollNext}
                        aria-label="scroll to the right"
                        tabIndex={-1}
                    />
                )}
            </div>

            {children}
        </>
    );
};

export default ScrollShadow;
