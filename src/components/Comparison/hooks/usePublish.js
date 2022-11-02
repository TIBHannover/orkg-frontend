import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import ROUTES from 'constants/routes.js';
import { createResourceStatement, getStatementsBySubjectAndPredicate } from 'services/backend/statements';
import { generateDoi, createObject } from 'services/backend/misc';
import { createLiteral } from 'services/backend/literals';
import { getComparison, createResourceData } from 'services/similarity/index';
import { useSelector, useDispatch } from 'react-redux';
import { reverse } from 'named-urls';
import { useNavigate } from 'react-router-dom';
import { filterObjectOfStatementsByPredicateAndClass, getPublicUrl } from 'utils';
import { setDoi } from 'slices/comparisonSlice';
import { getComparisonURLConfig, getPropertyObjectFromData, activatedContributionsToList } from 'components/Comparison/hooks/helpers';
import { saveAuthors } from 'components/AuthorsInput/helpers';
import { PREDICATES, CLASSES, ENTITIES, MISC } from 'constants/graphSettings';
import { useMatomo } from '@jonkoops/matomo-tracker-react';
import { getConferencesSeries } from 'services/backend/conferencesseries';

function usePublish() {
    const comparisonResource = useSelector(state => state.comparison.comparisonResource);
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const [assignDOI, setAssignDOI] = useState(false);
    const [title, setTitle] = useState(comparisonResource && comparisonResource.label ? comparisonResource.label : '');
    const [description, setDescription] = useState(comparisonResource && comparisonResource.description ? comparisonResource.description : '');
    const [references, setReferences] = useState(
        comparisonResource?.references && comparisonResource.references.length > 0 ? comparisonResource.references : [''],
    );
    const [subject, setSubject] = useState(comparisonResource && comparisonResource.subject ? comparisonResource.subject : undefined);
    const [comparisonCreators, setComparisonCreators] = useState(comparisonResource?.authors ?? []);
    const [conferencesList, setConferencesList] = useState([]);
    const [conference, setConference] = useState(null);
    const [isOpenResearchFieldModal, setIsOpenResearchFieldModal] = useState(false);
    const [inputValue, setInputValue] = useState(null);

    const data = useSelector(state => state.comparison.data);
    const id = useSelector(state => state.comparison.comparisonResource.id);
    const comparisonURLConfig = useSelector(state => getComparisonURLConfig(state.comparison));
    const comparisonType = useSelector(state => state.comparison.configuration.comparisonType);
    const responseHash = useSelector(state => state.comparison.configuration.responseHash);
    const predicatesList = useSelector(state => state.comparison.configuration.predicatesList);
    const contributionsList = useSelector(state => activatedContributionsToList(state.comparison.contributions));

    const { trackEvent } = useMatomo();
    const displayName = useSelector(state => state.auth?.user?.displayName ?? null);

    const handleCreatorsChange = creators => {
        const _creators = creators || [];
        setComparisonCreators(_creators);
    };

    useEffect(() => {
        setTitle(comparisonResource && comparisonResource.label ? comparisonResource.label : '');
        setDescription(comparisonResource && comparisonResource.description ? comparisonResource.description : '');
        setReferences(comparisonResource?.references && comparisonResource.references.length > 0 ? comparisonResource.references : ['']);
        setSubject(comparisonResource && comparisonResource.subject ? comparisonResource.subject : undefined);
        setComparisonCreators(
            comparisonResource.authors
                ? comparisonResource.authors
                : [{ label: displayName, id: displayName, orcid: '', statementId: '', __isNew__: true }],
        );
    }, [comparisonResource, displayName]);

    useEffect(() => {
        const getConferencesList = () => {
            getConferencesSeries().then(response => {
                setConferencesList(response);
            });
        };
        getConferencesList();
    }, []);

    const handleSubmit = async e => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (!id) {
                if (title && title.trim() !== '' && description && description.trim() !== '' && (!assignDOI || comparisonCreators?.length > 0)) {
                    let response_hash;

                    if (!responseHash) {
                        const comparison = await getComparison({
                            contributionIds: contributionsList,
                            type: comparisonType,
                            save_response: true,
                        });
                        response_hash = comparison.response_hash;
                    } else {
                        response_hash = responseHash;
                    }
                    const comparisonObject = {
                        predicates: [],
                        resource: {
                            name: title,
                            classes: [CLASSES.COMPARISON],
                            values: {
                                [PREDICATES.DESCRIPTION]: [
                                    {
                                        text: description,
                                    },
                                ],
                                ...(references &&
                                    references.length > 0 && {
                                        [PREDICATES.REFERENCE]: references
                                            .filter(reference => reference && reference.trim() !== '')
                                            .map(reference => ({
                                                text: reference,
                                            })),
                                    }),
                                ...(subject &&
                                    subject.id && {
                                        [PREDICATES.HAS_SUBJECT]: [
                                            {
                                                '@id': subject.id,
                                            },
                                        ],
                                    }),
                                [PREDICATES.COMPARE_CONTRIBUTION]: contributionsList.map(contributionID => ({
                                    '@id': contributionID,
                                })),
                                [PREDICATES.HAS_PROPERTY]: predicatesList.map(predicateID => {
                                    const property = comparisonType === 'merge' ? predicateID : getPropertyObjectFromData(data, { id: predicateID });
                                    return { '@id': property.id, '@type': ENTITIES.PREDICATE };
                                }),
                                ...(comparisonResource.hasPreviousVersion && {
                                    [PREDICATES.HAS_PREVIOUS_VERSION]: [
                                        {
                                            '@id': comparisonResource.hasPreviousVersion.id,
                                        },
                                    ],
                                }),
                                ...(conference &&
                                    conference.metadata?.is_double_blind && {
                                        [PREDICATES.IS_ANONYMIZED]: [
                                            {
                                                text: true,
                                                datatype: 'xsd:boolean',
                                            },
                                        ],
                                    }),
                            },
                            observatoryId: MISC.UNKNOWN_ID,
                            organizationId: conference ? conference.id : MISC.UNKNOWN_ID,
                        },
                    };
                    const createdComparison = await createObject(comparisonObject);
                    await saveAuthors(comparisonCreators, createdComparison.id);
                    await createResourceData({
                        resourceId: createdComparison.id,
                        data: { url: `${comparisonURLConfig}&response_hash=${response_hash}` },
                    });
                    trackEvent({ category: 'data-entry', action: 'publish-comparison' });
                    toast.success('Comparison saved successfully');
                    // Assign a DOI
                    if (assignDOI) {
                        publishDOI(createdComparison.id);
                    }
                    setIsLoading(false);
                    navigate(reverse(ROUTES.COMPARISON, { comparisonId: createdComparison.id }));
                } else {
                    throw Error('Please enter a title, description and creator(s)');
                }
            } else {
                publishDOI(id);
            }
        } catch (error) {
            toast.error(`Error publishing a comparison : ${error.message}`);
            setIsLoading(false);
        }
    };

    const publishDOI = async comparisonId => {
        try {
            if (id && comparisonResource?.authors.length === 0) {
                await saveAuthors(comparisonCreators, id);
            }
            // Load ORCID of curators
            let comparisonCreatorsORCID = comparisonCreators.map(async curator => {
                if (!curator.orcid && curator._class === ENTITIES.RESOURCE) {
                    const statements = await getStatementsBySubjectAndPredicate({ subjectId: curator.id, predicateId: PREDICATES.HAS_ORCID });
                    return { ...curator, orcid: filterObjectOfStatementsByPredicateAndClass(statements, PREDICATES.HAS_ORCID, true)?.label };
                }
                return curator;
            });
            comparisonCreatorsORCID = await Promise.all(comparisonCreatorsORCID);
            if (title && title.trim() !== '' && description && description.trim() !== '' && comparisonCreators?.length > 0) {
                generateDoi({
                    type: 'Comparison',
                    resource_type: 'Dataset',
                    resource_id: comparisonId,
                    title,
                    subject: subject ? subject.label : '',
                    description,
                    related_resources: contributionsList,
                    authors: comparisonCreatorsORCID.map(c => ({ creator: c.label, orcid: c.orcid })),
                    url: `${getPublicUrl()}${reverse(ROUTES.COMPARISON, { comparisonId })}`,
                })
                    .then(doiResponse => {
                        dispatch(setDoi(doiResponse.data.attributes.doi));
                        createLiteral(doiResponse.data.attributes.doi).then(doiLiteral => {
                            createResourceStatement(comparisonId, PREDICATES.HAS_DOI, doiLiteral.id);
                            setIsLoading(false);
                            toast.success('DOI has been registered successfully');
                        });
                    })
                    .catch(error => {
                        console.log('error', error);
                        toast.error('Error publishing a DOI');
                        setIsLoading(false);
                    });
            } else {
                throw Error('Please enter a title, description and creator(s)');
            }
        } catch (error) {
            console.error(error);
            toast.error(`Error publishing a comparison: ${error.message}`);
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

    const handleSelectField = ({ _id, label }) =>
        setSubject({
            id: _id,
            label,
        });

    return {
        displayName,
        comparisonResource,
        id,
        assignDOI,
        title,
        description,
        comparisonCreators,
        subject,
        inputValue,
        conference,
        references,
        conferencesList,
        isLoading,
        isOpenResearchFieldModal,
        setTitle,
        setDescription,
        setSubject,
        setInputValue,
        setIsOpenResearchFieldModal,
        setAssignDOI,
        setReferences,
        setConference,
        handleSelectField,
        handleCreatorsChange,
        handleRemoveReferenceClick,
        handleReferenceChange,
        handleSubmit,
    };
}
export default usePublish;
