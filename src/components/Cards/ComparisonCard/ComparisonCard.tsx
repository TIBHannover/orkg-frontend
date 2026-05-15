import { faCalendar, faChartBar, faFile, faPaperclip } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Chip } from '@heroui/react';
import dayjs from 'dayjs';
import { truncate } from 'lodash';
import Link from 'next/link';
import { FC } from 'react';

import Thumbnail from '@/components/Cards/ComparisonCard/Thumbnail';
import Versions from '@/components/Cards/ComparisonCard/Versions';
import Coins from '@/components/Coins/Coins';
import useMarkFeaturedUnlisted from '@/components/MarkFeaturedUnlisted/hooks/useMarkFeaturedUnlisted';
import MarkFeatured from '@/components/MarkFeaturedUnlisted/MarkFeatured/MarkFeatured';
import MarkUnlisted from '@/components/MarkFeaturedUnlisted/MarkUnlisted/MarkUnlisted';
import RelativeBreadcrumbs from '@/components/RelativeBreadcrumbs/RelativeBreadcrumbs';
import UserAvatar from '@/components/UserAvatar/UserAvatar';
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

    return (
        <li className={`list-group-item flex flex-wrap py-4 pr-6 ${showCurationFlags ? 'pl-4' : 'pl-6'}`}>
            <div className="flex w-full p-0 md:w-9/12 md:shrink-0 md:grow-0 md:basis-9/12 md:max-w-9/12">
                {renderCoins && <Coins item={comparison} />}
                {showCurationFlags && (
                    <div className="flex w-[25px] shrink-0 flex-col">
                        <div>
                            <MarkFeatured size="sm" featured={isFeatured} handleChangeStatus={handleChangeStatus} />
                        </div>
                        <div>
                            <MarkUnlisted size="sm" unlisted={isUnlisted} handleChangeStatus={handleChangeStatus} />
                        </div>
                    </div>
                )}
                <div className="flex flex-col">
                    <div className="mb-2">
                        <Link href={reverse(ROUTES.COMPARISON, { comparisonId: comparison.id })}>
                            {comparison.title ? comparison.title : <em>No title</em>}
                        </Link>
                        {showBadge && (
                            <span className="ml-2 inline-block align-middle">
                                <Chip color="accent" variant="primary" size="sm">
                                    Comparison
                                </Chip>
                            </span>
                        )}
                    </div>
                    <div className="mr-1 mt-1 inline-block md:hidden">
                        {showBreadcrumbs && <RelativeBreadcrumbs researchField={comparison.research_fields?.[0]} />}
                    </div>

                    <div className="mb-1">
                        <small>
                            <FontAwesomeIcon size="sm" icon={faFile} className="mr-1 text-muted" /> {comparison.sources?.length} Sources
                            <FontAwesomeIcon size="sm" icon={faChartBar} className="ml-2 mr-1 text-muted" /> {comparison.visualizations?.length}{' '}
                            Visualizations
                            {(comparison.related_resources?.length > 0 || comparison.related_figures?.length > 0) && (
                                <>
                                    <FontAwesomeIcon size="sm" icon={faPaperclip} className="ml-2 mr-1 text-muted" />{' '}
                                    {comparison.related_resources.length + comparison.related_resources.length} attachments
                                </>
                            )}
                            {comparison.created_at && (
                                <>
                                    <FontAwesomeIcon size="sm" icon={faCalendar} className="ml-2 mr-1 text-muted" />{' '}
                                    {dayjs(comparison.created_at).format('DD-MM-YYYY')}
                                </>
                            )}
                        </small>
                    </div>

                    {comparison.description && (
                        <div>
                            <small className="text-muted">{truncate(comparison.description, { length: 200 })}</small>
                        </div>
                    )}
                    {showHistory && comparison.versions?.published?.length > 1 && <Versions versions={comparison.versions.published} />}
                </div>
            </div>
            <div className="flex w-full flex-col items-end p-0 md:w-3/12 md:shrink-0 md:grow-0 md:basis-3/12 md:max-w-3/12">
                <div className="mb-1 grow">
                    <div className="hidden items-end justify-end md:flex">
                        <RelativeBreadcrumbs researchField={comparison.research_fields?.[0]} />
                    </div>
                    <div className="mt-1 hidden items-end justify-end md:flex">
                        <Thumbnail figures={comparison.related_figures} visualizations={comparison.visualizations} id={comparison.id} />
                    </div>
                </div>
                <UserAvatar userId={comparison.created_by} />
            </div>
        </li>
    );
};

export default ComparisonCard;
