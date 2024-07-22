'use client';

import DynamicLeaflet from 'components/ValuePlugins/Map/DynamicLeaflet';
import { ENTITIES } from 'constants/graphSettings';
import { LatLngTuple } from 'leaflet';
import { FC, ReactElement, ReactNode } from 'react';
import { renderToString } from 'react-dom/server';
import { EntityType } from 'services/backend/types';

// Plugin to display map

export type MapProps = {
    children: ReactNode;
    type: EntityType;
};

const MapComponent: FC<MapProps> = ({ children, type }) => {
    const label = children;
    const labelToText = renderToString(label as ReactElement);

    if (!labelToText) {
        return '';
    }

    const extractCoordinates = (value: string): LatLngTuple | null => {
        if (value?.startsWith('Point(') && value.endsWith(')')) {
            // Extract the coordinates from the string
            const coordinatesString = labelToText.slice(6).slice(0, -1); // Remove "Point(" and ")"
            const coordinates = coordinatesString.split(' ').map(String);
            const longitude = coordinates[0];
            const latitude = coordinates[1];
            if (longitude && latitude) {
                return [parseFloat(latitude), parseFloat(longitude)];
            }
            return null;
        }
        return null;
    };

    const coordinates = extractCoordinates(labelToText);

    if ((type === ENTITIES.LITERAL || type === ENTITIES.RESOURCE) && coordinates) {
        return (
            <div style={{ height: '300px', minWidth: '300px' }}>
                <DynamicLeaflet coordinates={coordinates} />
            </div>
        );
    }
    return label;
};
export default MapComponent;
