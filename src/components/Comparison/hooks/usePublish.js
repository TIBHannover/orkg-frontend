import { useMatomo } from '@jonkoops/matomo-tracker-react';
import { activatedContributionsToList, getComparisonConfigObject, getPropertyObjectFromData } from 'components/Comparison/hooks/helpers';
import { createAuthorsList } from 'components/Input/AuthorsInput/helpers';
import useRouter from 'components/NextJsMigration/useRouter';
import { CLASSES, ENTITIES, MISC, PREDICATES } from 'constants/graphSettings';
import { CONFERENCE_REVIEW_MISC } from 'constants/organizationsTypes';
import ROUTES from 'constants/routes';
import THING_TYPES from 'constants/thingTypes';
import { reverse } from 'named-urls';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getComparison, publishComparisonDoi } from 'services/backend/comparisons';
import { getConferenceById, getConferencesSeries } from 'services/backend/conferences-series';
import { createObject } from 'services/backend/misc';
import { getStatementsBySubject, getStatementsBySubjectAndPredicate } from 'services/backend/statements';
import { createThing } from 'services/similarity';
import { setDoi } from 'slices/comparisonSlice';
import { addAuthorsToStatements, filterObjectOfStatementsByPredicateAndClass, getComparisonData, getErrorMessage } from 'utils';

