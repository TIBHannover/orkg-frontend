import { useMatomo } from '@datapunt/matomo-tracker-react';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import useList from 'components/List/hooks/useList';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert, Button, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';

const PublishModal = ({ id, show, toggle, listId }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [updateMessage, setUpdateMessage] = useState('');
    const [publishedId, setPublishedId] = useState(null);
    const { publishList } = useList();
    const { trackEvent } = useMatomo();

    const handlePublish = async () => {
        setIsLoading(true);
        const _publishedId = await publishList({ id, updateMessage, listId });
        setPublishedId(_publishedId);
        trackEvent({ category: 'data-entry', action: 'publish-list' });
        setIsLoading(false);
    };

    return (
        <Modal isOpen={show} toggle={toggle}>
            <ModalHeader toggle={toggle}>Publish list</ModalHeader>
            <ModalBody>
                <Alert color="info">
                    Once a list is published, the current state is saved and will be persistent over time. The update message is used to identify why
                    a version is published
                </Alert>
                {!publishedId ? (
                    <FormGroup>
                        <Label for="update-message">Update message</Label>
                        <Input
                            type="text"
                            id="update-message"
                            placeholder="Example: updated section order"
                            value={updateMessage}
                            onChange={e => setUpdateMessage(e.target.value)}
                        />
                    </FormGroup>
                ) : (
                    <Link to={reverse(ROUTES.LIST, { id: publishedId })} onClick={toggle}>
                        View the published list
                    </Link>
                )}
            </ModalBody>
            {!publishedId && (
                <ModalFooter>
                    <Button disabled={isLoading} color="primary" onClick={handlePublish}>
                        {!isLoading ? 'Publish' : <Icon icon={faSpinner} spin />}
                    </Button>
                </ModalFooter>
            )}
        </Modal>
    );
};

PublishModal.propTypes = {
    id: PropTypes.string.isRequired,
    toggle: PropTypes.func.isRequired,
    show: PropTypes.bool.isRequired,
    listId: PropTypes.string.isRequired
};

export default PublishModal;
