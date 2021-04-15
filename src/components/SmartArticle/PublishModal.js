import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { Button, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
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

const PublishModal = ({ id, show, toggle }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [updateMessage, setUpdateMessage] = useState('');
    const [publishedId, setPublishedId] = useState(null);

    const handlePublish = async () => {
        setIsLoading(true);

        try {
            const { statements } = await getStatementsBundleBySubject({
                id
            });
            const paperTitle = statements.find(statement => statement.subject.id === id).subject.label;
            const versionResource = await createResource(paperTitle, [CLASSES.SMART_ARTICLE_PUBLISHED]);
            const updateMessageLiteral = await createLiteral(updateMessage);
            await createLiteralStatement(versionResource.id, PREDICATES.DESCRIPTION, updateMessageLiteral.id);
            await createResourceStatement(versionResource.id, PREDICATES.HAS_PAPER, id);

            await createResourceData({
                resourceId: versionResource.id,
                data: { rootResource: id, statements }
            });
            toast.success('Article published successfully');
            setPublishedId(versionResource.id);
            setIsLoading(false);
        } catch (e) {
            toast.success('An error occurred when publishing the article');
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={show} toggle={toggle}>
            <ModalHeader toggle={toggle}>Publish article</ModalHeader>
            <ModalBody>
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
                    <a href={reverse(routes.SMART_ARTICLE, { id: publishedId })}>View the published article</a>
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
    show: PropTypes.bool.isRequired
};

export default PublishModal;
