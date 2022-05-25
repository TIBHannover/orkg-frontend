import { useState, useEffect } from 'react';
import { getStatementsBySubjects } from 'services/backend/statements';
import { getResourcesByClass } from 'services/backend/resources';
import { Container, ButtonGroup, ListGroup } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { getComparisonData } from 'utils';
import { find } from 'lodash';
import { CLASSES } from 'constants/graphSettings';
import HeaderSearchButton from 'components/HeaderSearchButton/HeaderSearchButton';

const useListPage = ({ label, resourceClass, renderListItem }) => {
    const pageSize = 25;
    const [results, setResults] = useState([]);
    const [isNextPageLoading, setIsNextPageLoading] = useState(false);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [page, setPage] = useState(0);
    const [isLastPageReached, setIsLastPageReached] = useState(false);
    const [totalElements, setTotalElements] = useState(0);

    useEffect(() => {
        loadMore();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const startLoading = () => {
        setIsNextPageLoading(true);
    };

    const noResults = () => {
        setIsLastPageReached(true);
        setHasNextPage(false);
        setIsNextPageLoading(false);
        setTotalElements(0);
    };

    const errorOccurred = () => {
        setIsLastPageReached(true);
        setHasNextPage(false);
        setIsNextPageLoading(false);
    };

    const addResults = ({ results: _results, last, totalElements }) => {
        console.log('_results', _results);
        setResults(prevResults => [...prevResults, ..._results]);
        setIsNextPageLoading(false);
        setHasNextPage(!last);
        setPage(prevPage => prevPage + 1);
        setIsLastPageReached(last);
        setTotalElements(totalElements);
    };

    const loadMore = async () => {
        startLoading();

        const result = await getResourcesByClass({
            id: CLASSES.COMPARISON,
            page,
            items: pageSize,
            sortBy: 'created_at',
            desc: true,
        });
        if (result.content.length > 0) {
            // Fetch the data of each paper
            getStatementsBySubjects({ ids: result.content.map(p => p.id) })
                .then(comparisonsStatements => {
                    const comparisonsData = comparisonsStatements.map(comparisonStatements =>
                        getComparisonData(
                            comparisonStatements.id,
                            find(result.content, { id: comparisonStatements.id }).label,
                            comparisonStatements.statements,
                        ),
                    );
                    addResults({
                        results: comparisonsData,
                        last: result.last,
                        totalElements: result.totalElements,
                    });
                })
                .catch(error => {
                    errorOccurred();
                    console.log(error);
                });
        } else {
            noResults();
        }
    };

    const Page = () => (
        <>
            <Container className="d-flex align-items-center">
                <div className="d-flex flex-grow-1 mt-4 mb-4">
                    <h1 className="h4">View {label}</h1>
                    <div className="text-muted ms-3 mt-1">
                        {totalElements === 0 && isNextPageLoading ? <Icon icon={faSpinner} spin /> : totalElements} {label}
                    </div>
                </div>
                <ButtonGroup>
                    <HeaderSearchButton placeholder="Search comparisons..." type={resourceClass} />
                </ButtonGroup>
            </Container>

            <Container className="p-0">
                <ListGroup flush className="box rounded" style={{ overflow: 'hidden' }}>
                    {results.length > 0 && <div>{results.map(renderListItem)}</div>}
                    {results.length === 0 && !isNextPageLoading && <div className="text-center mt-4 mb-4">No published comparison</div>}
                    {isNextPageLoading && (
                        <div className="text-center mt-4 mb-4">
                            <Icon icon={faSpinner} spin /> Loading
                        </div>
                    )}
                    {!isNextPageLoading && hasNextPage && (
                        <div
                            style={{ cursor: 'pointer' }}
                            className="list-group-item list-group-item-action text-center mt-2"
                            onClick={!isNextPageLoading ? loadMore : undefined}
                            onKeyDown={e => (e.keyCode === 13 ? (!isNextPageLoading ? loadMore : undefined) : undefined)}
                            role="button"
                            tabIndex={0}
                        >
                            Load more
                        </div>
                    )}
                    {!hasNextPage && isLastPageReached && <div className="text-center mt-3">You have reached the last page</div>}
                </ListGroup>
            </Container>
        </>
    );

    return { Page };
};

export default useListPage;
