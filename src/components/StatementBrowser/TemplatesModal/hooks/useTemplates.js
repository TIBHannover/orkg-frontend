import { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { getStatementsByObjectAndPredicate, getParentResearchFields } from 'services/backend/statements';
import { uniqBy } from 'lodash';
import { debounce } from 'lodash';
import { getResourcesByClass } from 'services/backend/resources';
import { CLASSES, ENTITIES, PREDICATES } from 'constants/graphSettings';

const useTemplates = ({ onlyFeatured = false }) => {
    const filterOptions = [
        { id: CLASSES.TEMPLATE, label: 'label', predicate: null, placeholder: 'Search template by label', entityType: null },
        {
            id: CLASSES.RESEARCH_FIELD,
            label: 'research field',
            predicate: PREDICATES.TEMPLATE_OF_RESEARCH_FIELD,
            placeholder: 'Search or choose a research field',
            entityType: ENTITIES.RESOURCE
        },
        {
            id: CLASSES.PROBLEM,
            label: 'research problem',
            predicate: PREDICATES.TEMPLATE_OF_RESEARCH_PROBLEM,
            placeholder: 'Search a research problem',
            entityType: ENTITIES.RESOURCE
        },
        { id: CLASSES.CLASS, label: 'class', predicate: PREDICATES.TEMPLATE_OF_CLASS, placeholder: 'Search a class', entityType: ENTITIES.CLASS }
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

    const selectedResource = useSelector(state => state.statementBrowser.selectedResource);
    const researchField = useSelector(state => state.viewPaper.researchField?.id || state.addPaper.selectedResearchField);
    const researchProblems = useSelector(state =>
        state.viewPaper.researchProblems[selectedResource]?.length > 0 ? state.viewPaper.researchProblems[selectedResource] : []
    );

    /**
     * Fetch the templates of a resource
     *
     * @param {String} resourceId Resource Id
     * @param {String} predicateId Predicate Id
     */
    const getTemplatesOfResourceId = useCallback((resourceId, predicateId, p = null) => {
        return getStatementsByObjectAndPredicate({
            objectId: resourceId,
            predicateId: predicateId,
            page: p !== null ? p : 0,
            items: pageSize,
            sortBy: 'created_at',
            desc: true,
            returnContent: false
        }).then(statements => {
            // Filter statement with subjects of type Template
            return {
                ...statements,
                content: statements.content
                    .filter(statement => statement.subject.classes.includes(CLASSES.TEMPLATE))
                    .map(st => ({ id: st.subject.id, label: st.subject.label }))
            }; // return the template Object
        });
    }, []);

    const loadMoreTemplates = (sf, target, label) => {
        setIsNextPageLoading(true);
        let searchCall = Promise.resolve();
        if (target) {
            searchCall = getTemplatesOfResourceId(target.id, sf.predicate, page);
        } else {
            searchCall = getResourcesByClass({
                id: CLASSES.TEMPLATE,
                page: page,
                q: label,
                items: pageSize,
                sortBy: 'created_at',
                desc: true
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
    };

    useEffect(() => {
        const loadFeaturedTemplates = async () => {
            setIsLoadingFeatured(true);
            const researchFieldTemplates = researchField
                ? await getParentResearchFields(researchField).then(parents => {
                      return [...parents.map(rf => getTemplatesOfResourceId(rf.id, PREDICATES.TEMPLATE_OF_RESEARCH_FIELD, 0))];
                  })
                : [];

            const researchProblemsTemplates =
                researchProblems?.length > 0
                    ? researchProblems.map(rp => getTemplatesOfResourceId(rp.id, PREDICATES.TEMPLATE_OF_RESEARCH_PROBLEM, 0))
                    : [];

            Promise.all([...researchFieldTemplates, ...researchProblemsTemplates])
                .then(fT => {
                    setFeaturedTemplates(uniqBy(fT.map(c => c.content).flat(), 'id'));
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
        if (!onlyFeatured || targetFilter || labelFilter !== '') {
            setIsNextPageLoading(true);
            debouncedGetLoadMoreResults.current(selectedFilter, targetFilter, labelFilter);
        } else {
            setIsNextPageLoading(false);
        }
    }, [labelFilter, onlyFeatured, selectedFilter, targetFilter]);

    const handleSelectedFilterChange = selected => {
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
        templates: uniqBy(templates, 'id'),
        featuredTemplates: featuredTemplates,
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
        loadMoreTemplates
    };
};

export default useTemplates;
