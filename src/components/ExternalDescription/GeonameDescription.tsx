import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image from 'next/image';
import { FC } from 'react';
import useSWR from 'swr';

import GEONAMES_LOGO from '@/assets/img/sameas/geonames.png';
import { CoordinatesDisplay } from '@/components/ExternalDescription/CoordinatesDisplay';
import { getById } from '@/services/geoNames';

type GeonameDescriptionProps = {
    externalResourceUrl: string;
};

const GeonameDescription: FC<GeonameDescriptionProps> = ({ externalResourceUrl }) => {
    const extractIdFromUrl = (urlString: string) => {
        // Split the URL by the slash and remove any empty strings
        // from the end (which occur if there's a trailing slash)
        const segments = urlString.split('/').filter((segment) => segment);

        // Return the last element of the resulting array
        return segments.pop();
    };

    const id = extractIdFromUrl(externalResourceUrl);
    const { data: coordinates, error, isLoading } = useSWR(id || null, getById);

    return (
        <div>
            <div className="d-flex justify-content-between">
                <h2 className="h5">Statements from Geonames</h2>
                <a href={externalResourceUrl} target="_blank" rel="noopener noreferrer">
                    <Image alt="Geonames logo" src={GEONAMES_LOGO} style={{ height: 40, width: 120 }} />
                </a>
            </div>
            {isLoading && (
                <div className="text-center">
                    <FontAwesomeIcon icon={faSpinner} spin /> Loading
                </div>
            )}
            {error && <p className="text-center">Failed loading Geonames statements</p>}
            {coordinates && <CoordinatesDisplay coordinates={coordinates} />}
        </div>
    );
};

export default GeonameDescription;
