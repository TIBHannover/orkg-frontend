import { useState, useEffect } from 'react';
import { getStatementsBySubjects } from 'services/backend/statements';
import { getResourcesByClass } from 'services/backend/resources';
import { Container, ButtonGroup, ListGroup } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { getComparisonData } from 'utils';
import { find } from 'lodash';
import ComparisonCard from 'components/ComparisonCard/ComparisonCard';
import { CLASSES } from 'constants/graphSettings';
import HeaderSearchButton from 'components/HeaderSearchButton/HeaderSearchButton';

const Comparisons = () => {
    const pageSize = 25;
    const [comparisons, setComparisons] = useState([]);
    const [isNextPageLoading, setIsNextPageLoading] = useState(false);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [page, setPage] = useState(0);
    const [isLastPageReached, setIsLastPageReached] = useState(false);
    const [totalElements, setTotalElements] = useState(0);

    useEffect(() => {
        document.title = 'Published comparisons - ORKG';

        loadMoreComparisons();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadMoreComparisons = () => {
        setIsNextPageLoading(true);
        getResourcesByClass({
            id: CLASSES.COMPARISON,
            page: page,
            items: pageSize,
            sortBy: 'created_at',
            desc: true
        }).then(result => {
            if (result.content.length > 0) {
                // Fetch the data of each paper
                getStatementsBySubjects({ ids: result.content.map(p => p.id) })
                    .then(comparisonsStatements => {
                        const comparisonsData = comparisonsStatements.map(comparisonStatements => {
                            return getComparisonData(find(comparisons, { id: comparisonStatements.id }), comparisonStatements.statements);
                        });
                        setComparisons(prevComparisons => [...prevComparisons, ...comparisonsData]);
                        setIsNextPageLoading(false);
                        setHasNextPage(!result.last);
                        setPage(prevPage => prevPage + 1);
                        setIsLastPageReached(result.last);
                        setTotalElements(result.totalElements);
                    })
                    .catch(error => {
                        setIsLastPageReached(true);
                        setHasNextPage(false);
                        setIsNextPageLoading(false);
                        console.log(error);
                    });
            } else {
                setIsLastPageReached(true);
                setHasNextPage(false);
                setIsNextPageLoading(false);
                setTotalElements(0);
            }
        });
    };

    return (
        <>
            <Container className="d-flex align-items-center">
                <div className="d-flex flex-grow-1 mt-4 mb-4">
                    <h1 className="h4">View all published comparisons</h1>
                    <div className="text-muted ml-3 mt-1">
                        {totalElements === 0 && isNextPageLoading ? <Icon icon={faSpinner} spin /> : totalElements} comparison
                    </div>
                </div>
                <ButtonGroup>
                    <HeaderSearchButton placeholder="Search comparisons..." type={CLASSES.COMPARISON} />
                </ButtonGroup>
            </Container>

            <Container className="p-0">
                <ListGroup flush className="box rounded" style={{ overflow: 'hidden' }}>
                    {comparisons.length > 0 && (
                        <div>
                            {comparisons.map(comparison => {
                                return <ComparisonCard comparison={comparison} key={`pc${comparison.id}`} />;
                            })}
                        </div>
                    )}
                    {comparisons.length === 0 && !isNextPageLoading && <div className="text-center mt-4 mb-4">No published comparison</div>}
                    {isNextPageLoading && (
                        <div className="text-center mt-4 mb-4">
                            <Icon icon={faSpinner} spin /> Loading
                        </div>
                    )}
                    {!isNextPageLoading && hasNextPage && (
                        <div
                            style={{ cursor: 'pointer' }}
                            className="list-group-item list-group-item-action text-center mt-2"
                            onClick={!isNextPageLoading ? loadMoreComparisons : undefined}
                            onKeyDown={e => (e.keyCode === 13 ? (!isNextPageLoading ? loadMoreComparisons : undefined) : undefined)}
                            role="button"
                            tabIndex={0}
                        >
                            Load more comparisons
                        </div>
                    )}
                    {!hasNextPage && isLastPageReached && <div className="text-center mt-3">You have reached the last page.</div>}
                </ListGroup>
            </Container>
        </>
    );
};
export default Comparisons;
