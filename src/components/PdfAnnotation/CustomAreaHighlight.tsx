import React from 'react';
import type { ViewportHighlight } from 'react-pdf-highlighter';

type CustomAreaHighlightProps = {
    highlight: ViewportHighlight & { id: string };
    isScrolledTo?: boolean;
};

export const CustomAreaHighlight: React.FC<CustomAreaHighlightProps> = ({ highlight, isScrolledTo }) => {
    const { boundingRect } = highlight.position;

    const handleMouseEvents = (event: React.MouseEvent) => {
        if (event.type === 'click') {
            event.preventDefault();
        }
    };

    const baseClasses = 'absolute box-border cursor-pointer select-none border-2 pointer-events-auto';
    const stateClasses = isScrolledTo
        ? 'border-accent bg-accent/20 animate-[blinkAnimation_0.7s_1]'
        : 'border-focus bg-focus/10 hover:bg-focus/20 hover:border-focus';

    return (
        <div
            className={`${baseClasses} ${stateClasses}`}
            style={{
                left: boundingRect.left,
                top: boundingRect.top,
                width: boundingRect.width,
                height: boundingRect.height,
            }}
            data-testid="custom-area-highlight"
            data-highlight-id={highlight.id}
            onClick={handleMouseEvents}
            onMouseDown={handleMouseEvents}
        >
            {/* Invisible 5px hover buffer for stability */}
            <span aria-hidden className="absolute -inset-[5px] pointer-events-auto" />
        </div>
    );
};

export default CustomAreaHighlight;
