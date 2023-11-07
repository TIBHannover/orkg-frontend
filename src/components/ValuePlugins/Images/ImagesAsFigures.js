import { ENTITIES } from 'constants/graphSettings';
import REGEX from 'constants/regex';
import PropTypes from 'prop-types';
import { renderToString } from 'react-dom/server';
import styled from 'styled-components';

const ImageContainer = styled.div`
    position: relative;
`;

const Image = styled.img`
    top: 0;
    left: 0;
    width: 100%;
    height: auto;
    border: 0;
`;

const ImageAsFigure = ({ type, children }) => {
    const label = children;
    const labelToText = renderToString(label);
    if (!labelToText) {
        return '';
    }

    if (type === ENTITIES.LITERAL && labelToText.match(new RegExp(REGEX.IMAGE_URL))) {
        // we found a image regex:
        return (
            <ImageContainer>
                {/* add flow image link */}
                <a href={labelToText.indexOf('://') === -1 ? `https://${labelToText}` : labelToText} target="_blank" rel="noopener noreferrer">
                    <Image title="Figure" scrolling="no" src={labelToText} allowFullScreen />
                </a>
            </ImageContainer>
        );
    }
    return label;
};

ImageAsFigure.propTypes = {
    children: PropTypes.oneOfType([PropTypes.string, PropTypes.object, PropTypes.node]).isRequired,
    type: PropTypes.oneOf([ENTITIES.RESOURCE, ENTITIES.LITERAL]),
};

export default ImageAsFigure;
