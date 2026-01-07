import React from 'react';
import type { ViewportHighlight } from 'react-pdf-highlighter';
import styled from 'styled-components';

const AreaHighlightContainer = styled.div.withConfig({
    shouldForwardProp: (prop) => prop !== 'isScrolledTo',
})<{ isScrolledTo: boolean }>`
    position: absolute;
    border: 2px solid #007acc;
    background-color: rgba(0, 122, 204, 0.1);
    user-select: none;
    box-sizing: border-box;
    cursor: pointer;

    /* Ensure hover events work properly */
    pointer-events: auto;

    /* Add invisible padding to create a larger hover area for better stability */
    &::before {
        content: '';
        position: absolute;
        top: -5px;
        left: -5px;
        right: -5px;
        bottom: -5px;
        pointer-events: auto;
    }

    /* Add hover effect to indicate interactivity */
    &:hover {
        border-color: #0056b3;
        background-color: rgba(0, 122, 204, 0.2);
    }

    ${(props) =>
        props.isScrolledTo &&
        `
        border-color: #ff6b6b;
        background-color: rgba(255, 107, 107, 0.2);
        animation: blink 0.7s 1;
        @keyframes blink {
            0% { opacity: 1; }
            50% { opacity: 0; }
            100% { opacity: 1; }
        }
    `}
`;

type CustomAreaHighlightProps = {
    highlight: ViewportHighlight & { id: string };
    isScrolledTo?: boolean;
};

export const CustomAreaHighlight: React.FC<CustomAreaHighlightProps> = ({ highlight, isScrolledTo }) => {
    const { boundingRect } = highlight.position;
    const handleMouseEvents = (event: React.MouseEvent) => {
        // Don't stop propagation for hover events, but prevent default click behavior
        // This allows the popup hover detection to work while preventing unwanted click actions
        if (event.type === 'click') {
            event.preventDefault();
            // Don't stop propagation to allow popup events to bubble up
        }
    };

    return (
        <AreaHighlightContainer
            isScrolledTo={isScrolledTo ?? false}
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
        />
    );
};

export default CustomAreaHighlight;
