import { useState, useEffect, useRef, useCallback } from 'react';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faArrowCircleLeft, faArrowCircleRight } from '@fortawesome/free-solid-svg-icons';
import useResizeObserver from 'use-resize-observer';
import PropTypes from 'prop-types';

const PreviewCarouselComponent = props => {
    const carouselRef = useRef(null);
    const [showArrowLeft, setShowArrowLeft] = useState(false);
    const [showArrowRight, setShowArrowRight] = useState(false);
    // can't use 'useMeasure' from 'react-use' because it doesn't allow setting a custom ref,
    // once merged: https://github.com/streamich/react-use/pull/1516, probably we can use that instead of use-resize-observer
    const { width: scrollContainerBodyWidth } = useResizeObserver({ ref: carouselRef });
    const childWidth = 215;

    const executeUpdates = () => {
        const item = carouselRef.current;
        const areaWidth = item.scrollWidth;
        const { clientWidth } = item;
        const left = item.scrollLeft;
        const leftMax = item.scrollLeftMax;
        const needUpdate = clientWidth < areaWidth;
        if (needUpdate || (showArrowLeft || showArrowRight)) {
            handleLeftArrowShow(left);
            handleRightArrowShow(left, leftMax);
        }
    };

    const handleRightArrowShow = (left, max) => {
        setShowArrowRight(left !== max);
    };

    const handleLeftArrowShow = val => {
        setShowArrowLeft(val > 0);
    };

    const handleScrollLeft = () => {
        const item = carouselRef.current;
        item.scrollTo({
            top: 0,
            left: item.scrollLeft - childWidth,
            behavior: 'smooth',
        });
    };
    const handleScrollRight = () => {
        const item = carouselRef.current;
        item.scrollTo({
            top: 0,
            left: item.scrollLeft + childWidth,
            behavior: 'smooth',
        });
    };

    const executeWheelEvent = useCallback(
        event => {
            // wheel event has two semantics;
            // 1) when we don't have enough space to render all cards, the wheel event will be blocked on the main widget
            // and executed in the preview component. This is checked by testing if the arrow buttons are rendered;
            // 2) otherwise we have a normal wheel event on the main widget, and the page scrolls down.
            if (showArrowLeft || showArrowRight) {
                event.preventDefault();
                if (event.deltaY > 0) {
                    handleScrollLeft();
                } else {
                    handleScrollRight();
                }
            }
        },
        [showArrowLeft, showArrowRight],
    );

    // just a wrapper function for better code reading
    const resizeEvent = () => {
        executeUpdates();
    };

    useEffect(() => {
        const el = carouselRef.current;
        if (el) {
            el.executeUpdates = executeUpdates;
            // add resize event
            window.addEventListener('resize', resizeEvent);
            // add scroll event
            el.addEventListener('wheel', executeWheelEvent);
            return function cleanupListener() {
                window.removeEventListener('resize', resizeEvent);
                el.removeEventListener('wheel', executeWheelEvent);
            };
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showArrowRight, showArrowRight]);

    useEffect(() => {
        executeUpdates();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [scrollContainerBodyWidth]);

    return (
        <div style={{ paddingTop: '10px', height: '200px' }}>
            <h2 className="h5 mb-2 mt-2">Visualizations</h2>
            <div
                onScroll={() => executeUpdates()}
                ref={carouselRef}
                id="PreviewCarouselContainer"
                style={{ display: 'flex', width: '100%', overflowX: 'hidden' }}
            >
                {props.children}
            </div>
            <div style={{ display: 'block', height: '35px' }}>
                {showArrowLeft && (
                    <button
                        style={{ background: 'none', border: 'none', marginTop: '5px', position: 'relative', float: 'left', cursor: 'pointer' }}
                        onClick={() => {
                            handleScrollLeft();
                        }}
                    >
                        <Icon icon={faArrowCircleLeft} className="text-primary" style={{ fontSize: 25 }} />
                    </button>
                )}
                {showArrowRight && (
                    <button
                        style={{ background: 'none', border: 'none', marginTop: '5px', position: 'relative', float: 'right', cursor: 'pointer' }}
                        onClick={() => {
                            handleScrollRight();
                        }}
                    >
                        <Icon icon={faArrowCircleRight} className="text-primary " style={{ fontSize: 25 }} />
                    </button>
                )}
            </div>
        </div>
    );
};

PreviewCarouselComponent.propTypes = {
    children: PropTypes.any,
};

export default PreviewCarouselComponent;
