import { faCalendar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import dayjs from 'dayjs';
import { reverse } from 'named-urls';
import Link from 'next/link';
import { FC } from 'react';
import styled from 'styled-components';

import useCardData from '@/components/Cards/hooks/useCardData';
import Authors from '@/components/Cards/PaperCard/Authors';
import Coins from '@/components/Coins/Coins';
import Tooltip from '@/components/FloatingUI/Tooltip';
import useMarkFeaturedUnlisted from '@/components/MarkFeaturedUnlisted/hooks/useMarkFeaturedUnlisted';
import MarkFeatured from '@/components/MarkFeaturedUnlisted/MarkFeatured/MarkFeatured';
import MarkUnlisted from '@/components/MarkFeaturedUnlisted/MarkUnlisted/MarkUnlisted';
import RelativeBreadcrumbs from '@/components/RelativeBreadcrumbs/RelativeBreadcrumbs';
import { CardBadge } from '@/components/styled';
import UserAvatar from '@/components/UserAvatar/UserAvatar';
import { VISIBILITY } from '@/constants/contentTypes';
import ROUTES from '@/constants/routes';
import { Review } from '@/services/backend/types';

const ReviewCardStyled = styled('div')<{ rounded?: string }>`
    &:last-child {
        border-bottom-right-radius: ${(props) => (props.rounded === 'true' ? '0 !important' : '')};
    }
`;

type ReviewCardProps = {
    review: Review;
    showCurationFlags?: boolean;
    showBadge?: boolean;
    renderCoins?: boolean;
};

const ReviewCard: FC<ReviewCardProps> = ({ review, showCurationFlags = true, showBadge = false, renderCoins = true }) => {
    // the useCardData can be removed as soon as the convertReviewToNewFormat function is not used anymore to transform review data,
    // this because the new 'review' variable already has the field and authors included
    const { researchField, authors } = useCardData({
        id: review?.id,
        // @ts-expect-error
        initResearchField: review.research_fields?.[0],
        // @ts-expect-error
        initAuthors: review.authors,
    });

    const { isFeatured, isUnlisted, handleChangeStatus } = useMarkFeaturedUnlisted({
        resourceId: review.id,
        unlisted: review?.visibility === VISIBILITY.UNLISTED,
        featured: review?.visibility === VISIBILITY.FEATURED,
    });

    return (
        <ReviewCardStyled style={{ flexWrap: 'wrap' }} className={`list-group-item d-flex py-3 pe-4 ${showCurationFlags ? ' ps-3  ' : ' ps-4  '}`}>
            <div className="col-md-9 d-flex p-0">
                {renderCoins && <Coins item={review} />}
                {showCurationFlags && (
                    <div className="d-flex flex-column flex-shrink-0" style={{ width: '25px' }}>
                        <div>
                            <MarkFeatured size="sm" featured={isFeatured} handleChangeStatus={handleChangeStatus} />
                        </div>
                        <div>
                            <MarkUnlisted size="sm" unlisted={isUnlisted} handleChangeStatus={handleChangeStatus} />
                        </div>
                    </div>
                )}
                <div className="d-flex flex-column flex-grow-1">
                    <div className="mb-2">
                        <Link href={reverse(ROUTES.REVIEW, { id: review.id })}>{review.title}</Link>
                        {showBadge && (
                            <div className="d-inline-block ms-2">
                                <CardBadge color="primary">Review</CardBadge>
                            </div>
                        )}
                    </div>
                    <div className="mb-1">
                        <small>
                            <Authors authors={review.authors.length > 0 ? review.authors : authors} />
                            {review.created_at && (
                                <>
                                    <FontAwesomeIcon size="sm" icon={faCalendar} className="ms-2 me-1" />{' '}
                                    {dayjs(review.created_at).format('DD-MM-YYYY')}
                                </>
                            )}
                        </small>
                    </div>

                    {review.versions?.published?.length > 1 && (
                        <small>
                            All versions:{' '}
                            {review.versions.published.map((version, index) => (
                                <span key={version?.id}>
                                    <Tooltip content={version?.changelog || 'no description'}>
                                        <Link href={reverse(ROUTES.REVIEW, { id: version?.id })}>
                                            Version {(review.versions.published?.length ?? 0) - index}
                                        </Link>
                                    </Tooltip>{' '}
                                    {index < review.versions.published.length - 1 && ' • '}
                                </span>
                            ))}
                        </small>
                    )}
                </div>
            </div>
            <div className="col-md-3 d-flex align-items-end flex-column p-0">
                <div className="flex-grow-1 mb-1">
                    <div className="d-none d-md-flex align-items-end justify-content-end">
                        <RelativeBreadcrumbs researchField={review.research_fields?.[0] ?? researchField} />
                    </div>
                </div>
                <UserAvatar userId={review.created_by} />
            </div>
        </ReviewCardStyled>
    );
};

export default ReviewCard;
