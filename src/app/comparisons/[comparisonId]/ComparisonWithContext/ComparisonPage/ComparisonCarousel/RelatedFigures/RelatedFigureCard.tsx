import { Card } from '@heroui/react';
import { FC, useState } from 'react';

import RelatedFigureModal from '@/app/comparisons/[comparisonId]/ComparisonWithContext/ComparisonPage/ComparisonCarousel/RelatedFigures/RelatedFigureModal/RelatedFigureModal';

type RelatedFigureCardProps = {
    src?: string;
    title?: string;
    description?: string;
};

const RelatedFigureCard: FC<RelatedFigureCardProps> = ({ src = '', title = '', description = '' }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="w-full mx-1">
            <Card
                className="h-[122px] p-0 overflow-hidden cursor-pointer border border-default-200 hover:border-primary transition-colors"
                onClick={() => setIsOpen(true)}
            >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={`Thumbnail: ${title}`} className="w-full h-full object-cover" />
            </Card>
            {isOpen && <RelatedFigureModal toggle={() => setIsOpen((v) => !v)} src={src} title={title} description={description} />}
        </div>
    );
};

export default RelatedFigureCard;
