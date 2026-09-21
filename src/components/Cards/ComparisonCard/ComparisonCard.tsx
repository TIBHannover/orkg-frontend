import { faCalendar, faChartBar, faFile, faPaperclip } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import dayjs from 'dayjs';
import { truncate } from 'lodash';
import Link from 'next/link';
import pluralize from 'pluralize';
import { FC } from 'react';

import CardBadge from '@/components/Cards/CardBadge/CardBadge';
import CardColumns from '@/components/Cards/CardShell/CardColumns';
import CardShell from '@/components/Cards/CardShell/CardShell';
import MetadataRow from '@/components/Cards/CardShell/MetadataRow';
import Thumbnail from '@/components/Cards/ComparisonCard/Thumbnail';
import Versions from '@/components/Cards/ComparisonCard/Versions';
import Coins from '@/components/Coins/Coins';
import useMarkFeaturedUnlisted from '@/components/MarkFeaturedUnlisted/hooks/useMarkFeaturedUnlisted';
import MarkFeatured from '@/components/MarkFeaturedUnlisted/MarkFeatured/MarkFeatured';
import MarkUnlisted from '@/components/MarkFeaturedUnlisted/MarkUnlisted/MarkUnlisted';
import { VISIBILITY } from '@/constants/contentTypes';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { Comparison } from '@/services/backend/types';

type ComparisonCardProps = {
    comparison: Comparison;
    showHistory?: boolean;
    showBreadcrumbs?: boolean;
    showBadge?: boolean;
    showCurationFlags?: boolean;
    renderCoins?: boolean;
};

const ComparisonCard: FC<ComparisonCardProps> = ({
    comparison,
    showHistory = true,
    showBreadcrumbs = true,
    showBadge = false,
    showCurationFlags = true,
    renderCoins = true,
}) => {
    const { isFeatured, isUnlisted, handleChangeStatus } = useMarkFeaturedUnlisted({
        resourceId: comparison.id,
        unlisted: comparison?.visibility === VISIBILITY.UNLISTED,
        featured: comparison?.visibility === VISIBILITY.FEATURED,
    });

    const attachmentCount = (comparison.relatedResources?.length ?? 0) + (comparison.relatedFigures?.length ?? 0);

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
                researchField={showBreadcrumbs ? comparison.researchFields?.[0] : undefined}
                createdBy={comparison.createdBy}
                aside={<Thumbnail figures={comparison.relatedFigures} visualizations={comparison.visualizations} id={comparison.id} />}
            >
                {renderCoins && <Coins item={comparison} />}
                <div className="mb-2">
                    <Link href={reverse(ROUTES.COMPARISON, { comparisonId: comparison.id })}>
                        {comparison.title ? comparison.title : <em>No title</em>}
                    </Link>
                    {showBadge && (
                        <span className="ml-2 inline-block align-middle">
                            <CardBadge>Comparison</CardBadge>
                        </span>
                    )}
                </div>
                <MetadataRow
                    className="mb-1"
                    items={[
                        {
                            key: 'sources',
                            node: (
                                <span className="inline-flex items-center">
                                    <FontAwesomeIcon size="sm" icon={faFile} className="me-1 text-muted" />
                                    {pluralize('source', comparison.sources?.length ?? 0, true)}
                                </span>
                            ),
                        },
                        {
                            key: 'visualizations',
                            node: (
                                <span className="inline-flex items-center">
                                    <FontAwesomeIcon size="sm" icon={faChartBar} className="me-1 text-muted" />
                                    {pluralize('visualization', comparison.visualizations?.length ?? 0, true)}
                                </span>
                            ),
                        },
                        attachmentCount > 0 && {
                            key: 'attachments',
                            node: (
                                <span className="inline-flex items-center">
                                    <FontAwesomeIcon size="sm" icon={faPaperclip} className="me-1 text-muted" />
                                    {pluralize('attachment', attachmentCount, true)}
                                </span>
                            ),
                        },
                        !!comparison.createdAt && {
                            key: 'created-at',
                            node: (
                                <span className="inline-flex items-center" title={`Created ${dayjs(comparison.createdAt).format('DD MMMM YYYY')}`}>
                                    <FontAwesomeIcon size="sm" icon={faCalendar} className="me-1 text-muted" />
                                    {dayjs(comparison.createdAt).format('DD MMM YYYY')}
                                </span>
                            ),
                        },
                    ]}
                />

                {comparison.description && <div className="text-sm text-muted">{truncate(comparison.description, { length: 200 })}</div>}
                {showHistory && (comparison.versions?.published?.length ?? 0) > 1 && <Versions versions={comparison.versions!.published} />}
            </CardColumns>
        </CardShell>
    );
};

export default ComparisonCard;
