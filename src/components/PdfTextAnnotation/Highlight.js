import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import useOntology from 'components/PdfTextAnnotation/hooks/useOntology';

const HighlightPart = styled.div`
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
    const { position, isScrolledTo, type } = props;

    const { rects } = position;
    const { classes } = useOntology();
    const ontologyType = type ? classes.find(_class => _class.iri === type) : {};
    const backgroundColor = ontologyType.color ?? DEFAULT_HIGHLIGHT_COLOR;

    return (
        <HighlightWrapper className={isScrolledTo ? 'blink' : ''}>
            {rects.map((rect, index) => (
                <HighlightPart key={index} style={{ ...rect, background: backgroundColor }} />
            ))}
        </HighlightWrapper>
    );
};

Highlight.propTypes = {
    position: PropTypes.object.isRequired,
    isScrolledTo: PropTypes.bool.isRequired,
    type: PropTypes.string
};

Highlight.defaultProps = {
    type: null
};

export default Highlight;
