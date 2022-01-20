import { useState, useEffect } from 'react';
import { useLocation } from 'react-router';
import { useParams } from 'react-router-dom';
import { CLASSES, ENTITIES } from 'constants/graphSettings';
import { getArrayParamFromQueryString, getParamFromQueryString } from 'utils';
import { getClassById, getClasses } from 'services/backend/classes';
import { getResources, getResourcesByClass } from 'services/backend/resources';
import { getPredicates } from 'services/backend/predicates';
import { getPaperByDOI } from 'services/backend/misc';
import DEFAULT_FILTERS from 'constants/searchDefaultFilters';
import REGEX from 'constants/regex';
import { toast } from 'react-toastify';

const IGNORED_CLASSES = [CLASSES.CONTRIBUTION, CLASSES.CONTRIBUTION_DELETED, CLASSES.PAPER_DELETED];

const itemsPerFilter = 10;

export const useSearch = () => {
    const { searchTerm } = useParams();
    const location = useLocation();

    const [results, setResults] = useState({});
    const [selectedFilters, setSelectedFilters] = useState([]);

    const [isNextPageLoading, setIsNextPageLoading] = useState({});
    const [isLoadingFilterClasses, setIsLoadingFilterClasses] = useState(true);
    const [hasNextPage, setHasNextPage] = useState({});
    const [currentPage, setCurrentPage] = useState({});
    const [, setIsLastPageReached] = useState({});

    const isLoading = () => {
        return Object.keys(isNextPageLoading).every(v => isNextPageLoading[v] === true) || isLoadingFilterClasses;
    };

    const loadMoreResults = async (filterType, page = 0) => {
        if (!searchTerm || searchTerm.length === 0) {
            return;
        }
        const searchQuery = decodeURIComponent(searchTerm);

        setIsNextPageLoading(prev => ({ ...prev, [filterType]: true }));

        let resultsResponse = [];

        try {
            if (filterType === ENTITIES.PREDICATE) {
                resultsResponse = await getPredicates({
                    page: page,
                    items: itemsPerFilter,
                    sortBy: 'id',
                    desc: true,
                    q: searchQuery,
                    returnContent: true
                });
            } else if (filterType === ENTITIES.RESOURCE) {
                resultsResponse = await getResources({
                    page: page,
                    items: itemsPerFilter,
                    sortBy: 'id',
                    desc: true,
                    q: searchQuery,
                    exclude: DEFAULT_FILTERS.map(df => df.id)
                        .concat(IGNORED_CLASSES)
                        .join(','),
                    returnContent: true
                });
            } else if (filterType === ENTITIES.CLASS) {
                resultsResponse = await getClasses({
                    page: page,
                    items: itemsPerFilter,
                    sortBy: 'id',
                    desc: true,
                    q: searchQuery,
                    returnContent: true
                });
            } else {
                resultsResponse = await getResourcesByClass({
                    page: page,
                    items: itemsPerFilter,
                    sortBy: 'id',
                    desc: true,
                    q: searchQuery,
                    id: filterType,
                    returnContent: true,
                    creator: getParamFromQueryString(location.search, 'createdBy') ?? undefined
                });
            }

            // for papers, try to find a DOI
            if (filterType === CLASSES.PAPER && REGEX.DOI.test(searchQuery)) {
                try {
                    const paper = await getPaperByDOI(searchQuery);
                    resultsResponse.push({ label: paper.title, id: paper.id, class: CLASSES.PAPER });
                } catch (e) {}
            }
        } catch (e) {
            toast.error('Something went wrong while loading search results.');
        }

        if (resultsResponse.length > 0) {
            setResults(prev => ({ ...prev, [filterType]: [...(prev[filterType] || []), ...resultsResponse] }));
            setIsNextPageLoading(prev => ({ ...prev, [filterType]: false }));
            setHasNextPage(prev => ({ ...prev, [filterType]: resultsResponse.length < itemsPerFilter ? false : true }));
            setCurrentPage(prev => ({ ...prev, [filterType]: page + 1 }));
        } else {
            setIsNextPageLoading(prev => ({ ...prev, [filterType]: false }));
            setHasNextPage(prev => ({ ...prev, [filterType]: false }));
            setIsLastPageReached(prev => ({ ...prev, [filterType]: true }));
        }
    };

    useEffect(() => {
        const getResultsForFilters = () => {
            setIsLoadingFilterClasses(true);
            const _selectedFilters = getArrayParamFromQueryString(decodeURIComponent(location.search), 'types');
            if (!_selectedFilters || _selectedFilters.length === 0) {
                setIsLoadingFilterClasses(false);
                const _classes = getParamFromQueryString(location.search, 'createdBy')
                    ? DEFAULT_FILTERS.filter(df => df.isCreatedByActive)
                    : DEFAULT_FILTERS;
                setSelectedFilters(_classes);
                for (const filter of _classes) {
                    loadMoreResults(filter.id);
                }
            } else {
                const classesCalls = _selectedFilters.map(classID => {
                    if (DEFAULT_FILTERS.map(df => df.id).includes(classID)) {
                        return DEFAULT_FILTERS.find(df => df.id === classID);
                    }
                    return getClassById(classID);
                });
                return Promise.all(classesCalls).then(classes => {
                    setIsLoadingFilterClasses(false);
                    setSelectedFilters(classes);
                    for (const filter of _selectedFilters) {
                        loadMoreResults(filter);
                    }
                });
            }
        };

        setResults({});
        setIsNextPageLoading({});
        setHasNextPage({});
        setCurrentPage({});
        setIsLastPageReached({});
        getResultsForFilters();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.search, searchTerm]);

    return { searchTerm, selectedFilters, results, isNextPageLoading, hasNextPage, isLoading, loadMoreResults, currentPage };
};

export default useSearch;
