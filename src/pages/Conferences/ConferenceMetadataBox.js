import PropTypes from 'prop-types';
import { faExternalLinkAlt, faGlobe } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { CONFERENCE_REVIEW_TYPE } from 'constants/organizationsTypes';

function ConferenceMetadataBox({ url, metadata, isLoading }) {
    return (
        <div className="box rounded-3 p-3 flex-grow-1">
            <h5>Conference information </h5>

            {!isLoading ? (
                <div className="mb-4 mt-4">
                    <a className="p-0 mt-2" href={url} target="_blank" rel="noopener noreferrer">
                        <Icon size="sm" icon={faGlobe} /> {url} {url && <Icon size="sm" icon={faExternalLinkAlt} />}
                    </a>
                    <br />
                    <b>Conference date</b>: {metadata.start_date}
                    <br />
                    <b>Review process</b>: {CONFERENCE_REVIEW_TYPE.find(t => t.id === metadata.review_process)?.label}
                </div>
            ) : (
                <div className="text-center mt-4 mb-4">Loading conference information ...</div>
            )}
        </div>
    );
}

ConferenceMetadataBox.propTypes = {
    url: PropTypes.string,
    metadata: PropTypes.object,
    isLoading: PropTypes.bool.isRequired,
};

export default ConferenceMetadataBox;
