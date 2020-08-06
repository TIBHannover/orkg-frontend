import React, { Component } from 'react';
import styled from 'styled-components';
import useOntology from 'components/PdfTextAnnotation/hooks/useOntology';

const HighlightPart = styled.div`
    cursor: pointer;
    position: absolute;
    transition: 0.3s background;
    background: rgba(255, 226, 143, 1);
`;

const HighlightWrapper = styled.div`
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

const Highlight = props => {
    const DEFAULT_HIGHLIGHT_COLOR = '#FFE28F';
    const { position, onClick, onMouseOver, onMouseOut, isScrolledTo, type } = props;

    const { rects, boundingRect } = position;
    const { classes } = useOntology();
    const ontologyType = classes.find(_class => _class.iri === type);
    const backgroundColor = ontologyType.color ?? DEFAULT_HIGHLIGHT_COLOR;
    console.log('isScrolledTo', isScrolledTo);
    return (
        <HighlightWrapper className={`Highlight ${isScrolledTo ? 'blink' : ''}`}>
            <div className="Highlight__parts">
                {rects.map((rect, index) => (
                    <HighlightPart
                        onMouseOver={onMouseOver}
                        onMouseOut={onMouseOut}
                        onClick={onClick}
                        key={index}
                        style={{ ...rect, background: backgroundColor }}
                    />
                ))}
            </div>
        </HighlightWrapper>
    );
};

export default Highlight;
