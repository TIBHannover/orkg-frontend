'use client';

import { LatLngTuple } from 'leaflet';
import { FC } from 'react';

import DynamicLeaflet from '@/components/ValuePlugins/Map/DynamicLeaflet';

const extractCoordinates = (value: string): LatLngTuple | null => {
    if (value?.startsWith('Point(') && value.endsWith(')')) {
        // Extract the coordinates from the string
        const coordinatesString = value.slice(6).slice(0, -1); // Remove "Point(" and ")"
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

export const isMapValue = (text: string) => !!extractCoordinates(text);

export type MapProps = {
    text: string;
};

const MapComponent: FC<MapProps> = ({ text }) => {
    if (!text) {
        return '';
    }

    const coordinates = extractCoordinates(text);

    if (coordinates) {
        return (
            <div style={{ height: '300px', minWidth: '300px' }}>
                <DynamicLeaflet coordinates={coordinates} />
            </div>
        );
    }
    return text;
};
export default MapComponent;
