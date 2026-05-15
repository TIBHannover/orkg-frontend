import capitalize from 'capitalize';
import { FC } from 'react';

import { RSPropertyShape } from '@/services/backend/types';

type PositionCardProps = {
    index: number;
    property: RSPropertyShape;
    type: string;
    color?: string;
};

const PositionCard: FC<PositionCardProps> = ({ property, index, type, color }) => (
    <div className="flex shrink-0 items-center overflow-hidden rounded border-2 bg-surface text-sm" style={{ borderColor: color }}>
        {property.preposition && <div className="px-2 py-1 text-foreground">{property.preposition}</div>}
        <div className="px-2 py-1 font-medium text-white" style={{ backgroundColor: color }}>
            {property.placeholder ? property.placeholder : `${capitalize(type)} ${index !== 0 && index !== 1 ? index - 1 : ''}`}
        </div>
        {property.postposition && <div className="px-2 py-1 text-foreground">{property.postposition}</div>}
    </div>
);

export default PositionCard;
