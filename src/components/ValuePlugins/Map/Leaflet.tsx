'use client';

import { FC } from 'react';
import { AttributionControl, MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { LatLngTuple } from 'leaflet';

type LeafletProps = {
    coordinates: LatLngTuple;
};

const Leaflet: FC<LeafletProps> = ({ coordinates }) => {
    return (
        <MapContainer style={{ height: '100%', width: '100%' }} center={coordinates} zoom={8} scrollWheelZoom={false} attributionControl={false}>
            <AttributionControl position="bottomright" prefix={false} />
            <TileLayer
                attribution='&copy; <a target="_blank" href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={coordinates}>
                <Popup>
                    <div>{`Latitude: ${coordinates[0]}`}</div>
                    <div>{`Longitude: ${coordinates[1]}`}</div>
                </Popup>
            </Marker>
        </MapContainer>
    );
};

export default Leaflet;
