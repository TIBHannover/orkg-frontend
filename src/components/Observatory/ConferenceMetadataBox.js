import PropTypes from 'prop-types';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import { Link } from 'react-router-dom';
import AddOrganization from 'components/Observatory/AddOrganization';
import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { Button } from 'reactstrap';
import { faPlus, faTrash, faCheck, faTimes, faExternalLinkAlt, faGlobe } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { toast } from 'react-toastify';
import StatementActionButton from 'components/StatementBrowser/StatementActionButton/StatementActionButton';
import { deleteOrganizationFromObservatory } from 'services/backend/observatories';

const ConferenceMetadataBox = ({ url, metadata, isLoading }) => {
    const user = useSelector(state => state.auth.user);
    const [showAddOrganizationDialog, setShowAddOrganizationDialog] = useState(false);
    const [organizations, setOrganizations] = useState([]);

    useEffect(() => {}, []);

    return (
        <div className="box rounded-3 p-3 flex-grow-1">
            <h5>Conference information </h5>

            {!isLoading ? (
                <div className="mb-4 mt-4">
                    <a className="p-0 mt-2" href={url} target="_blank" rel="noopener noreferrer">
                        <Icon size="sm" icon={faGlobe} /> {url} {url && <Icon size="sm" icon={faExternalLinkAlt} />}
                    </a>
                    <br />
                    <b>Conference date</b>: {metadata.date}
                    <br />
                    <b>Review process</b>: {metadata.is_double_blind ? 'Double-blind' : 'Single-blind'}
                </div>
            ) : (
                <div className="text-center mt-4 mb-4">Loading conference information ...</div>
            )}
        </div>
    );
};

ConferenceMetadataBox.propTypes = {
    url: PropTypes.string,
    metadata: PropTypes.array,
    isLoading: PropTypes.bool.isRequired,
};

export default ConferenceMetadataBox;
