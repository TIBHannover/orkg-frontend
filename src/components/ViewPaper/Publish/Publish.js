import { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Input, Button, Label, FormGroup, Alert, InputGroup } from 'reactstrap';
import { toast } from 'react-toastify';
import ROUTES from 'constants/routes.js';
import PropTypes from 'prop-types';
import { generateDoi, createObject } from 'services/backend/misc';
import { createLiteral } from 'services/backend/literals';
import Tooltip from 'components/Utils/Tooltip';
import Autocomplete from 'components/Autocomplete/Autocomplete';
import { reverse } from 'named-urls';
import styled from 'styled-components';
import { PREDICATES, CLASSES, ENTITIES } from 'constants/graphSettings';
import { getContributorsByResourceId } from 'services/backend/resources';
import { getPublicUrl, filterObjectOfStatementsByPredicateAndClass } from 'utils';
import { getStatementsBySubject, createResourceStatement, deleteStatementById, getStatementsBundleBySubject } from 'services/backend/statements';
import { createResourceData } from 'services/similarity/index';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { faClipboard } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';

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
    const [description, setDescription] = useState('');
    const [subject, setSubject] = useState('');
    const [contributors, setContributors] = useState([]);
    const viewPaper = useSelector(state => state.viewPaper);
    const [dataCiteDoi, setDataCiteDoi] = useState('');
    const [createdPaperId, setCreatedPaperId] = useState('');
    const title = viewPaper.paperResource.label;

    useEffect(() => {
        const loadContributors = () => {
            getContributorsByResourceId(viewPaper.paperResource.id)
                .then(contrs => {
                    const contributorsList = contrs.filter(c => c.created_by.display_name !== 'Unknown');
                    setContributors(contributorsList ? contributorsList.reverse() : []);
                })
                .catch(error => {});
        };
        setSubject(viewPaper.researchField);
        loadContributors();
    }, [props.label, viewPaper]);

    const getPaperStatements = async paperId => {
        const statements = await getStatementsBySubject({ id: paperId });
        const result = filterObjectOfStatementsByPredicateAndClass(statements, PREDICATES.HAS_CONTRIBUTION, false, CLASSES.CONTRIBUTION);
        const ids = result.map(c => c.id);
        const data = [];
        for (let j = 0; j < ids.length; j += 1) {
            const bstatements = getStatementsBundleBySubject({ id: ids[j], maxLevel: 10, blacklist: [CLASSES.RESEARCH_FIELD] });
            data.push(bstatements);
        }
        const res = [];
        await Promise.all(data).then(r => {
            for (let t = 0; t < r.length; t += 1) {
                res.push(...r[t].statements);
            }
        });
        return res;
    };

    const publishDOI = async paperId => {
        if (title && title.trim() !== '' && description && description.trim() !== '') {
            const paperStatements = await getPaperStatements(paperId);
            if (paperStatements.length === 0) {
                toast.error('Paper must have at least one contribution to be persistently identified.');
                setIsLoading(false);
                return;
            }
            const paperObj = {
                predicates: [],
                resource: {
                    name: title,
                    classes: [CLASSES.PAPER_VERSION],
                    values: {
                        ...(subject &&
                            subject.id && {
                                [PREDICATES.HAS_RESEARCH_FIELD]: [
                                    {
                                        '@id': subject.id,
                                    },
                                ],
                            }),
                        ...(viewPaper.publicationMonth && {
                            [PREDICATES.HAS_PUBLICATION_MONTH]: [
                                {
                                    text: viewPaper.publicationMonth.label,
                                },
                            ],
                        }),
                        ...(viewPaper.publicationYear && {
                            [PREDICATES.HAS_PUBLICATION_YEAR]: [
                                {
                                    text: viewPaper.publicationYear.label,
                                },
                            ],
                        }),
                        ...(viewPaper.doi && {
                            [PREDICATES.HAS_DOI]: [
                                {
                                    '@id': viewPaper.doi.id,
                                },
                            ],
                        }),
                        [PREDICATES.HAS_AUTHOR]: viewPaper.authors.map(author => ({
                            '@id': author.id,
                        })),
                    },
                },
            };

            const createdPaper = await createObject(paperObj);
            generateDoi({
                type: CLASSES.PAPER,
                resource_type: CLASSES.DATASET,
                resource_id: createdPaper.id,
                title,
                subject: subject ? subject.label : '',
                description,
                related_sources: viewPaper.contributions && viewPaper.contributions[0] ? [viewPaper.contributions[0].id] : [''],
                authors: contributors.map(creator => ({ creator: creator.created_by.display_name, orcid: '' })),
                url: `${getPublicUrl()}${reverse(ROUTES.VIEW_PAPER, { resourceId: createdPaper.id })}`,
            })
                .then(doiResponse => {
                    createLiteral(doiResponse.data.attributes.doi).then(async doiLiteral => {
                        createResourceStatement(createdPaper.id, PREDICATES.HAS_DOI, doiLiteral.id);
                        if (viewPaper.hasVersion) {
                            await deleteStatementById(viewPaper.hasVersion.statementId);
                            createResourceStatement(createdPaper.id, PREDICATES.HAS_PREVIOUS_VERSION, viewPaper.hasVersion.id);
                        }
                        createResourceStatement(viewPaper.paperResource.id, PREDICATES.HAS_PREVIOUS_VERSION, createdPaper.id);
                        setDataCiteDoi(doiResponse.data.attributes.doi);
                        setCreatedPaperId(createdPaper.id);
                        createResourceData({
                            resourceId: createdPaper.id,
                            data: { statements: paperStatements },
                        });
                        setIsLoading(false);
                        toast.success('DOI has been registered successfully');
                    });
                })
                .catch(error => {
                    toast.error('Error publishing a DOI');
                    setIsLoading(false);
                });
        } else {
            toast.error('Title or a description is missing.');
            setIsLoading(false);
        }
    };

    const handleSubmit = e => {
        e.preventDefault();
        setIsLoading(true);
        try {
            publishDOI(viewPaper.paperResource.id);
        } catch (error) {
            toast.error(`Error publishing a paper : ${error.message}`);
            setIsLoading(false);
        }
    };

    return (
        <Modal size="lg" isOpen={props.showDialog} toggle={props.toggle}>
            <ModalHeader toggle={props.toggle}>Publish ORKG paper</ModalHeader>
            <ModalBody>
                <Alert color="info">
                    {viewPaper.paperResource.id && !dataCiteDoi && (
                        <>Persistently identified paper will be findable in global scholarly infrastructures (DataCite, OpenAIRE and ORCID).</>
                    )}
                    {createdPaperId && dataCiteDoi && (
                        <>
                            DOI is assigned successfully.{' '}
                            <Link target="_blank" to={reverse(ROUTES.VIEW_PAPER, { resourceId: createdPaperId })}>
                                View published version
                            </Link>
                        </>
                    )}
                </Alert>
                {createdPaperId && dataCiteDoi && (
                    <>
                        <FormGroup>
                            <Label for="doi_link">DOI</Label>
                            <InputGroup>
                                <Input id="doi_link" value={`https://doi.org/${dataCiteDoi}`} disabled />
                                <CopyToClipboard
                                    text={`https://doi.org/${dataCiteDoi}`}
                                    onCopy={() => {
                                        toast.dismiss();
                                        toast.success('DOI link copied!');
                                    }}
                                >
                                    <Button color="primary" className="pl-3 pr-3" style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}>
                                        <Icon icon={faClipboard} />
                                    </Button>
                                </CopyToClipboard>
                            </InputGroup>
                        </FormGroup>
                    </>
                )}
                {!dataCiteDoi && (
                    <>
                        {' '}
                        <FormGroup>
                            <Label for="title">
                                <Tooltip message="Title of the paper">Title</Tooltip>
                            </Label>
                            <Input type="text" name="title" value={`${title} [ORKG]`} disabled={true} id="title" />
                        </FormGroup>
                        <FormGroup>
                            <Label for="description">
                                <Tooltip message="Description of the paper">Description</Tooltip>
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
                                <Tooltip message="Enter a subject of the paper">Research Field</Tooltip>
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
                                <Tooltip message="The creator or creators of ORKG paper.">Creators</Tooltip>
                            </Label>
                            {!dataCiteDoi &&
                                viewPaper.paperResource.id &&
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
    label: PropTypes.string,
};

export default Publish;
