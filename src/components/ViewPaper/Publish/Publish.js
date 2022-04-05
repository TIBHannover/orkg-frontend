import { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Input, Button, Label, FormGroup, Alert, InputGroup } from 'reactstrap';
import { toast } from 'react-toastify';
import ROUTES from 'constants/routes.js';
import PropTypes from 'prop-types';
import { generateDOIForORKGArtefact } from 'services/backend/misc';
import { createLiteral } from 'services/backend/literals';
import Tooltip from 'components/Utils/Tooltip';
import Autocomplete from 'components/Autocomplete/Autocomplete';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faClipboard } from '@fortawesome/free-regular-svg-icons';
import { reverse } from 'named-urls';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import styled from 'styled-components';
import { PREDICATES, CLASSES, ENTITIES } from 'constants/graphSettings';
import { getContributorsByResourceId } from 'services/backend/resources';
import env from '@beam-australia/react-env';
import { getPublicUrl } from 'utils';
import { getStatementsBySubject, getStatementsBySubjects } from 'services/backend/statements';
import { filterObjectOfStatementsByPredicateAndClass } from 'utils';
import { createResourceData } from 'services/similarity/index';
import { useSelector } from 'react-redux';
import { createObject } from 'services/backend/misc';
import {
    createLiteralStatement,
    createResourceStatement,
    getStatementsByPredicateAndLiteral,
    getStatementsBySubjectAndPredicate
} from 'services/backend/statements';
import { createResource } from 'services/backend/resources';
import { updateStatement } from 'services/backend/statements';
import { Link } from 'react-router-dom';

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
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [subject, setSubject] = useState('');
    //const [isLoadingContributors, setIsLoadingContributors] = useState(true);
    const [contributors, setContributors] = useState([]);
    const [globalDepth, setGlobalDepth] = useState(1);
    const viewPaper = useSelector(state => state.viewPaper);
    const [dataCiteDoi, setDataCiteDoi] = useState('');
    const [createdPaperId, setCreatedPaperId] = useState('');

    //const handleCreatorsChange = creators => {
    //creators = creators ? creators : [];
    //setPaperCreators(creators);
    //};

    useEffect(() => {
        const loadContributors = () => {
            //setIsLoadingContributors(true);
            console.log(props.paperId);
            getContributorsByResourceId(props.paperId)
                .then(contributors => {
                    console.log(contributors);
                    setContributors(contributors ? contributors.reverse() : []);
                    //setIsLoadingContributors(false);
                })
                .catch(error => {
                    //setIsLoadingContributors(false);
                });
        };
        setTitle(props.label);
        setSubject(viewPaper.researchField);
        loadContributors();
    }, [props.label, props.paperId, viewPaper]);

    const handleSubmit = async e => {
        e.preventDefault();
        setIsLoading(true);
        try {
            publishDOI(props.paperId);
        } catch (error) {
            toast.error(`Error publishing a paper : ${error.message}`);
            setIsLoading(false);
        }
    };

    const getResourceAndStatements = async (resourceId, list) => {
        const statements = await getStatementsBySubject({ id: resourceId });
        list.push(...statements);
        if (statements.length > 0) {
            //console.log(resourceId + '-' + statements.length);
            //list.push(...statements);
            for (const statement of statements) {
                //console.log(statement);
                if (statement.object._class === 'resource') {
                    console.log(true);
                    await getResourceAndStatements(statement.object.id, list);
                }
            }

            return list;
        } else {
            return list;
        }
    };

    const getPaperStatements = async paperId => {
        //console.log(paperId);

        //const paper = {
        //predicates: [],
        //resource: {
        //name: 'title',
        //classes: ['PaperVersion']
        //}
        //};

        //console.log();
        //const createdPaper = await createObject(paper);
        //console.log(createdPaper);
        //await saveCreators(viewPaper.authors, createdPaper.id);
        const statements = await getStatementsBySubject({ id: paperId });
        //console.log(statements);
        const result = filterObjectOfStatementsByPredicateAndClass(statements, PREDICATES.HAS_CONTRIBUTION, false, CLASSES.CONTRIBUTION);
        //console.log(result);
        const ids = result.map(stmt => stmt.id);
        //console.log(ids);
        const c = await getStatementsBySubjects({ ids: ids });
        //console.log(c[0].statements);
        const cids = c[0].statements;
        //console.log(cids.length);
        const data = [];
        for (let i = 0; i < cids.length; i++) {
            const ct = cids[i];
            //console.log(ct);
            data.push(ct);
            // for property of each contribution
            //for (let j = 0; j < ct.statements.length; j++) {
            //console.log(ct.statements[j]);
            const st = await getResourceAndStatements(ct.object.id, []);
            data.push(...st);
            //console.log(st);
            //}
        }
        return data;
        //let dataObject = { orkgOrigin: paperId, statements: data };
        //await createResourceData({
        //resourceId: paperId,
        //data: { statements: data }
        //});
        //console.log(dataObject);
    };

    const publishDOI = async paperId => {
        //if (props.paperId) {
        //await saveCreators([''], props.paperId);
        //}
        // Load ORCID of curators
        // prpend orkg in the title
        // make it no editable
        // history of paper
        console.log(viewPaper.contributions[0].id);
        if (title && title.trim() !== '' && description && description.trim() !== '') {
            const paperStatements = await getPaperStatements(paperId);
            console.log(paperStatements);
            const paper_obj = {
                predicates: [],
                resource: {
                    name: title,
                    classes: ['PaperVersion'],
                    values: {
                        [PREDICATES.DESCRIPTION]: [
                            {
                                text: description
                            }
                        ],
                        ...(subject &&
                            subject.id && {
                                [PREDICATES.HAS_RESEARCH_FIELD]: [
                                    {
                                        '@id': subject.id
                                    }
                                ]
                            }),
                        ...(viewPaper.publicationMonth && {
                            [PREDICATES.HAS_PUBLICATION_MONTH]: [
                                {
                                    text: viewPaper.publicationMonth
                                }
                            ]
                        }),
                        ...(viewPaper.publicationYear && {
                            [PREDICATES.HAS_PUBLICATION_YEAR]: [
                                {
                                    text: viewPaper.publicationYear.label
                                }
                            ]
                        }),
                        ...(viewPaper.doi && {
                            [PREDICATES.HAS_DOI]: [
                                {
                                    '@id': viewPaper.doi[0].id
                                }
                            ]
                        })
                    }
                }
            };

            const createdPaper = await createObject(paper_obj);
            console.log(createdPaper);
            await saveCreators(viewPaper.authors, createdPaper.id);
            console.log(props.paperLink.replace('https://doi.org/', ''));
            //resource_id, title, subject, related_resources, description, authors, url, type, resourceType
            generateDOIForORKGArtefact(
                createdPaper.id,
                title,
                subject ? subject.label : '',
                //props.paperLink ? [props.paperLink.replace('https://doi.org/', '')] : [''],
                viewPaper.contributions && viewPaper.contributions[0] ? [viewPaper.contributions[0].id] : [''],
                description,
                contributors.map(creator => ({ creator: creator.created_by.display_name, orcid: '' })),
                `${getPublicUrl()}${reverse(ROUTES.VIEW_PAPER_HISTORY, { resourceId: createdPaper.id })}`,
                CLASSES.PAPER,
                CLASSES.DATASET
            )
                .then(doiResponse => {
                    console.log(doiResponse);
                    createLiteral(doiResponse.data.attributes.doi).then(doiLiteral => {
                        createResourceStatement(createdPaper.id, PREDICATES.HAS_DOI, doiLiteral.id);
                        if (viewPaper.hasVersion) {
                            updateStatement(viewPaper.hasVersion.statementId, {
                                subject_id: viewPaper.paperResource.id,
                                predicate_id: PREDICATES.HAS_PREVIOUS_VERSION,
                                object_id: createdPaper.id
                            });
                            createResourceStatement(createdPaper.id, PREDICATES.HAS_PREVIOUS_VERSION, viewPaper.hasVersion.id);
                        } else {
                            createResourceStatement(viewPaper.paperResource.id, PREDICATES.HAS_PREVIOUS_VERSION, createdPaper.id);
                        }
                        //createResourceStatement(viewPaper.paperResource.id, PREDICATES.HAS_PREVIOUS_VERSION, createdPaper.id);
                        setDataCiteDoi(doiResponse.data.attributes.doi);
                        setCreatedPaperId(createdPaper.id);
                        //props.setPaperMetaData(doiResponse.data.attributes.doi);
                        //let dataObject = { orkgOrigin: paperId, statements: data };
                        createResourceData({
                            resourceId: createdPaper.id,
                            data: { statements: paperStatements }
                        });
                        //console.log(dataObject);
                        setIsLoading(false);
                        toast.success('DOI has been registered successfully');
                    });
                })
                .catch(error => {
                    toast.error(`Error publishing a DOI`);
                    setIsLoading(false);
                });
        } else {
            throw Error('Please enter a title and a description');
        }
        setIsLoading(false);
    };

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
                // Author resource exists
                if (author.label !== author.id) {
                    const authorStatement = await createResourceStatement(resourceId, PREDICATES.HAS_AUTHOR, author.id);
                    authors.statementId = authorStatement.id;
                    authors.id = author.id;
                    authors.class = author._class;
                    authors.classes = author.classes;
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
        }
    };

    return (
        <Modal size="lg" isOpen={props.showDialog} toggle={props.toggle}>
            <ModalHeader toggle={props.toggle}>Publish ORKG paper</ModalHeader>
            <ModalBody>
                <Alert color="info">
                    {props.paperId && !dataCiteDoi && (
                        <>
                            A published paper is made public to other users.
                            {` A DOI ${env('DATACITE_DOI_PREFIX')}/${props.paperId} 
                            will be assigned to published paper and it cannot be changed in future.`}
                        </>
                    )}
                    {createdPaperId && dataCiteDoi && (
                        <>
                            DOI is assigned sucessfully.{' '}
                            <Link to={reverse(ROUTES.VIEW_PAPER_HISTORY, { resourceId: createdPaperId })}>View published version</Link>
                        </>
                    )}
                </Alert>
                {!dataCiteDoi && (
                    <>
                        {' '}
                        <FormGroup>
                            <Label for="title">
                                <Tooltip message="Title of the paper">Title</Tooltip>
                            </Label>
                            <Input
                                type="text"
                                name="title"
                                value={`${title} [ORKG]`}
                                disabled={Boolean(props.paperId)}
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
                                id="description"
                                onChange={e => setDescription(e.target.value)}
                            />
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
                                <Tooltip message="The creator or creators of ORKG paper. Enter both the first and last name">Creators</Tooltip>
                            </Label>
                            {/* {!props.dataCiteDOI && ( */}
                            {/* <AuthorsInput */}
                            {/* disabled={Boolean(contributors.length > 0)} */}
                            {/* itemLabel="creator" */}
                            {/* handler={handleCreatorsChange} */}
                            {/* value={contributors} */}
                            {/* /> */}
                            {/* )} */}
                            {!dataCiteDoi &&
                                props.paperId &&
                                contributors.map((creator, index) => (
                                    <AuthorTag key={`creator${index}`}>
                                        <div className="name"> {creator.created_by.display_name} </div>
                                    </AuthorTag>
                                ))}
                        </FormGroup>
                    </>
                )}

                <></>
            </ModalBody>
            {!dataCiteDoi && (
                <ModalFooter>
                    {!dataCiteDoi && (
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
    paperId: PropTypes.string,
    label: PropTypes.string,
    paperLink: PropTypes.string
};

export default Publish;