function usePublish() {
    const comparisonResource = useSelector((state) => state.comparison.comparisonResource);
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const [assignDOI, setAssignDOI] = useState(false);
    const [title, setTitle] = useState(comparisonResource && comparisonResource.label ? comparisonResource.label : '');
    const [sdgs, setSdgs] = useState(comparisonResource && comparisonResource.sdgs ? comparisonResource.sdgs : []);
    const [description, setDescription] = useState(comparisonResource && comparisonResource.description ? comparisonResource.description : '');
    const [references, setReferences] = useState(
        comparisonResource?.references && comparisonResource.references.length > 0 ? comparisonResource.references : [''],
    );
    const [researchField, setResearchField] = useState(
        comparisonResource && comparisonResource.researchField ? comparisonResource.researchField : undefined,
    );
    const [comparisonCreators, setComparisonCreators] = useState(comparisonResource?.authors ?? []);
    const [conferencesList, setConferencesList] = useState([]);
    const [conference, setConference] = useState(null);

    const data = useSelector((state) => state.comparison.data);
    const contributions = useSelector((state) => state.comparison.contributions);
    const properties = useSelector((state) => state.comparison.properties);

    const id = useSelector((state) => state.comparison.comparisonResource.id);
    const comparisonConfigObject = useSelector((state) => getComparisonConfigObject(state.comparison));
    const comparisonType = useSelector((state) => state.comparison.configuration.comparisonType);

    const predicatesList = useSelector((state) => state.comparison.configuration.predicatesList);
    const contributionsList = useSelector((state) => activatedContributionsToList(state.comparison.contributions));

    const { trackEvent } = useMatomo();
    const displayName = useSelector((state) => state.auth?.user?.displayName ?? null);

    const handleCreatorsChange = (creators) => {
        const _creators = creators || [];
        setComparisonCreators(_creators);
    };

    useEffect(() => {
        setTitle(comparisonResource && comparisonResource.label ? comparisonResource.label : '');
        setDescription(comparisonResource && comparisonResource.description ? comparisonResource.description : '');
        setReferences(comparisonResource?.references && comparisonResource.references.length > 0 ? comparisonResource.references : ['']);
        setResearchField(comparisonResource && comparisonResource.researchField ? comparisonResource.researchField : undefined);
        setComparisonCreators(
            comparisonResource.authors
                ? comparisonResource.authors
                : [{ label: displayName, id: displayName, orcid: '', statementId: '', __isNew__: true }],
        );
    }, [comparisonResource, displayName]);

    const getConference = async (conferenceId) => {
        if (!conferenceId || conferenceId === MISC.UNKNOWN_ID) {
            return null;
        }
        try {
            return await getConferenceById(conferenceId);
        } catch (e) {
            return null;
        }
    };

    // populate the publish model with metadata when republishing an existing comparison
    useEffect(() => {
        if (!comparisonResource?.hasPreviousVersion?.id || comparisonResource?.id) {
            return;
        }
        const fetchData = async () => {
            let statements = await getStatementsBySubject({ id: comparisonResource.hasPreviousVersion.id });
            statements = await addAuthorsToStatements(statements);
            const comparisonData = getComparisonData(statements[0].subject, statements);
            setTitle(comparisonData.label);
            setDescription(comparisonData.description);
            setResearchField(comparisonData.researchField);
            setComparisonCreators(comparisonData.authors);
            setSdgs(comparisonData.sdgs);
            setReferences(comparisonData.references.length > 0 ? comparisonData.references.map((reference) => reference.label) : ['']);
            setConference((await getConference(comparisonData.organization_id)) ?? null);
        };
        fetchData();
    }, [comparisonResource?.hasPreviousVersion?.id, comparisonResource?.id]);

    useEffect(() => {
        const getConferencesList = () => {
            getConferencesSeries().then((response) => {
                setConferencesList(response.content);
            });
        };
        getConferencesList();
    }, []);

    const publishDOI = async (comparisonId) => {
        try {
            if (id && comparisonResource?.authors.length === 0) {
                await createAuthorsList({ authors: comparisonCreators, resourceId: id });
            }
            // Load ORCID of curators
            let comparisonCreatorsORCID = comparisonCreators.map(async (curator) => {
                if (!curator.orcid && curator._class === ENTITIES.RESOURCE) {
                    const statements = await getStatementsBySubjectAndPredicate({ subjectId: curator.id, predicateId: PREDICATES.HAS_ORCID });
                    return { ...curator, orcid: filterObjectOfStatementsByPredicateAndClass(statements, PREDICATES.HAS_ORCID, true)?.label };
                }
                return curator;
            });
            comparisonCreatorsORCID = await Promise.all(comparisonCreatorsORCID);
            if (title && title.trim() !== '' && description && description.trim() !== '' && comparisonCreators?.length > 0) {
                try {
                    await publishComparisonDoi({
                        id: comparisonId,
                        subject: researchField ? researchField.label : '',
                        description,
                        authors: comparisonCreatorsORCID.map((creator) => ({
                            name: creator.label,
                            ...(creator.orcid ? { identifiers: { orcid: [creator.orcid] } } : {}),
                        })),
                    });
                    const doi = (await getComparison(comparisonId))?.identifiers.doi;
                    dispatch(setDoi(doi));
                    toast.success('DOI has been registered successfully');
                } catch (e) {
                    toast.error('Error publishing a DOI');
                    console.error(e);
                } finally {
                    setIsLoading(false);
                }
            } else {
                throw Error('Please enter a title, description and creator(s)');
            }
        } catch (error) {
            console.error(error);
            toast.error(`Error publishing a comparison: ${error.message}`);
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (!id) {
                if (
                    title &&
                    title.trim() !== '' &&
                    description &&
                    description.trim() !== '' &&
                    researchField?.id &&
                    (!assignDOI || comparisonCreators?.length > 0)
                ) {
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
                                            .filter((reference) => reference && reference.trim() !== '')
                                            .map((reference) => ({
                                                text: reference,
                                            })),
                                    }),
                                ...(researchField &&
                                    researchField.id && {
                                        [PREDICATES.HAS_SUBJECT]: [
                                            {
                                                '@id': researchField.id,
                                            },
                                        ],
                                    }),
                                [PREDICATES.COMPARE_CONTRIBUTION]: contributionsList.map((contributionID) => ({
                                    '@id': contributionID,
                                })),
                                ...(comparisonType === 'MERGE' && {
                                    [PREDICATES.HAS_PROPERTY]: predicatesList.map((predicateID) => {
                                        const property =
                                            comparisonType === 'MERGE' ? predicateID : getPropertyObjectFromData(data, { id: predicateID });
                                        return { '@id': property.id };
                                    }),
                                }),
                                ...(comparisonResource.hasPreviousVersion && {
                                    [PREDICATES.HAS_PREVIOUS_VERSION]: [
                                        {
                                            '@id': comparisonResource.hasPreviousVersion.id,
                                        },
                                    ],
                                }),
                                ...(conference &&
                                    conference.metadata?.review_process === CONFERENCE_REVIEW_MISC.DOUBLE_BLIND && {
                                        [PREDICATES.IS_ANONYMIZED]: [
                                            {
                                                text: true,
                                                datatype: 'xsd:boolean',
                                            },
                                        ],
                                    }),
                                ...(sdgs &&
                                    sdgs.length > 0 && {
                                        [PREDICATES.SUSTAINABLE_DEVELOPMENT_GOAL]: sdgs.map((sdg) => ({
                                            '@id': sdg.id,
                                        })),
                                    }),
                            },
                            observatoryId: MISC.UNKNOWN_ID,
                            organizationId: conference ? conference.id : MISC.UNKNOWN_ID,
                        },
                    };
                    const createdComparison = await createObject(comparisonObject);
                    await createAuthorsList({ authors: comparisonCreators, resourceId: createdComparison.id });
                    await createThing({
                        thingKey: createdComparison.id,
                        thingType: THING_TYPES.COMPARISON,
                        config: comparisonConfigObject,
                        data: { contributions, predicates: properties, data },
                    });

                    trackEvent({ category: 'data-entry', action: 'publish-comparison' });
                    toast.success('Comparison saved successfully');
                    // Assign a DOI
                    if (assignDOI) {
                        publishDOI(createdComparison.id);
                    }
                    setIsLoading(false);
                    router.push(reverse(ROUTES.COMPARISON, { comparisonId: createdComparison.id }));
                } else {
                    throw Error('Please enter a title, description, research field, and creator(s)');
                }
            } else {
                publishDOI(id);
            }
        } catch (error) {
            console.log(error);
            toast.error(`Error publishing a comparison : ${getErrorMessage(error)}`);
            setIsLoading(false);
        }
    };

    const handleRemoveReferenceClick = (index) => {
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

    return {
        displayName,
        comparisonResource,
        id,
        assignDOI,
        title,
        description,
        comparisonCreators,
        researchField,
        conference,
        references,
        conferencesList,
        isLoading,
        sdgs,
        setTitle,
        setDescription,
        setResearchField,
        setAssignDOI,
        setReferences,
        setConference,
        handleCreatorsChange,
        handleRemoveReferenceClick,
        handleReferenceChange,
        handleSubmit,
        setSdgs,
    };
}
export default usePublish;
