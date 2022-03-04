import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { Alert, Button, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { createLiteralStatement, createResourceStatement, getStatementsBundleBySubject } from 'services/backend/statements';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { createResource } from 'services/backend/resources';
import { createLiteral } from 'services/backend/literals';
import { CLASSES, PREDICATES } from 'constants/graphSettings';
import { createResourceData } from 'services/similarity';
import { toast } from 'react-toastify';
import { reverse } from 'named-urls';
import routes from 'constants/routes';
import { Link } from 'react-router-dom';
import { setVersions } from 'actions/review';
import { useDispatch } from 'react-redux';

const PublishModal = ({ id, show, toggle, getVersions, paperId }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [updateMessage, setUpdateMessage] = useState('');
    const [publishedId, setPublishedId] = useState(null);
    const dispatch = useDispatch();

    const handlePublish = async () => {
        setIsLoading(true);

        try {
            const { statements } = await getStatementsBundleBySubject({
                id
            });
            const paperTitle = statements.find(statement => statement.subject.id === id).subject.label;
            const versionResource = await createResource(paperTitle, [CLASSES.SMART_REVIEW_PUBLISHED]);
            const updateMessageLiteral = await createLiteral(updateMessage);
            await createLiteralStatement(versionResource.id, PREDICATES.DESCRIPTION, updateMessageLiteral.id);
            await createResourceStatement(versionResource.id, PREDICATES.HAS_PAPER, id);

            await createResourceData({
                resourceId: versionResource.id,
                data: { rootResource: id, statements }
            });

            // reload versions to ensure new versions appears in history
            const versions = await getVersions(paperId);
            dispatch(setVersions(versions));

            toast.success('Review published successfully');
            setPublishedId(versionResource.id);
            setIsLoading(false);
        } catch (e) {
            toast.success('An error occurred when publishing the review');
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={show} toggle={toggle}>
            <ModalHeader toggle={toggle}>Publish review</ModalHeader>
            <ModalBody>
                <Alert color="info">
                    Once a review is published, the current state is saved and will be persistent over time. The update message is used to identify
                    why a version is published
                </Alert>
                {!publishedId ? (
                    <FormGroup>
                        <Label for="update-message">Update message</Label>
                        <Input
                            type="text"
                            id="update-message"
                            placeholder="Example: added introduction section"
                            value={updateMessage}
                            onChange={e => setUpdateMessage(e.target.value)}
                        />
                    </FormGroup>
                ) : (
                    <Link to={reverse(routes.REVIEW, { id: publishedId })} onClick={toggle}>
                        View the published review
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
    getVersions: PropTypes.func.isRequired,
    paperId: PropTypes.string.isRequired
};

export default PublishModal;
