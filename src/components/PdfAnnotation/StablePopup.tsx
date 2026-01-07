import React, { useCallback, useRef } from 'react';

interface StablePopupProps {
    children: React.ReactElement;
    popupContent: React.ReactElement;
    onMouseOver: (popupContent: React.ReactElement) => void;
    onMouseOut: () => void;
    isAreaHighlight?: boolean;
}

/**
 * A wrapper around the popup that provides more stable hover behavior,
 * especially for area highlights
 */
const StablePopup: React.FC<StablePopupProps> = ({ children, popupContent, onMouseOver, onMouseOut, isAreaHighlight = false }) => {
    const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleMouseEnter = useCallback(() => {
        // Clear any pending hide timeout
        if (hideTimeoutRef.current) {
            clearTimeout(hideTimeoutRef.current);
            hideTimeoutRef.current = null;
        }

        onMouseOver(popupContent);
    }, [popupContent, onMouseOver, isAreaHighlight]);

    const handleMouseLeave = useCallback(() => {
        // Use different delays based on highlight type
        const delay = isAreaHighlight ? 1000 : 300; // Much longer delay for area highlights

        hideTimeoutRef.current = setTimeout(() => {
            onMouseOut();
            hideTimeoutRef.current = null;
        }, delay);
    }, [onMouseOut, isAreaHighlight]);

    return (
        <div
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{
                display: 'inline-block',
                // Add a small buffer around area highlights
                ...(isAreaHighlight && {
                    padding: '2px',
                    margin: '-2px',
                }),
            }}
        >
            {children}
        </div>
    );
};

export default StablePopup;
