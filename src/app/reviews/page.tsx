'use client';

import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { reverse } from 'named-urls';
import Link from 'next/link';
import { useQueryState } from 'nuqs';
import { useEffect } from 'react';

import reviewsThumbnail from '@/assets/img/video_thumbnails/reviews.png';
import ReviewCard from '@/components/Cards/ReviewCard/ReviewCard';
import useAuthentication from '@/components/hooks/useAuthentication';
import ListPage from '@/components/PaginatedContent/ListPage';
import VideoExplainer from '@/components/PaginatedContent/VideoExplainer';
import RequireAuthentication from '@/components/RequireAuthentication/RequireAuthentication';
import VisibilityFilter from '@/components/VisibilityFilter/VisibilityFilter';
import { VISIBILITY_FILTERS } from '@/constants/contentTypes';
import { CLASSES } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
import { getReviews, reviewUrl } from '@/services/backend/reviews';
import { Review, VisibilityOptions } from '@/services/backend/types';

const Reviews = () => {
    const { user } = useAuthentication();

    const [visibility] = useQueryState<VisibilityOptions>('visibility', {
        defaultValue: VISIBILITY_FILTERS.ALL_LISTED,
        parse: (value) => value as VisibilityOptions,
    });

    useEffect(() => {
        document.title = 'Reviews - ORKG';
    });

    const renderListItem = (review: Review) => <ReviewCard key={review.id} review={review} showBadge={false} />;

    const buttons = (
        <>
            <VisibilityFilter />
            <RequireAuthentication component={Link} color="secondary" size="sm" className="btn btn-secondary btn-sm" href={ROUTES.REVIEW_NEW}>
                <FontAwesomeIcon icon={faPlus} /> Create review
            </RequireAuthentication>
            {!!user && (
                <RequireAuthentication
                    component={Link}
                    color="secondary"
                    size="sm"
                    className="btn btn-secondary btn-sm"
                    href={reverse(ROUTES.USER_SETTINGS, { tab: 'draft-reviews' })}
                    style={{ marginLeft: 1 }}
                >
                    Draft reviews
                </RequireAuthentication>
            )}
        </>
    );

    const infoContainerText = (
        <div className="d-flex">
            <VideoExplainer
                previewStyle={{ width: 65, height: 35, background: `url(${reviewsThumbnail.src})` }}
                video={
                    <iframe
                        width="560"
                        height="315"
                        src="https://www.youtube.com/embed/FIFQKx-0Bqg"
                        title="YouTube video player"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                    />
                }
            />
            <span>
                ORKG reviews are dynamic, community maintained scholarly articles and are especially suitable for survey papers.{' '}
                <a href="https://orkg.org/about/16/Reviews" rel="noreferrer" target="_blank">
                    Learn more in the help center
                </a>
                .
            </span>
        </div>
    );

    return (
        <ListPage
            label="reviews"
            resourceClass={CLASSES.SMART_REVIEW_PUBLISHED}
            fetchFunction={getReviews}
            fetchFunctionName="getReviews"
            fetchUrl={reviewUrl}
            fetchExtraParams={{ published: true, visibility }}
            renderListItem={renderListItem}
            buttons={buttons}
            infoContainerText={infoContainerText}
        />
    );
};

export default Reviews;
