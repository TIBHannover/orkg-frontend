import { FC } from 'react';
import { Position } from 'react-pdf-highlighter';
import styled from 'styled-components';

import useOntology from '@/components/PdfAnnotation/hooks/useOntology';

const HighlightPart = styled.div`
    position: absolute;
    transition: 0.3s background;
    background: rgba(255, 226, 143, 1);
    cursor: pointer;
    pointer-events: auto;
`;

const HighlightWrapper = styled.div`
    cursor: pointer;
    pointer-events: auto;

    &.blink {
        animation: blinkAnimation 0.7s 1;
    }
    @keyframes blinkAnimation {
        0% {
            opacity: 1;
        }
        50% {
            opacity: 0;
        }
        100% {
            opacity: 1;
        }
    }
`;

type HighlightProps = {
    position: Position;
    isScrolledTo: boolean;
    type: string | null;
};

const Highlight: FC<HighlightProps> = ({ position, isScrolledTo, type = null }) => {
    const DEFAULT_HIGHLIGHT_COLOR = '#FFE28F';

    const { rects } = position;
    const { classes } = useOntology();
    const ontologyType = type ? classes.find((_class) => _class.iri === type) : undefined;
    const backgroundColor = ontologyType?.color ?? DEFAULT_HIGHLIGHT_COLOR;

    return (
        <HighlightWrapper className={isScrolledTo ? 'blink' : ''}>
            {rects.map((rect: any, index: number) => (
                <HighlightPart
                    key={index}
                    style={{
                        ...rect,
                        background: backgroundColor,
                    }}
                />
            ))}
        </HighlightWrapper>
    );
};

export default Highlight;
