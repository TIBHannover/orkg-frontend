import React, { useState, useEffect } from 'react';
import {
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Input,
    Button,
    Label,
    FormGroup,
    Alert,
    CustomInput,
    InputGroupAddon,
    InputGroup
} from 'reactstrap';
import { toast } from 'react-toastify';
import ROUTES from 'constants/routes.js';
import PropTypes from 'prop-types';
import { createLiteralStatement, createResourceStatement, getStatementsByPredicateAndLiteral } from 'services/backend/statements';
import { generateDOIForComparison } from 'services/backend/misc';
import { createLiteral } from 'services/backend/literals';
import { createResource } from 'services/backend/resources';
import { getComparison } from 'services/similarity/index';
import Tooltip from 'components/Utils/Tooltip';
import Autocomplete from 'components/Autocomplete/Autocomplete';
import AuthorsInput from 'components/Utils/AuthorsInput';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faOrcid } from '@fortawesome/free-brands-svg-icons';
import { faClipboard } from '@fortawesome/free-regular-svg-icons';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { reverse } from 'named-urls';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { PREDICATES, CLASSES, ENTITIES } from 'constants/graphSettings';
import env from '@beam-australia/react-env';

const StyledCustomInput = styled(CustomInput)`
    margin-right: 0;
`;

const AuthorTag = styled.div`
    background-color: #e9ecef;
    display: flex;
    margin: 0 0 4px 0;
    box-sizing: border-box;
    color: rgb(147, 147, 147);
    cursor: default;
    border-radius: 12px;
    overflow: hidden;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    &:hover {
        background-color: #ffbdad;
        color: #de350b;
    }

    .name {
        padding: 8px 10px;
        color: #495057;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        box-sizing: border-box;
        flex: 1;
        display: flex;
    }
`;

