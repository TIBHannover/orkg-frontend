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
import { PREDICATES, CLASSES, ENTITIES, MISC } from 'constants/graphSettings';
import { getContributorsByResourceId } from 'services/backend/resources';
import { getPublicUrl, filterObjectOfStatementsByPredicateAndClass, getErrorMessage } from 'utils';
import { getStatementsBySubject, createResourceStatement, deleteStatementById, getStatementsBundleBySubject } from 'services/backend/statements';
import { createResourceData } from 'services/similarity/index';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { faClipboard } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { uniqBy, flatten } from 'lodash';
import { AuthorTag } from 'components/AuthorsInput/styled';

function Publish(props) {
    const [isLoading, setIsLoading] = useState(false);
    const [description, setDescription] = useState('');
    const [subject, setSubject] = useState(null);
    const [contributors, setContributors] = useState([]);
    const viewPaper = useSelector(state => state.viewPaper);
    const [dataCiteDoi, setDataCiteDoi] = useState('');
    const [createdPaperId, setCreatedPaperId] = useState('');
    const title = viewPaper.paperResource.label;

    useEffect(() => {
        const loadContributors = () => {
            getContributorsByResourceId(viewPaper.paperResource.id)
                .then(result => {
                    const contributorsList = result.filter(c => c.created_by.id !== MISC.UNKNOWN_ID);
                    setContributors(contributorsList ? uniqBy(contributorsList, 'created_by.id') : []);
                })
                .catch(() => {});
        };

        loadContributors();
    }, [viewPaper.paperResource.id]);

    useEffect(() => {
        setSubject(viewPaper.researchField);
    }, [viewPaper.researchField]);

    const getPaperStatements = async paperId => {
        const pStatements = await getStatementsBySubject({ id: paperId });
        const contributions = filterObjectOfStatementsByPredicateAndClass(pStatements, PREDICATES.HAS_CONTRIBUTION, false, CLASSES.CONTRIBUTION);
        const contributionAPIcalls = contributions.map(contribution =>
            getStatementsBundleBySubject({ id: contribution.id, maxLevel: 10, blacklist: [CLASSES.RESEARCH_FIELD] }),
        );
        const statements = await Promise.all(contributionAPIcalls).then(r => flatten(r.map(c => c.statements)));
        return statements;
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
                        ...(subject?.id && {
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
                // we send only one contribution id because we want to create a DOI for the whole paper and not for each contribution.
                // the backend will fetch the paper original DOI
                related_sources: viewPaper.contributions?.[0] ? [viewPaper.contributions[0].id] : [''],
                authors: contributors.map(creator => ({ creator: creator.created_by.display_name, orcid: '' })),
                url: `${getPublicUrl()}${reverse(ROUTES.VIEW_PAPER, { resourceId: createdPaper.id })}`,
            })
                .then(async doiResponse => {
                    // The followed model:
                    // https://gitlab.com/TIBHannover/orkg/orkg-frontend/-/wikis/Modeling-of-persistent-identification-of-ORKG-papers
                    const doiLiteral = await createLiteral(doiResponse.data.attributes.doi);
                    const apiCalls = [createResourceStatement(createdPaper.id, PREDICATES.HAS_DOI, doiLiteral.id)];
                    if (viewPaper.hasVersion) {
                        await deleteStatementById(viewPaper.hasVersion.statementId);
                        apiCalls.push(createResourceStatement(createdPaper.id, PREDICATES.HAS_PREVIOUS_VERSION, viewPaper.hasVersion.id));
                    }
                    apiCalls.push(createResourceStatement(viewPaper.paperResource.id, PREDICATES.HAS_PREVIOUS_VERSION, createdPaper.id));
                    apiCalls.push(
                        createResourceData({
                            resourceId: createdPaper.id,
                            data: { statements: paperStatements },
                        }),
                    );
                    await Promise.all(apiCalls);
                    setDataCiteDoi(doiResponse.data.attributes.doi);
                    setCreatedPaperId(createdPaper.id);
                    setIsLoading(false);
                    toast.success('DOI has been registered successfully');
                })
                .catch(() => {
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
            toast.error(`Error publishing a paper : ${getErrorMessage(error)}`);
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
};

export default Publish;
