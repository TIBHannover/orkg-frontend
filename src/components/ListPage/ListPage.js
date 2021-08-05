import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import HeaderSearchButton from 'components/HeaderSearchButton/HeaderSearchButton';
import ContentLoader from 'react-content-loader';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useState } from 'react';
import { usePrevious } from 'react-use';
import { Container, ListGroup } from 'reactstrap';
import TitleBar from 'components/TitleBar/TitleBar';
import { upperFirst } from 'lodash';

const ListPage = ({
    label,
    resourceClass,
    renderListItem,
    buttons = null,
    fetchItems,
    boxShadow = true,
    pageSize = 25,
    disableSearch = false,
    reset = false,
    setReset = () => {}
}) => {
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [page, setPage] = useState(0);
    const [isLastPageReached, setIsLastPageReached] = useState(false);
    const [totalElements, setTotalElements] = useState(0);
    const prevPage = usePrevious(page);

    useEffect(() => {
        document.title = `${upperFirst(label)} list - ORKG`;
    });

    const load = useCallback(async () => {
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
    }, [fetchItems, page, pageSize, resourceClass]);

    // load more data if "page" changes
    const loadMore = useCallback(() => {
        if (page === prevPage) {
            return;
        }
        load();
    }, [page, prevPage, load]);

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

    const handleKeyDown = e => {
        if (e.key === 'Enter') {
            loadNextPage();
        }
    };

    return (
        <>
            <TitleBar
                titleAddition={
                    <div className="text-muted mt-1">{totalElements === 0 && isLoading ? <Icon icon={faSpinner} spin /> : totalElements} items</div>
                }
                buttonGroup={
                    <>
                        {buttons} {!disableSearch && <HeaderSearchButton placeholder={`Search ${label}...`} type={resourceClass} />}
                    </>
                }
            >
                View {label}
            </TitleBar>
            <Container className="p-0">
                {results.length > 0 && (
                    <ListGroup flush className="box rounded" style={{ overflow: 'hidden' }}>
                        {results.map(renderListItem)}
                        {!isLoading && hasNextPage && (
                            <div
                                style={{ cursor: 'pointer' }}
                                className="list-group-item list-group-item-action text-center"
                                onClick={loadNextPage}
                                onKeyDown={handleKeyDown}
                                role="button"
                                tabIndex={0}
                            >
                                Load more...
                            </div>
                        )}
                        {!hasNextPage && isLastPageReached && page !== 0 && <div className="text-center my-3">You have reached the last page</div>}

                        {isLoading && page !== 0 && (
                            <div className="list-group-item text-center" aria-live="polite" aria-busy="true">
                                <Icon icon={faSpinner} spin /> Loading
                            </div>
                        )}
                    </ListGroup>
                )}
                {results.length === 0 && !isLoading && (
                    <div className={`container ${boxShadow ? 'box rounded' : ''}`}>
                        <div className="p-5 text-center">No {label} found</div>
                    </div>
                )}

                {isLoading && page === 0 && (
                    <div className={`text-center ${page === 0 ? 'p-5 container rounded' : ''} ${boxShadow ? 'box' : ''}`}>
                        <div className="text-left">
                            <ContentLoader
                                speed={2}
                                width={400}
                                height={50}
                                viewBox="0 0 400 50"
                                style={{ width: '100% !important' }}
                                backgroundColor="#f3f3f3"
                                foregroundColor="#ecebeb"
                            >
                                <rect x="0" y="0" rx="3" ry="3" width="400" height="20" />
                                <rect x="0" y="25" rx="3" ry="3" width="300" height="20" />
                            </ContentLoader>
                        </div>
                    </div>
                )}
            </Container>
        </>
    );
};

ListPage.propTypes = {
    label: PropTypes.string.isRequired,
    resourceClass: PropTypes.string.isRequired,
    renderListItem: PropTypes.func.isRequired,
    fetchItems: PropTypes.func.isRequired,
    pageSize: PropTypes.number,
    boxShadow: PropTypes.bool,
    buttons: PropTypes.node,
    disableSearch: PropTypes.bool,
    reset: PropTypes.bool,
    setReset: PropTypes.func
};

export default ListPage;
