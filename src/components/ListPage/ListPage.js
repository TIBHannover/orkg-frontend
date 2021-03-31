import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import HeaderSearchButton from 'components/HeaderSearchButton/HeaderSearchButton';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useState } from 'react';
import { usePrevious } from 'react-use';
import { ButtonGroup, Container, ListGroup } from 'reactstrap';

const ListPage = ({ label, resourceClass, renderListItem, buttons, fetchItems }) => {
    const pageSize = 25;
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [page, setPage] = useState(0);
    const [isLastPageReached, setIsLastPageReached] = useState(false);
    const [totalElements, setTotalElements] = useState(0);
    const prevPage = usePrevious(page);

    const loadMore = useCallback(async () => {
        if (page === prevPage) {
            return;
        }

        startLoading();

        try {
            const { items, last: _last, totalElements: _totalElements } = await fetchItems({ resourceClass, page, pageSize });

            if (items.length) {
                addResults({
                    results: items,
                    last: _last,
                    totalElements: _totalElements
                });
            } else {
                noResults();
            }
        } catch (e) {
            console.log(e);
            errorOccurred();
        }
    }, [fetchItems, page, prevPage, resourceClass]);

    useEffect(() => {
        loadMore();
    }, [loadMore]);

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

    const addResults = ({ results: _results, last, totalElements }) => {
        setResults(prevResults => [...prevResults, ..._results]);
        setIsLoading(false);
        setHasNextPage(!last);
        setIsLastPageReached(last);
        setTotalElements(totalElements);
    };

    const loadNextPage = () => setPage(prevPage => prevPage + 1);

    return (
        <>
            <Container className="d-flex align-items-center">
                <div className="d-flex flex-grow-1 mt-4 mb-4">
                    <h1 className="h4 m-0">View {label}</h1>
                    <div className="text-muted ml-3 mt-1">
                        {totalElements === 0 && isLoading ? <Icon icon={faSpinner} spin /> : totalElements} {label}
                    </div>
                </div>
                <ButtonGroup>
                    {buttons} <HeaderSearchButton placeholder={`Search ${label}...`} type={resourceClass} />
                </ButtonGroup>
            </Container>

            <Container className="p-0">
                <ListGroup flush className="box rounded" style={{ overflow: 'hidden' }}>
                    {results.length > 0 && <>{results.map(renderListItem)}</>}
                    {results.length === 0 && !isLoading && <div className="text-center mt-4 mb-4">No {label} found</div>}
                    {isLoading && (
                        <div className="text-center mt-4 mb-4">
                            <Icon icon={faSpinner} spin /> Loading
                        </div>
                    )}
                    {!isLoading && hasNextPage && (
                        <div
                            style={{ cursor: 'pointer' }}
                            className="list-group-item list-group-item-action text-center mt-2"
                            onClick={loadNextPage}
                            onKeyDown={e => (e.key === 'Enter' ? loadNextPage : undefined)}
                            role="button"
                            tabIndex={0}
                        >
                            Load more
                        </div>
                    )}
                    {!hasNextPage && isLastPageReached && <div className="text-center my-3">You have reached the last page</div>}
                </ListGroup>
            </Container>
        </>
    );
};

ListPage.propTypes = {
    label: PropTypes.string.isRequired,
    resourceClass: PropTypes.string.isRequired,
    renderListItem: PropTypes.func.isRequired,
    fetchItems: PropTypes.func.isRequired,
    buttons: PropTypes.node
};

ListPage.defaultProps = {
    buttons: null
};

export default ListPage;
