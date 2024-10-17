'use client';

import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import InternalServerError from 'app/error';
import NotFound from 'app/not-found';
import ContentLoader from 'components/ContentLoader/ContentLoader';
import SingleStatement from 'components/RosettaStone/SingleStatement/SingleStatement';
import TitleBar from 'components/TitleBar/TitleBar';
import { useEffect } from 'react';
import { Container, ListGroup } from 'reactstrap';
import { getRSStatements, GetStatementsParams, rosettaStoneUrl } from 'services/backend/rosettaStone';
import useSWRInfinite from 'swr/infinite';

const StatementsPage = () => {
    useEffect(() => {
        document.title = 'Statements list - ORKG';
    });

    const pageSize = 25;

    const getKey = (pageIndex: number): GetStatementsParams => ({
        page: pageIndex,
        size: pageSize,
    });

    const {
        data: items,
        isLoading,
        size,
        error,
        setSize,
        mutate,
    } = useSWRInfinite(
        (pageIndex) => [getKey(pageIndex), rosettaStoneUrl, 'getRSStatements'],
        ([params]) => getRSStatements(params),
    );

    const totalElements = items?.[0]?.totalElements;
    const isEmpty = totalElements === 0;
    const isLastPageReached = isEmpty || (items && items[items.length - 1])?.last;
    const hasNextPage = !isLastPageReached;

    const handleLoadMore = () => setSize(size + 1);

    const boxShadow = false;
    const page = size;
    return (
        <>
            <TitleBar
                titleAddition={
                    <div className="text-muted mt-1">{totalElements === 0 && isLoading ? <Icon icon={faSpinner} spin /> : totalElements} items</div>
                }
            >
                Statements
            </TitleBar>
            {isLoading && <Container className="box rounded pt-4 pb-4 ps-5 pe-5 mt-5 clearfix">Loading ...</Container>}
            {!isLoading && error && error.statusCode === 404 && <NotFound />}
            {!isLoading && error && error.statusCode !== 404 && <InternalServerError />}

            <Container className="box rounded clearfix p-0">
                {items && !!totalElements && totalElements > 0 && (
                    <ListGroup flush className="rounded">
                        {items.map((item) =>
                            item?.content?.map((s) => <SingleStatement showContext key={s.id} statement={s} reloadStatements={mutate} />),
                        )}
                        {!isLoading && hasNextPage && (
                            <div
                                style={{ cursor: 'pointer' }}
                                className="list-group-item list-group-item-action text-center"
                                onClick={!isLoading ? handleLoadMore : undefined}
                                onKeyDown={(e) => {
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
                        <div className="p-5 text-center mt-4 mb-4">There are no statements, yet</div>
                    </div>
                )}
                {isLoading && (
                    <div className={`mt-4 mb-4 ${page === 1 ? 'p-5' : ''} ${boxShadow ? 'container box rounded' : ''}`}>
                        {page !== 1 && (
                            <div className="text-center">
                                <Icon icon={faSpinner} spin /> Loading
                            </div>
                        )}
                        {page === 1 && (
                            <div className="text-left">
                                <ContentLoader speed={2} width={400} height={50} viewBox="0 0 400 50" style={{ width: '100% !important' }}>
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

export default StatementsPage;
