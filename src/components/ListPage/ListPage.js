import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import HeaderSearchButton from 'components/HeaderSearchButton/HeaderSearchButton';
import TitleBar from 'components/TitleBar/TitleBar';
import usePaginate from 'components/hooks/usePaginate';
import { capitalize } from 'lodash';
import PropTypes from 'prop-types';
import ContentLoader from 'components/ContentLoader/ContentLoader';
import { Container, ListGroup } from 'reactstrap';

const ListPage = ({
    label,
    resourceClass,
    renderListItem,
    buttons = null,
    fetchItems,
    boxShadow = true,
    pageSize = 25,
    disableSearch = false,
    hideTitleBar = false,
    reset = false,
    infoContainerText = null,
    setReset = () => {},
}) => {
    const { results, isLoading, isLastPageReached, totalElements, hasNextPage, page, loadNextPage, handleKeyDown } = usePaginate({
        fetchItems,
        fetchItemsExtraParams: { resourceClass },
        pageSize,
        reset,
        setReset,
    });

    return (
        <>
            {!hideTitleBar && (
                <TitleBar
                    titleAddition={
                        <div className="text-muted mt-1">
                            {totalElements === 0 && isLoading ? <FontAwesomeIcon icon={faSpinner} spin /> : totalElements} items
                        </div>
                    }
                    buttonGroup={
                        <>
                            {buttons} {!disableSearch && <HeaderSearchButton placeholder={`Search ${label}...`} type={resourceClass} />}
                        </>
                    }
                >
                    {capitalize(label)}
                </TitleBar>
            )}
            {infoContainerText && (
                <Container className="p-0 rounded mb-3 p-3" style={{ background: '#dcdee6' }}>
                    {infoContainerText}
                </Container>
            )}
            <Container className="p-0">
                {results.length > 0 && (
                    <ListGroup flush className={`${boxShadow ? 'box' : ''} rounded`} style={{ overflow: 'hidden' }}>
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
                                <FontAwesomeIcon icon={faSpinner} spin /> Loading
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
                        <div className="text-start">
                            <ContentLoader speed={2} width={400} height={50} viewBox="0 0 400 50" style={{ width: '100% !important' }}>
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
    resourceClass: PropTypes.string,
    renderListItem: PropTypes.func.isRequired,
    fetchItems: PropTypes.func.isRequired,
    pageSize: PropTypes.number,
    boxShadow: PropTypes.bool,
    buttons: PropTypes.node,
    disableSearch: PropTypes.bool,
    reset: PropTypes.bool,
    setReset: PropTypes.func,
    hideTitleBar: PropTypes.bool,
    infoContainerText: PropTypes.object,
};

export default ListPage;
