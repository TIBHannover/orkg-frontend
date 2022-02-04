import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { Alert, Button, FormGroup, Input, InputGroup, Label, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { createLiteralStatement, createResourceStatement, getStatementsBundleBySubject } from 'services/backend/statements';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faClipboard, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { createResource } from 'services/backend/resources';
import { createLiteral } from 'services/backend/literals';
import { CLASSES, PREDICATES } from 'constants/graphSettings';
import { createResourceData } from 'services/similarity';
import { toast } from 'react-toastify';
import { reverse } from 'named-urls';
import routes from 'constants/routes';
import { Link } from 'react-router-dom';
import { setVersions } from 'actions/smartReview';
import { useDispatch, useSelector } from 'react-redux';
import Tooltip from 'components/Utils/Tooltip';
import { generateDoi } from 'services/backend/misc';
import ROUTES from 'constants/routes';
import CopyToClipboard from 'react-copy-to-clipboard';

const PublishModal = ({ id, show, toggle, getVersions, paperId }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [updateMessage, setUpdateMessage] = useState('');
    const [publishedId, setPublishedId] = useState(null);
    const [shouldAssignDoi, setShouldAssignDoi] = useState(false);
    const [doi, setDoi] = useState(null);
    const [description, setDescription] = useState('');
    const { title } = useSelector(state => state.smartReview.paper);
    const researchField = useSelector(state => state.smartReview.researchField);

    const dispatch = useDispatch();

    const getUrl = () =>
        `${window.location.protocol}//${window.location.host}${window.location.pathname
            .replace(reverse(ROUTES.SMART_REVIEW, { id }), '')
            .replace(/\/$/, '')}`;

    const handlePublish = async () => {
        if (shouldAssignDoi && (!description || description.trim() === '')) {
            toast.error('Please enter a description');
            return;
        }
        setIsLoading(true);

        try {
            const { statements } = await getStatementsBundleBySubject({
                id
            });
            const paperTitle = statements.find(statement => statement.subject.id === id).subject.label;
            const authors = statements
                .filter(statement => statement.predicate.id === PREDICATES.HAS_AUTHOR)
                .map(authorStatement => ({
                    ...authorStatement,
                    orcid:
                        statements.find(
                            statement => statement.subject.id === authorStatement.object.id && statement.predicate.id === PREDICATES.HAS_ORCID
                        )?.object?.label || null
                }))
                .map(author => ({ creator: author.object.label, orcid: author.orcid }))
                .reverse();
            const versionResource = await createResource(paperTitle, [CLASSES.SMART_REVIEW_PUBLISHED]);
            const updateMessageLiteral = await createLiteral(updateMessage);

            await createLiteralStatement(versionResource.id, PREDICATES.DESCRIPTION, updateMessageLiteral.id);
            await createResourceStatement(versionResource.id, PREDICATES.HAS_PAPER, id);
            await createResourceData({
                resourceId: versionResource.id,
                data: { rootResource: id, statements }
            });

            if (shouldAssignDoi) {
                try {
                    const doiResponse = await generateDoi({
                        type: 'Review',
                        resourceType: 'Preprint',
                        resource_id: versionResource.id,
                        title,
                        subject: researchField ? researchField.label : '',
                        description,
                        authors,
                        url: `${getUrl()}${reverse(ROUTES.SMART_REVIEW, { id: versionResource.id })}`
                    });
                    setDoi(doiResponse.data.attributes.doi);
                    const doiLiteral = await createLiteral(doiResponse.data.attributes.doi);
                    createResourceStatement(versionResource.id, PREDICATES.HAS_DOI, doiLiteral.id);
                    toast.success('DOI has been registered successfully');
                    setIsLoading(false);
                } catch (e) {
                    toast.error(`Error publishing a DOI`);
                    console.log(e);
                    setIsLoading(false);
                }
            }

            // reload versions to ensure new versions appears in history
            const versions = await getVersions(paperId);
            dispatch(setVersions(versions));

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
                    <>
                        <Alert color="info">
                            Once an article is published, the current state is saved and will be persistent over time. The update message is used to
                            identify why a version is published
                        </Alert>
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
                        <FormGroup>
                            <div>
                                <Tooltip message="Assign a DOI to the published version of this review">
                                    <Label check>
                                        <Input
                                            type="checkbox"
                                            onChange={e => {
                                                setShouldAssignDoi(e.target.checked);
                                            }}
                                            checked={shouldAssignDoi}
                                            id="switchAssignDoi"
                                            inline
                                        />{' '}
                                        Assign DOI to article
                                    </Label>
                                </Tooltip>
                            </div>
                        </FormGroup>
                        {shouldAssignDoi && (
                            <FormGroup>
                                <Label for="description">
                                    <Tooltip message="Briefly describe the contents of the article">Description</Tooltip>
                                </Label>
                                <Input
                                    type="textarea"
                                    name="description"
                                    value={description}
                                    id="description"
                                    onChange={e => setDescription(e.target.value)}
                                />
                            </FormGroup>
                        )}
                    </>
                ) : (
                    <>
                        {doi && (
                            <FormGroup>
                                <Label for="doi_link">DOI</Label>
                                <InputGroup>
                                    <Input id="doi_link" value={`https://doi.org/${doi}`} disabled />
                                    <CopyToClipboard text={`https://doi.org/${doi}`} onCopy={() => toast.success(`DOI link copied`)}>
                                        <Button color="primary" className="px-3">
                                            <Icon icon={faClipboard} />
                                        </Button>
                                    </CopyToClipboard>
                                </InputGroup>
                            </FormGroup>
                        )}
                        <Link to={reverse(routes.SMART_REVIEW, { id: publishedId })} onClick={toggle}>
                            View the published article
                        </Link>
                    </>
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
