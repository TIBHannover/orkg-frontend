import { faExternalLinkAlt, faGlobe } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FC } from 'react';

import { CONFERENCE_REVIEW_TYPE } from '@/constants/organizationsTypes';

type ConferenceMetadataBoxProps = {
    url: string;
    metadata: {
        start_date: string;
        review_process: string;
    };
    isLoading: boolean;
};

const ConferenceMetadataBox: FC<ConferenceMetadataBoxProps> = ({ url, metadata, isLoading }) => {
    return (
        <div className="box rounded-lg p-4 grow flex flex-col">
            <h5>Conference information</h5>
            {!isLoading ? (
                <div className="mt-3 flex flex-col gap-4 text-sm">
                    {url && (
                        <a href={url} target="_blank" rel="noopener noreferrer" className="break-all hover:underline">
                            <FontAwesomeIcon size="sm" icon={faGlobe} className="mr-2" />
                            {url}
                            <FontAwesomeIcon size="sm" icon={faExternalLinkAlt} className="ml-1" />
                        </a>
                    )}
                    <div>
                        <b>Conference date</b>: {metadata.start_date}
                    </div>
                    <div>
                        <b>Review process</b>: {CONFERENCE_REVIEW_TYPE.find((t) => t.id === metadata.review_process)?.label}
                    </div>
                </div>
            ) : (
                <div className="text-center my-6">Loading conference information ...</div>
            )}
        </div>
    );
};

export default ConferenceMetadataBox;
