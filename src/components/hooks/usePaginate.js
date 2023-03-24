import { useCallback, useEffect, useState } from 'react';
import { usePrevious } from 'react-use';

const usePaginate = ({ fetchItems, fetchItemsExtraParams = {}, pageSize = 25, reset = false, setReset = () => {} }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState([]);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [page, setPage] = useState(0);
    const [isLastPageReached, setIsLastPageReached] = useState(false);
    const [totalElements, setTotalElements] = useState(0);
    const prevPage = usePrevious(page);

    const startLoading = () => {
        setIsLoading(true);
    };

    const noResults = () => {
        setIsLastPageReached(true);
        setHasNextPage(false);
        setIsLoading(false);
    };

    const errorOccurred = () => {
        setIsLastPageReached(true);
        setHasNextPage(false);
        setIsLoading(false);
    };

    const addResults = ({ results: _results, last, totalElements: _totalElements }) => {
        setResults(prevResults => [...prevResults, ..._results]);
        setIsLoading(false);
        setHasNextPage(!last);
        setIsLastPageReached(last);
        setTotalElements(_totalElements);
    };

    const loadNextPage = () => setPage(prev => prev + 1);

    const load = useCallback(async () => {
        startLoading();
        try {
            const { items, last: _last, totalElements: _totalElements } = await fetchItems({ page, pageSize, ...fetchItemsExtraParams });

            if (items.length) {
                addResults({
                    results: items,
                    last: _last,
                    totalElements: _totalElements,
                });
            } else {
                noResults();
            }
        } catch (e) {
            console.log(e);
            errorOccurred();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchItems, JSON.stringify(fetchItemsExtraParams), page, pageSize]);

    useEffect(() => {
        if (!reset) {
            return;
        }
        setResults([]);
        setIsLoading(false);
        setHasNextPage(false);
        setPage(0);
        setIsLastPageReached(false);
        setTotalElements(0);
        setReset(false);
        load();
    }, [load, reset, setReset]);

    // load more data if "page" changes
    const loadMore = useCallback(() => {
        if (page === prevPage) {
            return;
        }
        load();
    }, [page, prevPage, load]);

    useEffect(() => {
        loadMore();
    }, [loadMore]);

    const handleKeyDown = e => {
        if (e.key === 'Enter') {
            loadNextPage();
        }
    };

    return { results, isLoading, isLastPageReached, totalElements, hasNextPage, page, loadNextPage, handleKeyDown };
};

export default usePaginate;
