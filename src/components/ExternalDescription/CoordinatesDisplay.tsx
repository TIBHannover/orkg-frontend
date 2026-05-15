import { FC } from 'react';

import { PropertyStyle, StatementsGroupStyle, ValuesStyle } from '@/components/StatementBrowser/styled';
import Row from '@/components/Ui/Structure/Row';
import ValuePlugins from '@/components/ValuePlugins/ValuePlugins';
import { ENTITIES } from '@/constants/graphSettings';
import { Coordinates } from '@/services/geoNames';

export type CoordinateDisplayProps = {
    coordinates?: Coordinates;
};

export const CoordinatesDisplay: FC<CoordinateDisplayProps> = ({ coordinates }) => {
    const location = coordinates?.long && coordinates?.lat ? `Point(${coordinates?.long} ${coordinates?.lat})` : null;

    return (
        <StatementsGroupStyle className="flex flex-wrap items-stretch gap-x-0 p-4 border rounded">
            <Row className="flex flex-wrap items-stretch gap-x-0">
                <PropertyStyle className="shrink-0 grow-0 w-4/12 basis-4/12 max-w-4/12">
                    <div>Coordinate location</div>
                </PropertyStyle>
                <ValuesStyle className="shrink-0 grow-0 w-8/12 basis-8/12 max-w-8/12 valuesList">
                    {location && <ValuePlugins type={ENTITIES.LITERAL}>{location}</ValuePlugins>}
                    {!location && <i>Failed to load coordinates</i>}
                </ValuesStyle>
            </Row>
        </StatementsGroupStyle>
    );
};

export default CoordinatesDisplay;
