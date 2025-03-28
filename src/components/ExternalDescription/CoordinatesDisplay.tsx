import { FC } from 'react';
import { Row } from 'reactstrap';

import { PropertyStyle, StatementsGroupStyle, ValuesStyle } from '@/components/StatementBrowser/styled';
import ValuePlugins from '@/components/ValuePlugins/ValuePlugins';
import { ENTITIES } from '@/constants/graphSettings';
import { Coordinates } from '@/services/geoNames';

export type CoordinateDisplayProps = {
    coordinates?: Coordinates;
};

export const CoordinatesDisplay: FC<CoordinateDisplayProps> = ({ coordinates }) => {
    const location = coordinates?.long && coordinates?.lat ? `Point(${coordinates?.long} ${coordinates?.lat})` : null;

    return (
        <StatementsGroupStyle className="row gx-0 p-3 border rounded">
            <Row className="row gx-0">
                <PropertyStyle className="col-4">
                    <div>Coordinate location</div>
                </PropertyStyle>
                <ValuesStyle className="col-8 valuesList">
                    {location && <ValuePlugins type={ENTITIES.LITERAL}>{location}</ValuePlugins>}
                    {!location && <i>Failed to load coordinates</i>}
                </ValuesStyle>
            </Row>
        </StatementsGroupStyle>
    );
};

export default CoordinatesDisplay;
