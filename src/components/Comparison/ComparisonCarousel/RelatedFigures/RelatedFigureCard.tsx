import RelatedFigureModal from 'components/Comparison/ComparisonCarousel/RelatedFigures/RelatedFigureModal/RelatedFigureModal';
import { FC, useState } from 'react';
import { Card, CardImg } from 'reactstrap';
import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
    .ril__image.ril-image-current:not(.ril-not-loaded) {
        background: #fff;
    }
`;

type RelatedFigureCardProps = {
    src?: string;
    title?: string;
    description?: string;
};

const RelatedFigureCard: FC<RelatedFigureCardProps> = ({ src = '', title = '', description = '' }) => {
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

export default RelatedFigureCard;
