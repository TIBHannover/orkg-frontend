import Link from 'components/NextJsMigration/Link';
import { useMatomo } from '@jonkoops/matomo-tracker-react';
import useList from 'components/List/hooks/useList';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { Alert, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import ButtonWithLoading from 'components/ButtonWithLoading/ButtonWithLoading';
import { MAX_LENGTH_INPUT } from 'constants/misc';

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
                            onChange={(e) => setUpdateMessage(e.target.value)}
                            maxLength={MAX_LENGTH_INPUT}
                        />
                    </FormGroup>
                ) : (
                    <Link href={reverse(ROUTES.LIST, { id: publishedId })} onClick={toggle}>
                        View the published list
                    </Link>
                )}
            </ModalBody>
            {!publishedId && (
                <ModalFooter>
                    <ButtonWithLoading isLoading={isLoading} color="primary" onClick={handlePublish}>
                        Publish
                    </ButtonWithLoading>
                </ModalFooter>
            )}
        </Modal>
    );
};

PublishModal.propTypes = {
    id: PropTypes.string.isRequired,
    toggle: PropTypes.func.isRequired,
    show: PropTypes.bool.isRequired,
    listId: PropTypes.string.isRequired,
};

export default PublishModal;
