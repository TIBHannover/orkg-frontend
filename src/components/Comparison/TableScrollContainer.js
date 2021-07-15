import { cloneElement, useEffect, useRef, useState } from 'react';
import { faArrowCircleLeft, faArrowCircleRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { debounce } from 'lodash';
import { ScrollSync } from 'react-scroll-sync';
import useResizeObserver from 'use-resize-observer';
import { ClickableScrollButton, ReactTableWrapper, ScrollButton } from './styled';
import PropTypes from 'prop-types';
import { useMedia } from 'react-use';

const SCROLL_AMOUNT = 500;

const TableScrollContainer = ({ children, className }) => {
    const [showBackButton, setShowBackButton] = useState(false);
    const [showNextButton, setShowNextButton] = useState(false);
    const scrollContainerBody = useRef(null);
    // can't use 'useMeasure' from 'react-use' because it doesn't allow setting a custom ref,
    // once merged: https://github.com/streamich/react-use/pull/1516, probably we can use that instead of use-resize-observer
    const { width: scrollContainerBodyWidth } = useResizeObserver({ ref: scrollContainerBody });
    const isSmallScreen = useMedia('(max-width: 576px)');

    const handleScrollCallback = debounce(rtBody => {
        if (!rtBody) {
            return;
        }
        const { scrollWidth, offsetWidth, scrollLeft } = rtBody;
        const _showBackButton = rtBody.scrollLeft !== 0;
        const _showNextButton = offsetWidth + scrollLeft !== scrollWidth;

        if (showBackButton !== _showBackButton || showNextButton !== _showNextButton) {
            setShowBackButton(_showBackButton);
            setShowNextButton(_showNextButton);
        }
    }, 100);

    // if the table body width changes: check if the scroll buttons should appear
    // (happens: on load, on add/remove contribution, full/reduce page width)
    useEffect(() => {
        handleScrollCallback(scrollContainerBody.current);
    }, [handleScrollCallback, scrollContainerBodyWidth]);

    const scrollNext = () => {
        const rtTable = scrollContainerBody.current;
        rtTable.scrollTo({
            top: 0,
            left: rtTable.scrollLeft + SCROLL_AMOUNT,
            behavior: 'smooth'
        });
    };

    const scrollBack = () => {
        const rtTable = scrollContainerBody.current;
        rtTable.scrollTo({
            top: 0,
            left: rtTable.scrollLeft - SCROLL_AMOUNT,
            behavior: 'smooth'
        });
    };

    return (
        <>
            <ReactTableWrapper className={className}>
                {showNextButton && <ClickableScrollButton className="right" onClick={scrollNext} />}
                {showBackButton && <ClickableScrollButton className="left" leftOffset={!isSmallScreen ? '250px' : 0} onClick={scrollBack} />}

                <ScrollSync onSync={handleScrollCallback}>{cloneElement(children, { scrollContainerBody })}</ScrollSync>
            </ReactTableWrapper>

            <div className="clearfix">
                {showBackButton && (
                    <ScrollButton color="link" onClick={scrollBack} className="back">
                        <Icon icon={faArrowCircleLeft} />
                    </ScrollButton>
                )}
                {showNextButton && (
                    <ScrollButton color="link" onClick={scrollNext} className="next">
                        <Icon icon={faArrowCircleRight} />
                    </ScrollButton>
                )}
            </div>
        </>
    );
};

TableScrollContainer.propTypes = {
    children: PropTypes.node.isRequired,
    className: PropTypes.string
};

TableScrollContainer.defaultProps = {
    className: ''
};

export default TableScrollContainer;
