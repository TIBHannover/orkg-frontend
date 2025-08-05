import { faCalendar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import dayjs from 'dayjs';
import { reverse } from 'named-urls';
import { useEffect } from 'react';

import useAuthentication from '@/components/hooks/useAuthentication';
import ListPage from '@/components/PaginatedContent/ListPage';
import ShortRecord from '@/components/ShortRecord/ShortRecord';
import Alert from '@/components/Ui/Alert/Alert';
import { CLASSES } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
import { getReviews, reviewUrl } from '@/services/backend/reviews';
import { Review } from '@/services/backend/types';

const DraftReviews = () => {
    const { user } = useAuthentication();

    useEffect(() => {
        document.title = 'Draft reviews - ORKG';
    });

    const renderListItem = (review: Review) => (
        <ShortRecord key={review.id} header={review.title} href={reverse(ROUTES.REVIEW, { id: review.id })}>
            <div className="time">
                <FontAwesomeIcon size="sm" icon={faCalendar} className="me-1" />{' '}
                {review.created_at ? dayjs(review.created_at).format('DD MMMM YYYY') : ''}
            </div>
        </ShortRecord>
    );

    if (!user) {
        return null;
    }

    return (
        <div>
            <div className="box rounded pt-4 pb-3 px-4 mb-3">
                <h2 className="h5">View draft reviews</h2>
                <Alert color="info" className="mt-3" fade={false}>
                    When you start working on a review, by default it is a draft version. Those versions are listed on this page. As soon as you
                    publish a review, it becomes publicly listed
                </Alert>
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

DraftReviews.propTypes = {};

export default DraftReviews;
