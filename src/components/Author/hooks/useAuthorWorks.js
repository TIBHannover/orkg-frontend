import { find, flatten, intersection } from 'lodash';
import { useCallback, useEffect, useState } from 'react';

import { CLASSES, PREDICATES } from '@/constants/graphSettings';
import {
    getStatementsByObject,
    getStatementsByObjectAndPredicate,
    getStatementsByPredicateAndLiteral,
    getStatementsBySubjects,
} from '@/services/backend/statements';
import { addAuthorsToStatementBundle, getDataBasedOnType } from '@/utils';

function useAuthorWorks({ authorId, authorString }) {
    const [isNextPageLoading, setIsNextPageLoading] = useState(false);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [page, setPage] = useState(0);
    const [works, setWorks] = useState([]);
    const [totalElements, setTotalElements] = useState(0);
    const [isLastPageReached, setIsLastPageReached] = useState(false);
    const pageSize = 10;

    const loadMoreWorks = useCallback(
        async (p) => {
            setIsNextPageLoading(true);
            // Get the statements that contains the author as an object
            let result = null;
            if (authorId) {
                result = await getStatementsByObjectAndPredicate({
                    objectId: authorId,
                    predicateId: PREDICATES.HAS_LIST_ELEMENT,
                    page: p,
                    size: pageSize,
                    sortBy: 'created_at',
                    desc: true,
                    returnContent: false,
                });
            } else {
                result = await getStatementsByPredicateAndLiteral({
                    literal: authorString,
                    predicateId: PREDICATES.HAS_LIST_ELEMENT,
                    page: p,
                    size: pageSize,
                    sortBy: 'created_at',
                    desc: true,
                    returnContent: false,
                });
            }
            const subjectPromises = result.content.map((list) => getStatementsByObject({ id: list.subject.id }));
            const subjects = await Promise.all(subjectPromises);
            result.content = flatten(subjects);
            const filteredResult = result.content.filter(
                (item) =>
                    intersection(item.subject.classes, [CLASSES.PAPER, CLASSES.COMPARISON, CLASSES.VISUALIZATION, CLASSES.SMART_REVIEW]).length > 0,
            );

            // Fetch the data of each work
            if (filteredResult?.length) {
                return getStatementsBySubjects({
                    ids: filteredResult.map((s) => s.subject.id),
                })
                    .then((statements) => addAuthorsToStatementBundle(statements))
                    .then((statements) => {
                        const items = statements.map((itemStatements) => {
                            const itemSubject = find(
                                result.content.map((_p) => _p.subject),
                                { id: itemStatements.id },
                            );
                            return getDataBasedOnType(itemSubject, itemStatements.statements);
                        });
                        setWorks((prevResources) => [...prevResources, ...items]);
                        setIsNextPageLoading(false);
                        setHasNextPage(result.page.number < result.page.total_pages - 1);
                        setIsLastPageReached(result.page.number === result.page.total_pages - 1);
                        setTotalElements(result.page.total_elements);
                        setPage(p + 1);
                    })
                    .catch(() => {
                        setWorks([]);
                        setIsNextPageLoading(false);
                        setHasNextPage(false);
                        setIsLastPageReached(p > 1);
                    });
            }
            setIsNextPageLoading(false);
            setHasNextPage(false);
            setIsLastPageReached(true);
            return Promise.resolve();
        },
        [authorId, authorString],
    );

    // reset resources when the authorId has changed
    useEffect(() => {
        setWorks([]);
        setHasNextPage(false);
        setIsLastPageReached(false);
        setPage(0);
        setTotalElements(0);
    }, []);

    useEffect(() => {
        loadMoreWorks(0);
    }, [loadMoreWorks]);

    const handleLoadMore = useCallback(() => {
        if (!isNextPageLoading) {
            loadMoreWorks(page);
        }
    }, [isNextPageLoading, loadMoreWorks, page]);

    return { isNextPageLoading, hasNextPage, works, totalElements, isLastPageReached, handleLoadMore };
}
export default useAuthorWorks;
