import capitalize from 'capitalize';
import { FC } from 'react';
import { PropertyShape } from 'services/backend/types';
import styled from 'styled-components';

const PositionCardStyled = styled.div`
    background-color: white;
    border-radius: 4px;
    border: 2px solid ${(props) => props.color};
`;

const PlaceholderStyled = styled.div`
    color: white;
    background: ${(props) => props.color};
`;

type PositionCardProps = {
    index: number;
    property: PropertyShape;
    type: string;
    color?: string;
};

const PositionCard: FC<PositionCardProps> = ({ property, index, type, color }) => {
    return (
        <PositionCardStyled color={color} className="me-1 my-1 flex-shrink-0 d-flex">
            {property.preposition && <div className="mx-1 px-1">{property.preposition}</div>}
            <PlaceholderStyled color={color} className="px-1">
                {property.placeholder ? property.placeholder : `${capitalize(type)} ${index !== 0 && index !== 1 ? index - 1 : ''}`}
            </PlaceholderStyled>
            {property.postposition && <div className="mx-1 px-1">{property.postposition}</div>}
        </PositionCardStyled>
    );
};

export default PositionCard;
