import { Component } from 'react';
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

class ImageAsFigure extends Component {
    constructor(props) {
        super(props);
        // eslint-disable-next-line no-useless-escape
        this.expressionImage = new RegExp(/^(https):(\/\/[^"']*\.(?:png|jpg|jpeg|gif|svg))/i);
    }

    render() {
        const label = this.props.children;
        const labelToText = renderToString(label);
        if (!labelToText) {
            return '';
        }

        if (this.props.type === 'literal' && labelToText.match(this.expressionImage)) {
            // we found a image regex:
            return (
                <ImageContainer>
                    {/*add flow image link*/}
                    <a href={labelToText.indexOf('://') === -1 ? 'https://' + labelToText : labelToText} target="_blank" rel="noopener noreferrer">
                        <Image title="Figure" scrolling="no" src={labelToText} allowFullScreen />
                    </a>
                </ImageContainer>
            );
        } else {
            return label;
        }
    }
}

ImageAsFigure.propTypes = {
    children: PropTypes.oneOfType([PropTypes.string, PropTypes.object, PropTypes.node]).isRequired,
    type: PropTypes.oneOf(['resource', 'literal']),
    options: PropTypes.object.isRequired
};

ImageAsFigure.defaultProps = {
    options: { inModal: false }
};

export default ImageAsFigure;
