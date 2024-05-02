import RelatedFigureModal from 'components/Comparison/ComparisonCarousel/RelatedResources/RelatedFigureModal/RelatedFigureModal';
import PropTypes from 'prop-types';
import { useState } from 'react';
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
            <Card className="overflow-hidden" style={{ cursor: 'pointer' }} onClick={() => setIsOpen(true)}>
                <CardImg top width="100%" height="120px" src={src} alt={`Thumbnail: ${title}`} />
            </Card>

            {isOpen && <RelatedFigureModal toggle={() => setIsOpen((v) => !v)} src={src} title={title} description={description} />}
        </div>
    );
};

RelatedFigure.propTypes = {
    src: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
};

export default RelatedFigure;
