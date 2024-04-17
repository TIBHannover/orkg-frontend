import useUsedTemplates from 'components/StatementBrowser/TemplatesModal/hooks/useUsedTemplates';
import { CLASSES, ENTITIES, PREDICATES } from 'constants/graphSettings';
import { debounce, differenceBy, uniqBy } from 'lodash';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { getParentResearchFields, statementsUrl } from 'services/backend/statements';
import { getTemplates, templatesUrl, getFeaturedTemplates } from 'services/backend/templates';
import { getCommonClasses, getResearchFields, getResearchProblems } from 'slices/contributionEditorSlice';
import { getResearchProblemsOfContribution } from 'slices/statementBrowserSlice';
import useSWRInfinite from 'swr/infinite';
import useSWR from 'swr';

const useTemplates = ({ onlyFeatured = true, isContributionEditor = false }) => {
    const filterOptions = [
        { id: CLASSES.NODE_SHAPE, label: 'label', predicate: null, placeholder: 'Search template by label', entityType: null },
        {
            id: CLASSES.RESEARCH_FIELD,
            label: 'research field',
            predicate: PREDICATES.TEMPLATE_OF_RESEARCH_FIELD,
            placeholder: 'Search or choose a research field',
            entityType: ENTITIES.RESOURCE,
        },
        {
            id: CLASSES.PROBLEM,
            label: 'research problem',
            predicate: PREDICATES.TEMPLATE_OF_RESEARCH_PROBLEM,
            placeholder: 'Search a research problem',
            entityType: ENTITIES.RESOURCE,
        },
        { id: CLASSES.CLASS, label: 'class', predicate: PREDICATES.SHACL_TARGET_CLASS, placeholder: 'Search a class', entityType: ENTITIES.CLASS },
    ];

    const [selectedFilter, setSelectedFilter] = useState(filterOptions[0]);
    const [labelFilter, setLabelFilter] = useState('');
    const [targetFilter, setTargetFilter] = useState(null);
    const pageSize = 25;
    const [templates, setTemplates] = useState([]);
    const [isNextPageLoading, setIsNextPageLoading] = useState(false);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [page, setPage] = useState(0);
    const [isLastPageReached, setIsLastPageReached] = useState(false);
    const [totalElements, setTotalElements] = useState(0);

    const selectedResource = useSelector((state) => (!isContributionEditor ? state.statementBrowser.selectedResource : null));
    const resource = useSelector((state) =>
        !isContributionEditor ? selectedResource && state.statementBrowser.resources.byId[selectedResource] : { classes: getCommonClasses(state) },
    );

    // in case of contribution editor, we consider only the research field of the first contribution
    const researchField = useSelector((state) =>
        !isContributionEditor ? state.viewPaper.paper.research_fields?.[0]?.id : getResearchFields(state)?.[0],
    );

    const { data: researchFieldParents } = useSWR(researchField ? [researchField, statementsUrl, 'getParentResearchFields'] : null, ([params]) =>
        getParentResearchFields(params),
    );

    const researchProblems = useSelector((state) => {
        if (!isContributionEditor) {
            return resource?.classes?.includes(CLASSES.CONTRIBUTION) ? getResearchProblemsOfContribution(state, selectedResource) : [];
        }
        return getResearchProblems(state);
    });

    const getKey = (pageIndex) => ({
        page: pageIndex,
        size: pageSize,
        researchFields: researchFieldParents.map((r) => r.id),
        researchProblems,
    });

    const {
        data: featuredTemplates,
        isLoading: isLoadingFeatured,
        isValidating: isValidatingFeatured,
    } = useSWRInfinite(
        (pageIndex) => [getKey(pageIndex), templatesUrl, 'getFeaturedTemplates'],
        ([params]) => getFeaturedTemplates(params),
    );

    const isLoadingFeaturedTemplates = isLoadingFeatured || isValidatingFeatured;
    const { usedTemplates, isLoadingUsedTemplates } = useUsedTemplates({ resourceId: selectedResource });

    const loadMoreTemplates = (sf, target, label) => {
        if (label || target || !onlyFeatured) {
            setIsNextPageLoading(true);
            let searchCall = Promise.resolve();
            if (target) {
                searchCall = getTemplates({
                    page,
                    ...(sf.predicate === PREDICATES.SHACL_TARGET_CLASS && { targetClass: target.id }),
                    ...(sf.predicate === PREDICATES.TEMPLATE_OF_RESEARCH_FIELD && { researchField: target.id, includeSubfields: true }),
                    ...(sf.predicate === PREDICATES.TEMPLATE_OF_RESEARCH_PROBLEM && { researchProblem: target.id }),
                    includeSubfields: true,
                    size: pageSize,
                });
            } else {
                searchCall = getTemplates({
                    q: label?.trim(),
                    size: pageSize,
                    page,
                });
            }

            searchCall.then((result) => {
                setTemplates((prevTemplates) => [...prevTemplates, ...result.content]);
                setIsNextPageLoading(false);
                setHasNextPage(!result.last);
                setIsLastPageReached(result.last);
                setPage((prevPage) => prevPage + 1);
                setTotalElements(result.totalElements);
            });
        } else {
            setTemplates([]);
            setIsNextPageLoading(false);
            setHasNextPage(false);
            setIsLastPageReached(false);
        }
    };

    const debouncedGetLoadMoreResults = useRef(debounce(loadMoreTemplates, 500));

    useEffect(() => {
        setIsNextPageLoading(true);
        debouncedGetLoadMoreResults.current(selectedFilter, targetFilter, labelFilter);
    }, [labelFilter, onlyFeatured, selectedFilter, targetFilter]);

    const handleSelectedFilterChange = (selected) => {
        setTemplates([]);
        setLabelFilter('');
        setTargetFilter(null);
        setSelectedFilter(selected);
    };

    const handleLabelFilterChange = (e) => {
        setTemplates([]);
        setIsNextPageLoading(true);
        setHasNextPage(false);
        setIsLastPageReached(false);
        setPage(0);
        setTargetFilter(null);
        setLabelFilter(e.target.value);
    };

    const handleTargetFilterChange = (selected) => {
        setTemplates([]);
        setIsNextPageLoading(true);
        setHasNextPage(false);
        setIsLastPageReached(false);
        setPage(0);
        setLabelFilter('');
        setTargetFilter(selected);
    };

    return {
        filterOptions,
        templates: differenceBy(uniqBy(templates, 'id'), usedTemplates, 'id'),
        featuredTemplates: differenceBy(featuredTemplates?.[0] ?? [], usedTemplates, 'id'),
        // Hide the delete button for contribution template
        usedTemplates: usedTemplates.filter((t) => t?.classId !== CLASSES.CONTRIBUTION),
        isLoadingUsedTemplates,
        researchField,
        isNextPageLoading,
        isLoadingFeatured: isLoadingFeaturedTemplates,
        hasNextPage,
        labelFilter,
        targetFilter,
        isLastPageReached,
        totalElements,
        selectedFilter,
        handleTargetFilterChange,
        handleSelectedFilterChange,
        setTargetFilter,
        handleLabelFilterChange,
        loadMoreTemplates,
    };
};

export default useTemplates;