function Publish(props) {
    const [isLoading, setIsLoading] = useState(false);

    const [assignDOI, setAssignDOI] = useState(false);
    const [title, setTitle] = useState(props.metaData && props.metaData.title ? props.metaData.title : '');
    const [description, setDescription] = useState(props.metaData && props.metaData.description ? props.metaData.description : '');
    const [references, setReferences] = useState(
        props.metaData?.references && props.metaData.references.length > 0 ? props.metaData.references : ['']
    );
    const [subject, setSubject] = useState(props.metaData && props.metaData.subject ? props.metaData.subject : undefined);
    const [comparisonCreators, setComparisonCreators] = useState(props.authors ?? []);

    const handleCreatorsChange = creators => {
        creators = creators ? creators : [];
        setComparisonCreators(creators);
    };

    useEffect(() => {
        setTitle(props.metaData && props.metaData.title ? props.metaData.title : '');
        setDescription(props.metaData && props.metaData.description ? props.metaData.description : '');
        setReferences(props.metaData?.references && props.metaData.references.length > 0 ? props.metaData.references : ['']);
        setSubject(props.metaData && props.metaData.subject ? props.metaData.subject : undefined);
    }, [props.metaData]);

    // TODO: improve code by using reduce function and unify code with paper edit dialog
    const saveCreators = async (creators, resourceId) => {
        const authors = creators;
        for (const author of authors) {
            // create the author
            if (author.orcid) {
                // Create author with ORCID
                // check if there's an author resource
                const responseJson = await getStatementsByPredicateAndLiteral({
                    predicateId: PREDICATES.HAS_ORCID,
                    literal: author.orcid,
                    subjectClass: CLASSES.AUTHOR,
                    items: 1
                });
                if (responseJson.length > 0) {
                    // Author resource exists
                    const authorResource = responseJson[0];
                    const authorStatement = await createResourceStatement(resourceId, PREDICATES.HAS_AUTHOR, authorResource.subject.id);
                    authors.statementId = authorStatement.id;
                    authors.id = authorResource.subject.id;
                    authors.class = authorResource.subject._class;
                    authors.classes = authorResource.subject.classes;
                } else {
                    // Author resource doesn't exist
                    // Create resource author
                    const authorResource = await createResource(author.label, [CLASSES.AUTHOR]);
                    const orcidLiteral = await createLiteral(author.orcid);
                    await createLiteralStatement(authorResource.id, PREDICATES.HAS_ORCID, orcidLiteral.id);
                    const authorStatement = await createResourceStatement(resourceId, PREDICATES.HAS_AUTHOR, authorResource.id);
                    authors.statementId = authorStatement.id;
                    authors.id = authorResource.id;
                    authors.class = authorResource._class;
                    authors.classes = authorResource.classes;
                }
            } else {
                // Author resource doesn't exist
                const newLiteral = await createLiteral(author.label);
                // Create literal of author
                const authorStatement = await createLiteralStatement(resourceId, PREDICATES.HAS_AUTHOR, newLiteral.id);
                authors.statementId = authorStatement.id;
                authors.id = newLiteral.id;
                authors.class = authorStatement.object._class;
                authors.classes = authorStatement.object.classes;
            }
        }
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (!props.comparisonId) {
                if (title && title.trim() !== '' && description && description.trim() !== '') {
                    const comparison = await getComparison({
                        contributionIds: props.contributionsList,
                        type: props.comparisonType,
                        save_response: true
                    });
                    const titleResponse = await createResource(title, [CLASSES.COMPARISON]);
                    const resourceId = titleResponse.id;
                    const descriptionResponse = await createLiteral(description);
                    await createLiteralStatement(resourceId, PREDICATES.DESCRIPTION, descriptionResponse.id);
                    if (references && references.length > 0) {
                        for (const reference of references) {
                            if (reference && reference.trim() !== '') {
                                const referenceResponse = await createLiteral(reference);
                                await createLiteralStatement(resourceId, PREDICATES.REFERENCE, referenceResponse.id);
                            }
                        }
                    }
                    if (subject && subject.id) {
                        // has research field is not used because it affects the page "research field"
                        // this should be updated when the issue !169 in back-end is resolved
                        await createResourceStatement(resourceId, PREDICATES.HAS_SUBJECT, subject.id);
                    }
                    await saveCreators(comparisonCreators, resourceId);
                    const urlResponse = await createLiteral(`${props.comparisonURLConfig}&response_hash=${comparison.response_hash}`);
                    await createLiteralStatement(resourceId, PREDICATES.URL, urlResponse.id);
                    props.contributionsList.forEach(contirbutionID => {
                        createResourceStatement(resourceId, PREDICATES.COMPARE_CONTRIBUTION, contirbutionID);
                    });
                    props.predicatesList.forEach(predicateID => {
                        createResourceStatement(resourceId, PREDICATES.HAS_PROPERTY, predicateID);
                    });
                    if (props.metaData.hasPreviousVersion) {
                        createResourceStatement(resourceId, PREDICATES.HAS_PREVIOUS_VERSION, props.metaData.hasPreviousVersion.id);
                    }
                    toast.success('Comparison saved successfully');
                    // Assign a DOI
                    if (assignDOI) {
                        publishDOI(resourceId);
                    }
                    setIsLoading(false);
                    props.setMetaData(prevMetaData => ({
                        ...prevMetaData,
                        id: resourceId,
                        title,
                        description,
                        references: references.filter(Boolean), // Remove empty strings from array
                        subject,
                        comparisonCreators,
                        createdAt: titleResponse.created_at,
                        createdBy: titleResponse.created_by,
                        resources: [],
                        figures: [],
                        hasPreviousVersion: props.metaData.hasPreviousVersion,
                        hasNextVersion: null
                    }));
                    props.setAuthors(comparisonCreators);
                    props.loadCreatedBy(titleResponse.created_by);
                    props.loadProvenanceInfos(titleResponse.observatory_id, titleResponse.organization_id);
                } else {
                    throw Error('Please enter a title and a description');
                }
            } else {
                publishDOI(props.comparisonId);
            }
        } catch (error) {
            toast.error(`Error publishing a comparison : ${error.message}`);
            setIsLoading(false);
        }
    };

    const publishDOI = async comparisonId => {
        try {
            if (props.comparisonId && props.authors.length === 0) {
                await saveCreators(comparisonCreators, props.comparisonId);
            }
            if (title && title.trim() !== '' && description && description.trim() !== '') {
                const response = await generateDOIForComparison(
                    comparisonId,
                    title,
                    subject ? subject.label : '',
                    description,
                    props.contributionsList,
                    comparisonCreators.map(c => ({ creator: c.label, orcid: c.orcid })),
                    `${props.publicURL}${reverse(ROUTES.COMPARISON, { comparisonId: comparisonId })}`
                );
                props.setMetaData(prevMetaData => ({
                    ...prevMetaData,
                    doi: response.data.attributes.doi
                }));
                const doiResponse = await createLiteral(response.data.attributes.doi);
                createResourceStatement(comparisonId, PREDICATES.HAS_DOI, doiResponse.id);
                toast.success('DOI has been registered successfully');
            } else {
                throw Error('Please enter a title and a description');
            }
        } catch (error) {
            console.error(error);
            toast.error(`Error publishing a comparison : ${error.message}`);
            setIsLoading(false);
        }
    };

    const handleRemoveReferenceClick = index => {
        const list = [...references];
        list.splice(index, 1);
        setReferences(list);
    };

    const handleReferenceChange = (e, index) => {
        const { value } = e.target;
        const list = [...references];
        list[index] = value;
        setReferences(list);
    };

    return (
        <Modal size="lg" isOpen={props.showDialog} toggle={props.toggle}>
            <ModalHeader toggle={props.toggle}>Publish comparison</ModalHeader>
            <ModalBody>
                <Alert color="info">
                    A published comparison is made public to other users. The state of the comparison is saved and a persistent link is created.
                </Alert>
                {props.comparisonId && (
                    <FormGroup>
                        <Label for="comparison_link">Comparison link</Label>
                        <InputGroup>
                            <Input
                                id="comparison_link"
                                value={`${props.publicURL}${reverse(ROUTES.COMPARISON, { comparisonId: props.comparisonId })}`}
                                disabled
                            />
                            <InputGroupAddon addonType="append">
                                <CopyToClipboard
                                    text={`${props.publicURL}${reverse(ROUTES.COMPARISON, { comparisonId: props.comparisonId })}`}
                                    onCopy={() => {
                                        toast.dismiss();
                                        toast.success(`Comparison link copied!`);
                                    }}
                                >
                                    <Button color="primary" className="pl-3 pr-3" style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}>
                                        <Icon icon={faClipboard} />
                                    </Button>
                                </CopyToClipboard>
                            </InputGroupAddon>
                        </InputGroup>
                    </FormGroup>
                )}
                {props.doi && (
                    <FormGroup>
                        <Label for="doi_link">DOI</Label>
                        <InputGroup>
                            <Input id="doi_link" value={`https://doi.org/${props.doi}`} disabled />
                            <InputGroupAddon addonType="append">
                                <CopyToClipboard
                                    text={`https://doi.org/${props.doi}`}
                                    onCopy={() => {
                                        toast.dismiss();
                                        toast.success(`DOI link copied!`);
                                    }}
                                >
                                    <Button color="primary" className="pl-3 pr-3" style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}>
                                        <Icon icon={faClipboard} />
                                    </Button>
                                </CopyToClipboard>
                            </InputGroupAddon>
                        </InputGroup>
                    </FormGroup>
                )}
                {props.comparisonId && !props.doi && (
                    <FormGroup>
                        <div>
                            <Tooltip
                                message={`A DOI ${env('DATACITE_DOI_PREFIX')}/${
                                    props.comparisonId
                                } will be assigned to published comparison and it cannot be changed in future.`}
                            >
                                <StyledCustomInput
                                    onChange={e => {
                                        setAssignDOI(e.target.checked);
                                    }}
                                    checked={assignDOI}
                                    id="switchAssignDoi"
                                    type="switch"
                                    name="customSwitch"
                                    inline
                                    label="Assign a DOI to the comparison"
                                />
                            </Tooltip>
                        </div>
                    </FormGroup>
                )}
                {!props.doi && (!props.comparisonId || (props.comparisonId && assignDOI)) && (
                    <>
                        {' '}
                        <FormGroup>
                            <Label for="title">
                                <Tooltip message="Enter the title of the comparison">Title</Tooltip>
                            </Label>
                            <Input
                                type="text"
                                name="title"
                                value={title}
                                disabled={Boolean(props.comparisonId)}
                                id="title"
                                onChange={e => setTitle(e.target.value)}
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label for="description">
                                <Tooltip message="Describe the goal and what is being compared">Description</Tooltip>
                            </Label>
                            <Input
                                type="textarea"
                                name="description"
                                value={description}
                                disabled={Boolean(props.comparisonId)}
                                id="description"
                                onChange={e => setDescription(e.target.value)}
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label>
                                <Tooltip message="Enter a reference to the data sources from which the comparison is generated">
                                    Reference (optional)
                                </Tooltip>
                            </Label>
                            {references &&
                                references.map((x, i) => {
                                    return (
                                        <InputGroup className="mb-1" key={`ref${i}`}>
                                            <Input
                                                disabled={Boolean(props.comparisonId)}
                                                type="text"
                                                name="reference"
                                                value={x}
                                                onChange={e => handleReferenceChange(e, i)}
                                            />
                                            {!Boolean(props.comparisonId) && (
                                                <InputGroupAddon addonType="append">
                                                    {references.length !== 1 && (
                                                        <Button
                                                            color="light"
                                                            onClick={() => handleRemoveReferenceClick(i)}
                                                            className="pl-3 pr-3"
                                                            style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                                                        >
                                                            <Icon icon={faTrash} />
                                                        </Button>
                                                    )}
                                                    {references.length - 1 === i && (
                                                        <Button
                                                            color="secondary"
                                                            onClick={() => setReferences([...references, ''])}
                                                            className="pl-3 pr-3"
                                                            outline
                                                            style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                                                        >
                                                            <Icon icon={faPlus} />
                                                        </Button>
                                                    )}
                                                </InputGroupAddon>
                                            )}
                                        </InputGroup>
                                    );
                                })}
                        </FormGroup>
                        <FormGroup>
                            <Label for="research-field">
                                <Tooltip message="Enter a subject of the comparison">Research Field</Tooltip>
                            </Label>

                            <Autocomplete
                                entityType={ENTITIES.RESOURCE}
                                optionsClass={CLASSES.RESEARCH_FIELD}
                                placeholder="Enter a research field"
                                onItemSelected={i => {
                                    setSubject({ ...i, label: i.value });
                                }}
                                value={subject}
                                autoLoadOption={true}
                                openMenuOnFocus={false}
                                allowCreate={false}
                                inputId="research-field"
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label for="Creator">
                                <Tooltip message="The creator or creators of the comparison. Enter both the first and last name">Creators</Tooltip>
                            </Label>
                            {!props.doi && (!props.comparisonId || props.authors.length === 0) && (
                                <AuthorsInput
                                    disabled={Boolean(comparisonCreators.length > 0)}
                                    itemLabel="creator"
                                    handler={handleCreatorsChange}
                                    value={comparisonCreators}
                                />
                            )}
                            {!props.doi &&
                                props.comparisonId &&
                                props.authors.length !== 0 &&
                                props.authors.map((creator, index) => (
                                    <AuthorTag key={`creator${index}`}>
                                        <div className="name">
                                            {creator.label}
                                            {creator.orcid && <Icon style={{ margin: '4px' }} icon={faOrcid} />}
                                        </div>
                                    </AuthorTag>
                                ))}
                        </FormGroup>
                        {!props.comparisonId && (
                            <FormGroup>
                                <div>
                                    <Tooltip message="A DOI will be assigned to published comparison and it cannot be changed in future.">
                                        <StyledCustomInput
                                            onChange={e => {
                                                setAssignDOI(e.target.checked);
                                            }}
                                            checked={assignDOI}
                                            id="switchAssignDoi"
                                            type="switch"
                                            name="customSwitch"
                                            inline
                                            label="Assign a DOI to the comparison"
                                        />
                                    </Tooltip>
                                </div>
                            </FormGroup>
                        )}
                        {!props.comparisonId && props.metaData.hasPreviousVersion && (
                            <FormGroup>
                                <div>
                                    <hr />
                                    <>
                                        This comparison will be marked as new version of the comparison{' '}
                                        <Link target="_blank" to={reverse(ROUTES.COMPARISON, { comparisonId: props.metaData.hasPreviousVersion.id })}>
                                            {props.metaData.hasPreviousVersion.id}
                                        </Link>
                                    </>
                                </div>
                            </FormGroup>
                        )}
                    </>
                )}

                <></>
            </ModalBody>
            {((!props.doi && !props.comparisonId) || (props.comparisonId && !props.doi && assignDOI)) && (
                <ModalFooter>
                    {!props.doi && !props.comparisonId && (
                        <div className="text-align-center mt-2">
                            <Button color="primary" disabled={isLoading} onClick={handleSubmit}>
                                {isLoading && <span className="fa fa-spinner fa-spin" />} Publish
                            </Button>
                        </div>
                    )}
                    {props.comparisonId && !props.doi && assignDOI && (
                        <div className="text-align-center mt-2">
                            <Button color="primary" disabled={isLoading} onClick={handleSubmit}>
                                {isLoading && <span className="fa fa-spinner fa-spin" />} Publish DOI
                            </Button>
                        </div>
                    )}
                </ModalFooter>
            )}
        </Modal>
    );
}

Publish.propTypes = {
    showDialog: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    comparisonId: PropTypes.string,
    doi: PropTypes.string,
    authors: PropTypes.array.isRequired,
    setMetaData: PropTypes.func.isRequired,
    publicURL: PropTypes.string.isRequired,
    metaData: PropTypes.object.isRequired,
    contributionsList: PropTypes.array.isRequired,
    predicatesList: PropTypes.array.isRequired,
    comparisonType: PropTypes.string,
    comparisonURLConfig: PropTypes.string.isRequired,
    setAuthors: PropTypes.func.isRequired,
    loadCreatedBy: PropTypes.func.isRequired,
    loadProvenanceInfos: PropTypes.func.isRequired
};

export default Publish;
