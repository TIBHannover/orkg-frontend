import { faClipboard } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import Autocomplete from 'components/Autocomplete/Autocomplete';
import ButtonWithLoading from 'components/ButtonWithLoading/ButtonWithLoading';
import AuthorsInput from 'components/Input/AuthorsInput/AuthorsInput';
import { createAuthorsList } from 'components/Input/AuthorsInput/helpers';
import Link from 'components/NextJsMigration/Link';
import Tooltip from 'components/Utils/Tooltip';
import { CLASSES, ENTITIES, PREDICATES } from 'constants/graphSettings';
import { MAX_LENGTH_INPUT } from 'constants/misc';
import ROUTES from 'constants/routes.js';
import THING_TYPES from 'constants/thingTypes';
import { flatten } from 'lodash';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Alert, Button, FormGroup, Input, InputGroup, Label, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { createLiteral } from 'services/backend/literals';
import { createObject, generateDoi } from 'services/backend/misc';
import {
    createResourceStatement,
    deleteStatementById,
    getStatementsBundleBySubject,
    getStatementsBySubject,
    getStatementsBySubjectAndPredicate,
} from 'services/backend/statements';
import { createThing } from 'services/similarity';
import {
    convertAuthorsToNewFormat,
    convertAuthorsToOldFormat,
    filterObjectOfStatementsByPredicateAndClass,
    getErrorMessage,
    getPublicUrl,
} from 'utils';

function Publish(props) {
    const [isLoading, setIsLoading] = useState(false);
    const [description, setDescription] = useState('');
    const [subject, setSubject] = useState(null);
    const [creators, setCreators] = useState([]);
    const viewPaper = useSelector(state => state.viewPaper.paper);
    const version = useSelector(state => state.viewPaper.version);
    const [dataCiteDoi, setDataCiteDoi] = useState('');
    const [createdPaperId, setCreatedPaperId] = useState('');
    const { title } = viewPaper;

    useEffect(() => {
        setSubject(viewPaper.research_fields.length > 0 ? viewPaper.research_fields?.[0] : null);
    }, [viewPaper]);

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
                        ...(viewPaper.publication_info?.published_month && {
                            [PREDICATES.HAS_PUBLICATION_MONTH]: [
                                {
                                    text: viewPaper.publication_info?.published_month,
                                },
                            ],
                        }),
                        ...(viewPaper.publication_info?.published_month && {
                            [PREDICATES.HAS_PUBLICATION_YEAR]: [
                                {
                                    text: viewPaper.publication_info?.published_month,
                                },
                            ],
                        }),
                        ...(viewPaper.identifiers?.doi?.[0] && {
                            [PREDICATES.HAS_DOI]: [
                                {
                                    text: viewPaper.identifiers?.doi?.[0],
                                },
                            ],
                        }),
                    },
                },
            };

            let paperCreatorsORCID = creators.map(async curator => {
                if (!curator.orcid && curator._class === ENTITIES.RESOURCE) {
                    const statements = await getStatementsBySubjectAndPredicate({ subjectId: curator.id, predicateId: PREDICATES.HAS_ORCID });
                    return { ...curator, orcid: filterObjectOfStatementsByPredicateAndClass(statements, PREDICATES.HAS_ORCID, true)?.label };
                }
                return curator;
            });
            paperCreatorsORCID = await Promise.all(paperCreatorsORCID);
            const createdPaper = await createObject(paperObj);
            await createAuthorsList({ authors: convertAuthorsToOldFormat(viewPaper.authors), resourceId: createdPaper.id });
            generateDoi({
                type: CLASSES.PAPER,
                resource_type: CLASSES.DATASET,
                resource_id: createdPaper.id,
                title,
                subject: subject ? subject.label : '',
                description,
                // we send only one contribution id because we want to create a DOI for the whole paper and not for each contribution.
                // the backend will fetch the paper original DOI
                related_resources: viewPaper.contributions?.[0] ? [viewPaper.contributions[0].id] : [''],
                authors: paperCreatorsORCID.map(creator => ({ creator: creator.label, orcid: creator.orcid ? creator.orcid : null })),
                url: `${getPublicUrl()}${reverse(ROUTES.VIEW_PAPER, { resourceId: createdPaper.id })}`,
            })
                .then(async doiResponse => {
                    // The followed model:
                    // https://gitlab.com/TIBHannover/orkg/orkg-frontend/-/wikis/Modeling-of-persistent-identification-of-ORKG-papers
                    const doiLiteral = await createLiteral(doiResponse.doi);
                    const apiCalls = [createResourceStatement(createdPaper.id, PREDICATES.HAS_DOI, doiLiteral.id)];
                    if (version) {
                        await deleteStatementById(version.statementId);
                        apiCalls.push(createResourceStatement(createdPaper.id, PREDICATES.HAS_PREVIOUS_VERSION, version.id));
                    }
                    apiCalls.push(createResourceStatement(viewPaper.id, PREDICATES.HAS_PREVIOUS_VERSION, createdPaper.id));
                    apiCalls.push(
                        createThing({ thingType: THING_TYPES.PAPER_VERSION, thingKey: createdPaper.id, data: { statements: paperStatements } }),
                    );
                    await Promise.all(apiCalls);
                    setDataCiteDoi(doiResponse.doi);
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
            publishDOI(viewPaper.id);
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
                    {viewPaper.id && !dataCiteDoi && (
                        <>Persistently identified paper will be findable in global scholarly infrastructures (DataCite, OpenAIRE and ORCID).</>
                    )}
                    {createdPaperId && dataCiteDoi && (
                        <>
                            DOI is assigned successfully.{' '}
                            <Link target="_blank" href={reverse(ROUTES.VIEW_PAPER, { resourceId: createdPaperId })}>
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
                            <Input type="text" maxLength={MAX_LENGTH_INPUT} name="title" value={`${title} [ORKG]`} disabled={true} id="title" />
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
                                maxLength={MAX_LENGTH_INPUT}
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
                            {!dataCiteDoi && viewPaper.id && (
                                <AuthorsInput
                                    disabled={true}
                                    itemLabel="creator"
                                    handler={_creators => setCreators(convertAuthorsToOldFormat(_creators) || [])}
                                    value={convertAuthorsToNewFormat(creators)}
                                />
                            )}
                        </FormGroup>
                    </>
                )}

                <></>
            </ModalBody>
            {!dataCiteDoi && (
                <ModalFooter>
                    {!dataCiteDoi && (
                        <div className="text-align-center mt-2">
                            <ButtonWithLoading color="primary" isLoading={isLoading} onClick={handleSubmit}>
                                Publish DOI
                            </ButtonWithLoading>
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
