import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import IntegratedList from 'components/Observatory/IntegratedList/IntegratedList';
import IntegratedListHeader from 'components/Observatory/IntegratedList/IntegratedListHeader';
import useObservatoryContent from 'components/Observatory/hooks/useObservatoryContent';
import { FC } from 'react';
import ContentLoader from 'react-content-loader';
import { Container, ListGroup } from 'reactstrap';

type IntegratedListWrapperProps = {
    id: string;
    boxShadow?: boolean;
};

const IntegratedListWrapper: FC<IntegratedListWrapperProps> = ({ id, boxShadow = false }) => {
    const { items, isLoading, hasNextPage, isLastPageReached, totalElements, page, handleLoadMore } = useObservatoryContent({
        observatoryId: id,
    });

    return (
        <>
            <IntegratedListHeader id={id} page={page} isLoading={isLoading} totalElements={totalElements} />

            <Container className="p-0">
                {!!totalElements && totalElements > 0 && (
                    <ListGroup className={boxShadow ? 'box' : ''}>
                        {items?.map((item, i) => (
                            <IntegratedList key={i} content={item.content} />
                        ))}
                        {!isLoading && hasNextPage && (
                            <div
                                style={{ cursor: 'pointer' }}
                                className="list-group-item list-group-item-action text-center"
                                onClick={!isLoading ? handleLoadMore : undefined}
                                onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                        if (!isLoading) {
                                            handleLoadMore();
                                        }
                                    }
                                }}
                                role="button"
                                tabIndex={0}
                            >
                                Load more content
                            </div>
                        )}
                        {!hasNextPage && isLastPageReached && page !== 1 && <div className="text-center m-2">You have reached the last page</div>}
                    </ListGroup>
                )}
                {totalElements === 0 && !isLoading && (
                    <div className={boxShadow ? 'container box rounded' : ''}>
                        <div className="p-5 text-center mt-4 mb-4">There are no content for this observatory that matches this filter, yet</div>
                    </div>
                )}
                {isLoading && (
                    <div className={`mt-4 mb-4 ${page === 1 ? 'p-5 container box rounded' : ''}`}>
                        {page !== 1 && (
                            <div className="text-center">
                                <Icon icon={faSpinner} spin /> Loading
                            </div>
                        )}
                        {page === 1 && (
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
                        )}
                    </div>
                )}
            </Container>
        </>
    );
};

export default IntegratedListWrapper;
