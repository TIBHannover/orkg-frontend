import { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { getStatementsByObjectAndPredicate, getParentResearchFields } from 'services/backend/statements';
import { uniqBy } from 'lodash';
import { debounce } from 'lodash';
import { getResourcesByClass } from 'services/backend/resources';
import { CLASSES, PREDICATES } from 'constants/graphSettings';

const useTemplates = () => {
    const [filterLabel, setFilterLabel] = useState('');
    const pageSize = 25;
    const [templates, setTemplates] = useState([]);
    const [templatesSuggestions, setTemplatesSuggestions] = useState([]);
    const [isNextPageLoading, setIsNextPageLoading] = useState(false);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [page, setPage] = useState(0);
    const [isLastPageReached, setIsLastPageReached] = useState(false);
    const [totalElements, setTotalElements] = useState(0);

    /**
     * Fetch the templates of a resource
     *
     * @param {String} resourceId Resource Id
     * @param {String} predicateId Predicate Id
     */
    const getTemplatesOfResourceId = useCallback(
        (resourceId, predicateId, p = null) => {
            return getStatementsByObjectAndPredicate({
                objectId: resourceId,
                predicateId: predicateId,
                page: p !== null ? p : page,
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
                        .map(st => ({ id: st.subject.id, label: st.subject.label, source: resourceId }))
                }; // return the template Object
            });
        },
        [page]
    );

    const loadMoreTemplates = (researchField, researchProblem, fClass, label) => {
        setIsNextPageLoading(true);
        let apiCalls = [];
        if (researchField) {
            apiCalls = getTemplatesOfResourceId(researchField.id, PREDICATES.TEMPLATE_OF_RESEARCH_FIELD);
        } else if (researchProblem) {
            apiCalls = getTemplatesOfResourceId(researchProblem.id, PREDICATES.TEMPLATE_OF_RESEARCH_PROBLEM);
        } else if (fClass) {
            apiCalls = getTemplatesOfResourceId(fClass.id, PREDICATES.TEMPLATE_OF_CLASS);
        } else {
            apiCalls = getResourcesByClass({
                id: CLASSES.TEMPLATE,
                page: page,
                q: label,
                items: pageSize,
                sortBy: 'created_at',
                desc: true
            });
        }

        apiCalls.then(result => {
            setTemplates(prevTemplates => [...prevTemplates, ...result.content]);
            setIsNextPageLoading(false);
            setHasNextPage(!result.last);
            setIsLastPageReached(result.last);
            setPage(prevPage => prevPage + 1);
            setTotalElements(result.totalElements);
        });
    };

    const debouncedGetLoadMoreResults = useRef(debounce(loadMoreTemplates, 500));

    useEffect(() => {
        setIsNextPageLoading(true);
        debouncedGetLoadMoreResults.current(null, null, null, filterLabel);
    }, [filterLabel]);

    const handleLabelFilter = e => {
        setTemplates([]);
        setIsNextPageLoading(true);
        setHasNextPage(false);
        setIsLastPageReached(false);
        setPage(0);
        setFilterLabel(e.target.value);
    };

    const selectedResource = useSelector(state => state.statementBrowser.selectedResource);
    const researchField = useSelector(state => state.viewPaper.researchField?.id || state.addPaper.selectedResearchField);
    const researchProblems = useSelector(state =>
        state.viewPaper.researchProblems[selectedResource] && state.viewPaper.researchProblems[selectedResource].length > 0
            ? state.viewPaper.researchProblems[selectedResource]
            : []
    );

    /**
     * Fetch templates for research fields
     */
    useEffect(() => {
        setIsLoadingSuggestions(true);
        if (researchField) {
            getParentResearchFields(researchField).then(parents => {
                Promise.all([...parents.map(rf => getTemplatesOfResourceId(rf.id, PREDICATES.TEMPLATE_OF_RESEARCH_FIELD, 0))])
                    .then(sT => {
                        setTemplatesSuggestions(sT.map(c => c.content).flat());
                        setIsLoadingSuggestions(false);
                    })
                    .catch(e => {
                        setTemplatesSuggestions([]);
                        setIsLoadingSuggestions(false);
                    });
            });
        } else {
            setIsLoadingSuggestions(false);
        }
    }, [researchField, getTemplatesOfResourceId, researchProblems]);

    return {
        templates: uniqBy(templates, 'id'),
        templatesSuggestions: uniqBy(templatesSuggestions, 'id'),
        researchField,
        isNextPageLoading,
        isLoadingSuggestions,
        hasNextPage,
        filterLabel,
        isLastPageReached,
        totalElements,
        handleLabelFilter,
        loadMoreTemplates
    };
};

export default useTemplates;
