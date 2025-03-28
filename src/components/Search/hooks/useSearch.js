import { isEmpty } from 'lodash';
import { reverse } from 'named-urls';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { CLASSES, ENTITIES, PREDICATES } from '@/constants/graphSettings';
import REGEX from '@/constants/regex';
import ROUTES from '@/constants/routes';
import DEFAULT_FILTERS from '@/constants/searchDefaultFilters';
import { getClassById, getClasses } from '@/services/backend/classes';
import { getPaperByDoi } from '@/services/backend/papers';
import { getPredicates } from '@/services/backend/predicates';
import { getResources } from '@/services/backend/resources';
import { getStatementsByObject, getStatementsByPredicateAndLiteral } from '@/services/backend/statements';

const IGNORED_CLASSES = [CLASSES.CONTRIBUTION, CLASSES.CONTRIBUTION_DELETED, CLASSES.PAPER_DELETED, CLASSES.COMPARISON_DRAFT];

const itemsPerFilter = 10;

export const useSearch = () => {
    const searchParams = useSearchParams();
    const searchTerm = searchParams.get('q') || '';
    const [results, setResults] = useState({});
    const [selectedFilters, setSelectedFilters] = useState([]);

    const [isNextPageLoading, setIsNextPageLoading] = useState({});
    const [isLoadingFilterClasses, setIsLoadingFilterClasses] = useState(true);
    const [hasNextPage, setHasNextPage] = useState({});
    const [currentPage, setCurrentPage] = useState({});
    const [, setIsLastPageReached] = useState({});

    const isLoading = () => Object.keys(isNextPageLoading).every((v) => isNextPageLoading[v] === true) || isLoadingFilterClasses;

    const loadMoreResults = async (filterType, page = 0) => {
        if (!searchTerm || searchTerm.length === 0) {
            return;
        }
        let searchQuery;
        try {
            searchQuery = decodeURIComponent(searchTerm);
        } catch (e) {
            searchQuery = searchTerm;
        }

        setIsNextPageLoading((prev) => ({ ...prev, [filterType]: true }));

        let resultsResponse = [];

        try {
            if (filterType === ENTITIES.PREDICATE) {
                resultsResponse = await getPredicates({
                    page,
                    size: itemsPerFilter,
                    q: searchQuery,
                    returnContent: true,
                });
            } else if (filterType === ENTITIES.RESOURCE) {
                resultsResponse = await getResources({
                    page,
                    size: itemsPerFilter,
                    q: searchQuery,
                    exclude: DEFAULT_FILTERS.map((df) => df.id).concat(IGNORED_CLASSES),
                    returnContent: true,
                });
            } else if (filterType === ENTITIES.CLASS) {
                resultsResponse = await getClasses({
                    page,
                    size: itemsPerFilter,
                    q: searchQuery,
                    returnContent: true,
                });
            } else {
                resultsResponse = await getResources({
                    page,
                    size: itemsPerFilter,
                    q: searchQuery,
                    include: [filterType],
                    returnContent: true,
                    created_by: !isEmpty(searchParams.get('createdBy')) ? searchParams.get('createdBy') : undefined,
                });
            }

            // for papers, try to find a DOI
            const doi = searchQuery.startsWith('http') ? searchQuery.trim().substring(searchQuery.trim().indexOf('10.')) : searchQuery;
            if (filterType === CLASSES.PAPER && REGEX.DOI_ID.test(doi)) {
                try {
                    const paper = await getPaperByDoi(doi);
                    resultsResponse.push({ label: paper.title, id: paper.id, class: CLASSES.PAPER });
                } catch (e) {}
            }

            // try to find an author by literal
            if (filterType === CLASSES.AUTHOR) {
                const listStatements = await getStatementsByPredicateAndLiteral({
                    literal: searchQuery,
                    predicateId: PREDICATES.HAS_LIST_ELEMENT,
                    size: 1,
                    returnContent: true,
                });
                const statements = listStatements.length > 0 ? await getStatementsByObject({ id: listStatements[0].subject.id }) : null;
                if (statements) {
                    const hasAuthorsStatements = statements.find((statement) => statement.predicate.id === PREDICATES.HAS_AUTHORS);
                    if (hasAuthorsStatements) {
                        resultsResponse.push({
                            label: searchQuery,
                            // id: authorLiteral[0].subject.id,
                            class: CLASSES.AUTHOR,
                            customRoute: reverse(ROUTES.AUTHOR_LITERAL, { authorString: encodeURIComponent(searchQuery) }),
                        });
                    }
                }
            }
        } catch (e) {
            console.error(e);
            toast.error('Something went wrong while loading search results.');
        }

        if (resultsResponse.length > 0) {
            setResults((prev) => ({ ...prev, [filterType]: [...(page > 0 ? prev[filterType] : []), ...resultsResponse] }));
            setIsNextPageLoading((prev) => ({ ...prev, [filterType]: false }));
            setHasNextPage((prev) => ({ ...prev, [filterType]: !(resultsResponse.length < itemsPerFilter) }));
            setCurrentPage((prev) => ({ ...prev, [filterType]: page + 1 }));
        } else {
            setIsNextPageLoading((prev) => ({ ...prev, [filterType]: false }));
            setHasNextPage((prev) => ({ ...prev, [filterType]: false }));
            setIsLastPageReached((prev) => ({ ...prev, [filterType]: true }));
        }
    };

    useEffect(() => {
        const getResultsForFilters = () => {
            setIsLoadingFilterClasses(true);
            const _selectedFilters = !isEmpty(searchParams.get('types')) ? searchParams.get('types')?.split(',') : [];
            if (!_selectedFilters || _selectedFilters.length === 0) {
                setIsLoadingFilterClasses(false);
                const _classes = searchParams.get('createdBy') ? DEFAULT_FILTERS.filter((df) => df.isCreatedByActive) : DEFAULT_FILTERS;
                setSelectedFilters(_classes);
                for (const filter of _classes) {
                    loadMoreResults(filter.id);
                }
            } else {
                const classesCalls = _selectedFilters.map((classID) => {
                    if (DEFAULT_FILTERS.map((df) => df.id).includes(classID)) {
                        return DEFAULT_FILTERS.find((df) => df.id === classID);
                    }
                    return getClassById(classID);
                });
                return Promise.all(classesCalls).then((classes) => {
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
    }, [searchTerm, searchParams]);

    return { searchTerm, selectedFilters, results, isNextPageLoading, hasNextPage, isLoading, loadMoreResults, currentPage };
};

export default useSearch;
