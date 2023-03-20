import { useCallback, useEffect, useState } from 'react';
import { getStatementsByPredicate } from 'services/backend/statements';

function usePropertyStatements({ propertyId, pageSize = 10 }) {
    const [isLoading, setIsLoading] = useState(false);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [isLastPageReached, setIsLastPageReached] = useState(false);
    const [page, setPage] = useState(0);
    const [statements, setStatements] = useState([]);
    const [totalElements, setTotalElements] = useState(0);

    const loadData = useCallback(
        page => {
            setIsLoading(true);
            const statementsService = getStatementsByPredicate({
                id: propertyId,
                page,
                items: pageSize,
                sortBy: 'created_at',
                desc: true,
                returnContent: false,
            });

            statementsService
                .then(result => {
                    setStatements(prevResources => [...prevResources, ...result.content]);
                    setIsLoading(false);
                    setHasNextPage(!result.last);
                    setIsLastPageReached(result.last);
                    setTotalElements(result.totalElements);
                    setPage(page + 1);
                })
                .catch(error => {
                    setIsLoading(false);
                    setHasNextPage(false);
                    setIsLastPageReached(page > 1);

                    console.log(error);
                });
        },
        [propertyId, pageSize],
    );

    // reset resources when the researchFieldId has changed
    useEffect(() => {
        setStatements([]);
        setHasNextPage(false);
        setIsLastPageReached(false);
        setPage(0);
        setTotalElements(0);
    }, [propertyId]);

    useEffect(() => {
        loadData(0);
    }, [loadData]);

    const handleLoadMore = () => {
        if (!isLoading) {
            loadData(page);
        }
    };

    return {
        statements,
        isLoading,
        hasNextPage,
        isLastPageReached,
        totalElements,
        page,
        handleLoadMore,
    };
}
export default usePropertyStatements;
