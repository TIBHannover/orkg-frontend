import { faCalendar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Tooltip } from '@heroui/react';
import dayjs from 'dayjs';
import Link from 'next/link';
import { FC } from 'react';

import CardBadge from '@/components/Cards/CardBadge/CardBadge';
import CardColumns from '@/components/Cards/CardShell/CardColumns';
import CardShell from '@/components/Cards/CardShell/CardShell';
import MetadataRow from '@/components/Cards/CardShell/MetadataRow';
import Authors from '@/components/Cards/PaperCard/Authors';
import Coins from '@/components/Coins/Coins';
import useMarkFeaturedUnlisted from '@/components/MarkFeaturedUnlisted/hooks/useMarkFeaturedUnlisted';
import MarkFeatured from '@/components/MarkFeaturedUnlisted/MarkFeatured/MarkFeatured';
import MarkUnlisted from '@/components/MarkFeaturedUnlisted/MarkUnlisted/MarkUnlisted';
import { VISIBILITY } from '@/constants/contentTypes';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { Review } from '@/services/backend/types';

type ReviewCardProps = {
    review: Review;
    showCurationFlags?: boolean;
    showBadge?: boolean;
    renderCoins?: boolean;
};

const ReviewCard: FC<ReviewCardProps> = ({ review, showCurationFlags = true, showBadge = false, renderCoins = true }) => {
    const { isFeatured, isUnlisted, handleChangeStatus } = useMarkFeaturedUnlisted({
        resourceId: review.id,
        unlisted: review?.visibility === VISIBILITY.UNLISTED,
        featured: review?.visibility === VISIBILITY.FEATURED,
    });

    return (
        <CardShell>
            <CardColumns
                gutter={
                    showCurationFlags && (
                        <>
                            <MarkFeatured size="sm" featured={isFeatured} handleChangeStatus={handleChangeStatus} />
                            <MarkUnlisted size="sm" unlisted={isUnlisted} handleChangeStatus={handleChangeStatus} />
                        </>
                    )
                }
                researchField={review.research_fields?.[0]}
                createdBy={review.created_by}
            >
                {renderCoins && <Coins item={review} />}
                <div className="mb-2">
                    <Link href={reverse(ROUTES.REVIEW, { id: review.id })}>{review.title}</Link>
                    {showBadge && (
                        <span className="ml-2 inline-block align-middle">
                            <CardBadge>Review</CardBadge>
                        </span>
                    )}
                </div>
                <MetadataRow
                    className="mb-1"
                    items={[
                        review.authors.length > 0 && { key: 'authors', node: <Authors authors={review.authors} /> },
                        !!review.created_at && {
                            key: 'created-at',
                            node: (
                                <span className="inline-flex items-center" title={`Created ${dayjs(review.created_at).format('DD MMMM YYYY')}`}>
                                    <FontAwesomeIcon size="sm" icon={faCalendar} className="me-1 text-muted" />
                                    {dayjs(review.created_at).format('DD MMM YYYY')}
                                </span>
                            ),
                        },
                    ]}
                />

                {review.versions?.published?.length > 1 && (
                    <div className="mt-2 text-sm">
                        All versions:{' '}
                        {review.versions.published.map((version, index) => (
                            <span key={version?.id}>
                                <Tooltip>
                                    <Tooltip.Trigger className="inline">
                                        <Link href={reverse(ROUTES.REVIEW, { id: version?.id })}>
                                            Version {(review.versions.published?.length ?? 0) - index}
                                        </Link>
                                    </Tooltip.Trigger>
                                    <Tooltip.Content>{version?.changelog || 'no description'}</Tooltip.Content>
                                </Tooltip>{' '}
                                {index < review.versions.published.length - 1 && ' • '}
                            </span>
                        ))}
                    </div>
                )}
            </CardColumns>
        </CardShell>
    );
};

export default ReviewCard;
