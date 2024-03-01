import { faClipboard } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { useMatomo } from '@jonkoops/matomo-tracker-react';
import ButtonWithLoading from 'components/ButtonWithLoading/ButtonWithLoading';
import Link from 'components/NextJsMigration/Link';
import usePathname from 'components/NextJsMigration/usePathname';
import Tooltip from 'components/Utils/Tooltip';
import { CLASSES, PREDICATES } from 'constants/graphSettings';
import { MAX_LENGTH_INPUT } from 'constants/misc';
import ROUTES from 'constants/routes';
import THING_TYPES from 'constants/thingTypes';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';
import { useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Alert, Button, Form, FormGroup, Input, InputGroup, Label, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { createLiteral } from 'services/backend/literals';
import { generateDoi } from 'services/backend/misc';
import { createResource } from 'services/backend/resources';
import { createLiteralStatement, createResourceStatement, getStatementsBundleBySubject } from 'services/backend/statements';
import { createThing } from 'services/similarity';
import { setVersions } from 'slices/reviewSlice';
import { getAuthorsInList } from 'utils';

const PublishModal = ({ id, show, toggle, getVersions, paperId }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [updateMessage, setUpdateMessage] = useState('');
    const [publishedId, setPublishedId] = useState(null);
    const [shouldAssignDoi, setShouldAssignDoi] = useState(false);
    const [doi, setDoi] = useState(null);
    const [description, setDescription] = useState('');
    const pathname = usePathname();
    const { title } = useSelector(state => state.review.paper);
    const researchField = useSelector(state => state.review.researchField);

    const dispatch = useDispatch();
    const { trackEvent } = useMatomo();

    const getUrl = () =>
        `${window.location.protocol}//${window.location.host}${pathname.replace(reverse(ROUTES.REVIEW, { id }), '').replace(/\/$/, '')}`;

    const handlePublish = async () => {
        if (shouldAssignDoi && (!description || description.trim() === '')) {
            toast.error('Please enter a description');
            return;
        }
        setIsLoading(true);

        try {
            const { statements } = await getStatementsBundleBySubject({
                id,
            });
            const paperTitle = statements.find(statement => statement.subject.id === id).subject.label;
            const versionResource = await createResource(paperTitle, [CLASSES.SMART_REVIEW_PUBLISHED]);
            const updateMessageLiteral = await createLiteral(updateMessage);

            await createLiteralStatement(versionResource.id, PREDICATES.DESCRIPTION, updateMessageLiteral.id);
            await createResourceStatement(id, PREDICATES.HAS_PUBLISHED_VERSION, versionResource.id);

            await createThing({ thingType: THING_TYPES.REVIEW, thingKey: versionResource.id, data: { rootResource: id, statements } });

            if (shouldAssignDoi) {
                try {
                    const authors = getAuthorsInList({ resourceId: id, statements }).map(author => ({
                        creator: author.label,
                        orcid: author.orcid || null,
                    }));
                    const doiResponse = await generateDoi({
                        type: 'Review',
                        resource_type: 'Preprint',
                        resource_id: versionResource.id,
                        title,
                        subject: researchField ? researchField.label : '',
                        description,
                        authors,
                        url: `${getUrl()}${reverse(ROUTES.REVIEW, { id: versionResource.id })}`,
                    });
                    setDoi(doiResponse.doi);
                    const doiLiteral = await createLiteral(doiResponse.doi);
                    createResourceStatement(versionResource.id, PREDICATES.HAS_DOI, doiLiteral.id);
                    toast.success('DOI has been registered successfully');
                    setIsLoading(false);
                } catch (e) {
                    toast.error('Error publishing a DOI');
                    console.error(e);
                    setIsLoading(false);
                }
            }

            // reload versions to ensure new versions appears in history
            const versions = await getVersions(paperId);
            dispatch(setVersions(versions));

            toast.success('Review published successfully');
            trackEvent({ category: 'data-entry', action: 'publish-review' });
            setPublishedId(versionResource.id);
            setIsLoading(false);
        } catch (e) {
            toast.success('An error occurred when publishing the review');
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={show} toggle={toggle}>
            <Form onSubmit={e => e.preventDefault()}>
                <ModalHeader toggle={toggle}>Publish review</ModalHeader>
                <ModalBody>
                    {!publishedId ? (
                        <>
                            <Alert color="info">
                                Once an article is published, the current state is saved and will be persistent over time. The update message is used
                                to identify why a version is published
                            </Alert>
                            <FormGroup>
                                <Label for="update-message">Update message</Label>
                                <Input
                                    type="text"
                                    id="update-message"
                                    placeholder="Example: added introduction section"
                                    value={updateMessage}
                                    onChange={e => setUpdateMessage(e.target.value)}
                                    maxLength={MAX_LENGTH_INPUT}
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
                                        maxLength={MAX_LENGTH_INPUT}
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
                                        <CopyToClipboard text={`https://doi.org/${doi}`} onCopy={() => toast.success('DOI link copied')}>
                                            <Button color="primary" className="px-3">
                                                <Icon icon={faClipboard} />
                                            </Button>
                                        </CopyToClipboard>
                                    </InputGroup>
                                </FormGroup>
                            )}
                            <Link href={reverse(ROUTES.REVIEW, { id: publishedId })} onClick={toggle}>
                                View the published article
                            </Link>
                        </>
                    )}
                </ModalBody>
                {!publishedId && (
                    <ModalFooter>
                        <ButtonWithLoading type="submit" isLoading={isLoading} color="primary" onClick={handlePublish}>
                            Publish
                        </ButtonWithLoading>
                    </ModalFooter>
                )}
            </Form>
        </Modal>
    );
};

PublishModal.propTypes = {
    id: PropTypes.string.isRequired,
    toggle: PropTypes.func.isRequired,
    show: PropTypes.bool.isRequired,
    getVersions: PropTypes.func.isRequired,
    paperId: PropTypes.string.isRequired,
};

export default PublishModal;
