import { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { getStatementsByObjectAndPredicate, getParentResearchFields } from 'services/backend/statements';
import { getResearchProblemsOfContribution } from 'slices/statementBrowserSlice';
import { getResearchProblems, getResearchFields, getCommonClasses } from 'slices/contributionEditorSlice';
import { uniqBy, differenceBy, debounce } from 'lodash';
import { getResourcesByClass } from 'services/backend/resources';
import { CLASSES, ENTITIES, PREDICATES } from 'constants/graphSettings';
import useUsedTemplates from './useUsedTemplates';

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
    const [featuredTemplates, setFeaturedTemplates] = useState([]);
    const [isNextPageLoading, setIsNextPageLoading] = useState(false);
    const [isLoadingFeatured, setIsLoadingFeatured] = useState(false);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [page, setPage] = useState(0);
    const [isLastPageReached, setIsLastPageReached] = useState(false);
    const [totalElements, setTotalElements] = useState(0);

    const selectedResource = useSelector(state => (!isContributionEditor ? state.statementBrowser.selectedResource : null));

    // in case of contribution editor, we consider only the research field of the first contribution
    const researchField = useSelector(state =>
        !isContributionEditor ? state.viewPaper.researchField?.id || state.addPaper.selectedResearchField : getResearchFields(state)?.[0],
    );
    const resource = useSelector(state =>
        !isContributionEditor ? selectedResource && state.statementBrowser.resources.byId[selectedResource] : { classes: getCommonClasses(state) },
    );

    const researchProblems = useSelector(state =>
        !isContributionEditor
            ? resource?.classes?.includes(CLASSES.CONTRIBUTION)
                ? getResearchProblemsOfContribution(state, selectedResource)
                : []
            : getResearchProblems(state),
    );

    const { usedTemplates, isLoadingUsedTemplates } = useUsedTemplates({ resourceId: selectedResource });
    /**
     * Fetch the templates of a resource
     *
     * @param {String} resourceId Resource Id
     * @param {String} predicateId Predicate Id
     */
    const getTemplatesOfResourceId = useCallback(
        (resourceId, predicateId, p = null) =>
            getStatementsByObjectAndPredicate({
                objectId: resourceId,
                predicateId,
                page: p !== null ? p : 0,
                items: pageSize,
                sortBy: 'created_at',
                desc: true,
                returnContent: false,
            }).then(
                statements =>
                    // Filter statement with subjects of type Template
                    ({
                        ...statements,
                        content: statements.content
                            .filter(statement => statement.subject.classes.includes(CLASSES.NODE_SHAPE))
                            .map(st => ({ id: st.subject.id, label: st.subject.label })),
                    }), // return the template Object
            ),
        [],
    );

    const loadMoreTemplates = (sf, target, label) => {
        if (label || target || !onlyFeatured) {
            setIsNextPageLoading(true);
            let searchCall = Promise.resolve();
            if (target) {
                searchCall = getTemplatesOfResourceId(target.id, sf.predicate, page);
            } else {
                let _label = label?.trim();
                if (_label.length > 1 && _label.split(/\s+/).length === 1 && !_label.endsWith('*')) {
                    _label += '*';
                }
                searchCall = getResourcesByClass({
                    id: CLASSES.NODE_SHAPE,
                    page,
                    q: _label,
                    items: pageSize,
                });
            }

            searchCall.then(result => {
                setTemplates(prevTemplates => [...prevTemplates, ...result.content]);
                setIsNextPageLoading(false);
                setHasNextPage(!result.last);
                setIsLastPageReached(result.last);
                setPage(prevPage => prevPage + 1);
                setTotalElements(result.totalElements);
            });
        } else {
            setTemplates([]);
            setIsNextPageLoading(false);
            setHasNextPage(false);
            setIsLastPageReached(false);
        }
    };

    useEffect(() => {
        const loadFeaturedTemplates = async () => {
            setIsLoadingFeatured(true);
            const researchFieldTemplates = researchField
                ? await getParentResearchFields(researchField).then(parents => [
                      ...parents.map(rf => getTemplatesOfResourceId(rf.id, PREDICATES.TEMPLATE_OF_RESEARCH_FIELD, 0)),
                  ])
                : [];

            const researchProblemsTemplates =
                researchProblems?.length > 0
                    ? researchProblems.map(rp => getTemplatesOfResourceId(rp, PREDICATES.TEMPLATE_OF_RESEARCH_PROBLEM, 0))
                    : [];

            Promise.all([...researchFieldTemplates, ...researchProblemsTemplates])
                .then(fT => {
                    setFeaturedTemplates(
                        uniqBy(
                            fT
                                .map(c => c.content)
                                .filter(r => r.length)
                                .flat(),
                            'id',
                        ),
                    );
                    setIsLoadingFeatured(false);
                })
                .catch(e => {
                    setFeaturedTemplates([]);
                    setIsLoadingFeatured(false);
                });
        };
        if (researchField || researchProblems?.length > 0) {
            loadFeaturedTemplates();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [researchField, getTemplatesOfResourceId, JSON.stringify(researchProblems)]);

    const debouncedGetLoadMoreResults = useRef(debounce(loadMoreTemplates, 500));

    useEffect(() => {
        setIsNextPageLoading(true);
        debouncedGetLoadMoreResults.current(selectedFilter, targetFilter, labelFilter);
    }, [labelFilter, onlyFeatured, selectedFilter, targetFilter]);

    const handleSelectedFilterChange = selected => {
        setTemplates([]);
        setLabelFilter('');
        setTargetFilter(null);
        setSelectedFilter(selected);
    };

    const handleLabelFilterChange = e => {
        setTemplates([]);
        setIsNextPageLoading(true);
        setHasNextPage(false);
        setIsLastPageReached(false);
        setPage(0);
        setTargetFilter(null);
        setLabelFilter(e.target.value);
    };

    const handleTargetFilterChange = selected => {
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
        featuredTemplates: differenceBy(featuredTemplates, usedTemplates, 'id'),
        // Hide the delete button for contribution template
        usedTemplates: usedTemplates.filter(t => t?.classId !== CLASSES.CONTRIBUTION),
        isLoadingUsedTemplates,
        researchField,
        isNextPageLoading,
        isLoadingFeatured,
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
