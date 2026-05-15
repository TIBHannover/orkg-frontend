import { FC } from 'react';
import { Position } from 'react-pdf-highlighter';

import useOntology from '@/components/PdfAnnotation/hooks/useOntology';

const DEFAULT_HIGHLIGHT_COLOR = '#FFE28F';

type HighlightProps = {
    position: Position;
    isScrolledTo: boolean;
    type: string | null;
};

const Highlight: FC<HighlightProps> = ({ position, isScrolledTo, type = null }) => {
    const { rects } = position;
    const { classes } = useOntology();
    const ontologyType = type ? classes.find((_class) => _class.iri === type) : undefined;
    const backgroundColor = ontologyType?.color ?? DEFAULT_HIGHLIGHT_COLOR;

    return (
        <div className={`cursor-pointer pointer-events-auto${isScrolledTo ? ' animate-[blinkAnimation_0.7s_1]' : ''}`}>
            {rects.map((rect) => (
                <div
                    key={`${rect.left}-${rect.top}-${rect.width}-${rect.height}`}
                    className="absolute pointer-events-auto cursor-pointer transition-colors duration-300"
                    style={{ ...rect, background: backgroundColor }}
                />
            ))}
        </div>
    );
};

export default Highlight;
