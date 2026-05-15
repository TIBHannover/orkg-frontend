import { faCalendar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import dayjs from 'dayjs';
import { useEffect } from 'react';

import useAuthentication from '@/components/hooks/useAuthentication';
import ListPage from '@/components/PaginatedContent/ListPage';
import ShortRecord from '@/components/ShortRecord/ShortRecord';
import { CLASSES } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { getReviews, reviewUrl } from '@/services/backend/reviews';
import { Review } from '@/services/backend/types';

const DraftReviews = () => {
    const { user } = useAuthentication();

    useEffect(() => {
        document.title = 'Draft reviews - ORKG';
    });

    const renderListItem = (review: Review) => (
        <ShortRecord key={review.id} header={review.title} href={reverse(ROUTES.REVIEW, { id: review.id })}>
            <div className="flex items-center gap-1 text-muted">
                <FontAwesomeIcon size="sm" icon={faCalendar} />
                {review.created_at ? dayjs(review.created_at).format('DD MMMM YYYY') : ''}
            </div>
        </ShortRecord>
    );

    if (!user) {
        return null;
    }

    return (
        <div>
            <div className="mb-5 px-3">
                <h2 className="text-xl mb-2">View draft reviews</h2>
                <p className="leading-relaxed rounded bg-surface-tertiary p-4">
                    When you start working on a review, by default it is a draft version. These versions are listed on this page. As soon as you
                    publish a review, it becomes publicly listed.
                </p>
            </div>
            <ListPage
                label="draft reviews"
                resourceClass={CLASSES.SMART_REVIEW}
                renderListItem={renderListItem}
                fetchFunction={getReviews}
                fetchFunctionName="getReviews"
                fetchUrl={reviewUrl}
                fetchExtraParams={{ created_by: user.id, published: false }}
                disableSearch
                hideTitleBar
            />
        </div>
    );
};

export default DraftReviews;
