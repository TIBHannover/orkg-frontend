import { faExternalLinkAlt, faGlobe } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CONFERENCE_REVIEW_TYPE } from 'constants/organizationsTypes';
import { FC } from 'react';

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
        <div className="box rounded-3 p-3 flex-grow-1">
            <h5>Conference information </h5>

            {!isLoading ? (
                <div className="mb-4 mt-4">
                    <a className="p-0 mt-2" href={url} target="_blank" rel="noopener noreferrer">
                        <FontAwesomeIcon size="sm" icon={faGlobe} /> {url} {url && <FontAwesomeIcon size="sm" icon={faExternalLinkAlt} />}
                    </a>
                    <br />
                    <b>Conference date</b>: {metadata.start_date}
                    <br />
                    <b>Review process</b>: {CONFERENCE_REVIEW_TYPE.find((t) => t.id === metadata.review_process)?.label}
                </div>
            ) : (
                <div className="text-center mt-4 mb-4">Loading conference information ...</div>
            )}
        </div>
    );
};

export default ConferenceMetadataBox;
