import PropTypes from 'prop-types';
import { useState } from 'react';
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';
import { Card, CardImg } from 'reactstrap';
import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
    .ril__image.ril-image-current:not(.ril-not-loaded) {
        background: #fff;
    }
`;

const RelatedFigure = ({ src = '', title = '', description = '' }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="w-100 mx-1">
            <GlobalStyle />
            <Card className="overflow-hidden" style={{ cursor: 'pointer' }} onClick={() => setIsOpen(v => !v)}>
                <CardImg top width="100%" height="120px" src={src} alt={`Thumbnail: ${title}`} />
            </Card>

            {isOpen && (
                <Lightbox
                    mainSrc={src}
                    imageTitle={title}
                    imageCaption={description}
                    onCloseRequest={() => setIsOpen(false)}
                    reactModalStyle={{ overlay: { zIndex: 1050 } }}
                />
            )}
        </div>
    );
};

RelatedFigure.propTypes = {
    src: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
};

export default RelatedFigure;
