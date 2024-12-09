import { faCalendar, faClock, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ROUTES from 'constants/routes';
import moment from 'moment';
import { reverse } from 'named-urls';
import Link from 'next/link';
import { useEffect } from 'react';
import ContentLoader from 'react-content-loader';
import { useSelector } from 'react-redux';
import { Alert, ListGroup, ListGroupItem } from 'reactstrap';
import { comparisonUrl, GetComparisonParams, getComparisons } from 'services/backend/comparisons';
import { RootStore } from 'slices/types';
import useSWRInfinite from 'swr/infinite';

const PAGE_SIZE = 25;

const DraftComparisons = () => {
    const user = useSelector((state: RootStore) => state.auth.user);
    const userId = user ? user.id : '';

    useEffect(() => {
        document.title = 'Draft comparisons - ORKG';
    });

    const getKey = (pageIndex: number): GetComparisonParams => ({
        page: pageIndex,
        size: PAGE_SIZE,
        created_by: userId,
        published: false,
    });

    const { data, isLoading, size, setSize } = useSWRInfinite(
        (pageIndex) => [getKey(pageIndex), comparisonUrl, 'getComparisons'],
        ([params]) => getComparisons(params),
    );

    const totalElements = data?.[0]?.totalElements;
    const isEmpty = totalElements === 0;
    const isLastPageReached = isEmpty || (data && data[data.length - 1])?.last;
    const hasNextPage = !isLastPageReached;

    const handleLoadMore = () => setSize(size + 1);

    return (
        <>
            <div className="box rounded pt-4 pb-3 px-4 mb-3">
                <h2 className="h5">View draft comparisons</h2>
                <Alert color="info" className="mt-3" fade={false}>
                    When you start working on a comparison and it is not yet published, it is a <em>draft comparison</em>. Those comparisons are
                    listed below. As soon as you publish a comparison, it becomes publicly listed and it is removed from this page.
                </Alert>
            </div>
            {!!totalElements && totalElements > 0 && (
                <ListGroup className="mb-3 box">
                    {data &&
                        data.map((draftComparisons) =>
                            draftComparisons.content
                                .filter((draftComparison) => draftComparison.versions.published.length === 0) // manually remove the head comparisons that actually have a published version
                                .map((draftComparison) => (
                                    <ListGroupItem key={draftComparison.id} className="d-flex justify-content-between align-items-center px-4 py-3">
                                        <div>
                                            <Link href={reverse(ROUTES.COMPARISON, { comparisonId: draftComparison.id })}>
                                                {draftComparison.title}
                                            </Link>
                                            <br />
                                            <small>
                                                <FontAwesomeIcon icon={faCalendar} /> {moment(draftComparison.created_at).format('DD MMMM YYYY')}{' '}
                                                <FontAwesomeIcon icon={faClock} className="ms-2 me-1" />
                                                {moment(draftComparison.created_at).format('H:mm')}
                                            </small>
                                        </div>
                                        {/* <div className="flex-shrink-0">
                                        <Button
                                            color="light"
                                            size="sm"
                                            className="py-0 px-2 text-danger"
                                            onClick={() => handleDelete(draftComparison.id)}
                                        >
                                            <Icon icon={faTrash} />
                                        </Button>
                                    </div> */}
                                    </ListGroupItem>
                                )),
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
                    {!hasNextPage && isLastPageReached && size !== 1 && <div className="text-center m-2">You have reached the last page</div>}
                </ListGroup>
            )}
            {isLoading && (
                <div className={`mt-4 mb-4 ${size === 1 ? 'p-5 container box rounded' : ''}`}>
                    {size !== 1 && (
                        <div className="text-center">
                            <FontAwesomeIcon icon={faSpinner} spin /> Loading
                        </div>
                    )}
                    {size === 1 && (
                        <div className="text-left">
                            <ContentLoader speed={2} width={400} height={50} viewBox="0 0 400 50" style={{ width: '100% !important' }}>
                                <rect x="0" y="0" rx="3" ry="3" width="400" height="20" />
                                <rect x="0" y="25" rx="3" ry="3" width="300" height="20" />
                            </ContentLoader>
                        </div>
                    )}
                </div>
            )}
            {totalElements === 0 && !isLoading && (
                <div className="container box rounded">
                    <div className="p-5 text-center mt-4 mb-4">There are no content for this observatory that matches this filter, yet</div>
                </div>
            )}
        </>
    );
};

export default DraftComparisons;
