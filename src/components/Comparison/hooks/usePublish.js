import { useMatomo } from '@jonkoops/matomo-tracker-react';
import { activatedContributionsToList, getComparisonConfigObject } from 'components/Comparison/hooks/helpers';
import { CLASSES, MISC, PREDICATES } from 'constants/graphSettings';
import { CONFERENCE_REVIEW_MISC } from 'constants/organizationsTypes';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { createComparison, publishComparison } from 'services/backend/comparisons';
import { getConferenceById, getConferencesSeries } from 'services/backend/conferences-series';
import { createLiteral } from 'services/backend/literals';
import { generateDoi } from 'services/backend/misc';
import { createResourceStatement, getStatementsBySubject } from 'services/backend/statements';
import { setDoi } from 'slices/comparisonSlice';
import { addAuthorsToStatements, getComparisonData, getErrorMessage, getPublicUrl } from 'utils';

function usePublish() {
    const dispatch = useDispatch();
    const comparisonResource = useSelector((state) => state.comparison.comparisonResource);
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

    const getAuthors = () =>
        comparisonCreators.map((author) => ({
            name: author.label,
            ...(author.orcid && { identifiers: { orcid: [author.orcid] } }),
        }));

    const publish = (comparisonId) =>
        publishComparison(comparisonId, {
            subject: researchField ? researchField.label : '',
            description,
            config: comparisonConfigObject,
            authors: getAuthors(),
            data: {
                data,
                contributions,
                predicates: properties,
            },
            assign_doi: assignDOI,
        });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (!id) {
                if (title && title.trim() !== '' && description && description.trim() !== '' && researchField?.id && comparisonCreators?.length > 0) {
                    const comparisonId = await createComparison({
                        title,
                        description,
                        references: references.filter((reference) => reference && reference.trim() !== ''),
                        authors: getAuthors(),
                        research_fields: [researchField.id],
                        sdgs: sdgs.map((sdg) => sdg.id),
                        contributions: contributionsList,
                        organizations: conference ? [conference.id] : [],
                        observatories: [],
                        is_anonymized: conference && conference.metadata?.review_process === CONFERENCE_REVIEW_MISC.DOUBLE_BLIND,
                    });
                    await publish(comparisonId);

                    if (comparisonResource.hasPreviousVersion) {
                        await createResourceStatement(comparisonId, PREDICATES.HAS_PREVIOUS_VERSION, comparisonResource.hasPreviousVersion.id);
                    }

                    trackEvent({ category: 'data-entry', action: 'publish-comparison' });
                    toast.success('Comparison saved successfully');
                    setIsLoading(false);
                    router.push(reverse(ROUTES.COMPARISON, { comparisonId }));
                } else {
                    throw Error('Please enter a title, description, research field, and creator(s)');
                }
            } else {
                const doiResponse = await generateDoi({
                    type: CLASSES.COMPARISON,
                    resource_type: 'Dataset',
                    resource_id: id,
                    title,
                    subject: researchField ? researchField.label : '',
                    description,
                    authors: getAuthors().map((creator) => ({ creator: creator.name, orcid: creator.identifiers?.orcid?.[0] ?? null })),
                    url: `${getPublicUrl()}${reverse(ROUTES.COMPARISON, { comparisonId: id })}`,
                });
                const doiLiteral = await createLiteral(doiResponse.doi);
                await createResourceStatement(id, PREDICATES.HAS_DOI, doiLiteral.id);
                setIsLoading(false);
                dispatch(setDoi(doiResponse.doi));
                toast.success('Doi assigned successfully');
            }
        } catch (error) {
            console.error(error);
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
