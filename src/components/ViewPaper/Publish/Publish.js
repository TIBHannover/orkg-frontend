import { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Input, Button, Label, FormGroup, Alert } from 'reactstrap';
import { toast } from 'react-toastify';
import ROUTES from 'constants/routes.js';
import PropTypes from 'prop-types';
import { generateDoi } from 'services/backend/misc';
import { createLiteral } from 'services/backend/literals';
import Tooltip from 'components/Utils/Tooltip';
import Autocomplete from 'components/Autocomplete/Autocomplete';
import { reverse } from 'named-urls';
import styled from 'styled-components';
import { PREDICATES, CLASSES, ENTITIES } from 'constants/graphSettings';
import { getContributorsByResourceId } from 'services/backend/resources';
import { getPublicUrl } from 'utils';
import { getStatementsBySubject, getStatementsBySubjects } from 'services/backend/statements';
import { filterObjectOfStatementsByPredicateAndClass } from 'utils';
import { createResourceData } from 'services/similarity/index';
import { useSelector } from 'react-redux';
import { createObject } from 'services/backend/misc';
import { createResourceStatement } from 'services/backend/statements';
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
    const [contributors, setContributors] = useState([]);
    const viewPaper = useSelector(state => state.viewPaper);
    const [dataCiteDoi, setDataCiteDoi] = useState('');
    const [createdPaperId, setCreatedPaperId] = useState('');

    useEffect(() => {
        const loadContributors = () => {
            getContributorsByResourceId(props.paperId)
                .then(contributors => {
                    contributors = contributors.filter(c => c.created_by.display_name !== 'Unknown');
                    setContributors(contributors ? contributors.reverse() : []);
                })
                .catch(error => {});
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
            for (const statement of statements) {
                if (statement.object._class === 'resource') {
                    await getResourceAndStatements(statement.object.id, list);
                }
            }

            return list;
        } else {
            return list;
        }
    };

    const getPaperStatements = async paperId => {
        const statements = await getStatementsBySubject({ id: paperId });
        const result = filterObjectOfStatementsByPredicateAndClass(statements, PREDICATES.HAS_CONTRIBUTION, false, CLASSES.CONTRIBUTION);
        const ids = result.map(stmt => stmt.id);
        const c = await getStatementsBySubjects({ ids: ids });
        const data = [];
        for (let j = 0; j < c.length; j++) {
            const cids = c[j].statements;
            for (let i = 0; i < cids.length; i++) {
                const ct = cids[i];
                data.push(ct);
                const st = await getResourceAndStatements(ct.object.id, []);
                data.push(...st);
            }
        }
        return data;
    };

    const publishDOI = async paperId => {
        if (title && title.trim() !== '' && description && description.trim() !== '') {
            const paperStatements = await getPaperStatements(paperId);
            const paper_obj = {
                predicates: [],
                resource: {
                    name: title,
                    classes: [CLASSES.PAPERVERSION],
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
                                    text: viewPaper.publicationMonth.label
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
                        }),
                        [PREDICATES.HAS_AUTHOR]: viewPaper.authors.map(author => ({
                            '@id': author.id
                        }))
                    }
                }
            };

            const createdPaper = await createObject(paper_obj);
            generateDoi({
                type: CLASSES.PAPER,
                resource_type: CLASSES.DATASET,
                resource_id: createdPaper.id,
                title,
                subject: subject ? subject.label : '',
                description,
                related_sources: viewPaper.contributions && viewPaper.contributions[0] ? [viewPaper.contributions[0].id] : [''],
                authors: contributors.map(creator => ({ creator: creator.created_by.display_name, orcid: '' })),
                url: `${getPublicUrl()}${reverse(ROUTES.VIEW_PAPER, { resourceId: createdPaper.id })}`
            })
                .then(doiResponse => {
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
                        setDataCiteDoi(doiResponse.data.attributes.doi);
                        setCreatedPaperId(createdPaper.id);
                        createResourceData({
                            resourceId: createdPaper.id,
                            data: { statements: paperStatements }
                        });
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

    return (
        <Modal size="lg" isOpen={props.showDialog} toggle={props.toggle}>
            <ModalHeader toggle={props.toggle}>Publish ORKG paper</ModalHeader>
            <ModalBody>
                <Alert color="info">
                    {props.paperId && !dataCiteDoi && <>A published paper is made public to other users.</>}
                    {createdPaperId && dataCiteDoi && (
                        <>
                            DOI is assigned sucessfully.{' '}
                            <Link target="_blank" to={reverse(ROUTES.VIEW_PAPER, { resourceId: createdPaperId })}>
                                View published version
                            </Link>
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
    label: PropTypes.string
};

export default Publish;
