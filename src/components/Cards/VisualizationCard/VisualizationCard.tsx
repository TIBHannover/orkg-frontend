import { faCalendar, faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Chip } from '@heroui/react';
import dayjs from 'dayjs';
import Link from 'next/link';
import { FC } from 'react';

import useVisualizationResearchField from '@/components/Cards/VisualizationCard/hooks/useVisualizationResearchField';
import Thumbnail from '@/components/Cards/VisualizationCard/Thumbnail';
import Coins from '@/components/Coins/Coins';
import useMarkFeaturedUnlisted from '@/components/MarkFeaturedUnlisted/hooks/useMarkFeaturedUnlisted';
import MarkFeatured from '@/components/MarkFeaturedUnlisted/MarkFeatured/MarkFeatured';
import MarkUnlisted from '@/components/MarkFeaturedUnlisted/MarkUnlisted/MarkUnlisted';
import RelativeBreadcrumbs from '@/components/RelativeBreadcrumbs/RelativeBreadcrumbs';
import UserAvatar from '@/components/UserAvatar/UserAvatar';
import { VISIBILITY } from '@/constants/contentTypes';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { Visualization } from '@/services/backend/types';

type VisualizationCardProps = {
    visualization: Visualization;
    showBadge?: boolean;
    showCurationFlags?: boolean;
    renderCoins?: boolean;
};

const VisualizationCard: FC<VisualizationCardProps> = ({ visualization, showBadge = false, showCurationFlags = true, renderCoins = true }) => {
    const { isFeatured, isUnlisted, handleChangeStatus } = useMarkFeaturedUnlisted({
        resourceId: visualization.id,
        unlisted: visualization?.visibility === VISIBILITY.UNLISTED,
        featured: visualization?.visibility === VISIBILITY.FEATURED,
    });

    const { researchField } = useVisualizationResearchField({
        visualizationId: visualization.id,
    });

    return (
        <div className={`list-group-item flex py-4 pr-6 ${showCurationFlags ? 'pl-4' : 'pl-6'}`}>
            <div className="w-full md:shrink-0 md:grow-0 md:w-9/12 md:basis-9/12 md:max-w-9/12 flex p-0">
                {renderCoins && <Coins item={visualization} genre="unknown" />}
                {showCurationFlags && (
                    <div className="flex flex-col shrink-0 w-[25px]">
                        <MarkFeatured size="sm" featured={isFeatured} handleChangeStatus={handleChangeStatus} />
                        <MarkUnlisted size="sm" unlisted={isUnlisted} handleChangeStatus={handleChangeStatus} />
                    </div>
                )}
                <div className="flex flex-col grow">
                    <div className="mb-2">
                        <Link href={reverse(ROUTES.VISUALIZATION, { id: visualization.id })} className="hover:no-underline">
                            {visualization.title ? visualization.title : <em>No title</em>}
                        </Link>
                        {showBadge && (
                            <Chip className="ml-2" color="accent" size="sm" variant="soft">
                                Visualization
                            </Chip>
                        )}
                    </div>
                    <div className="mb-1">
                        <small>
                            {visualization.authors && visualization.authors.length > 0 && (
                                <>
                                    <FontAwesomeIcon size="sm" icon={faUser} className="mr-1 text-muted" />{' '}
                                    {visualization.authors.map((a) => a.name).join(', ')}
                                </>
                            )}
                            {visualization.created_at && (
                                <>
                                    <FontAwesomeIcon size="sm" icon={faCalendar} className="ml-2 mr-1 text-muted" />{' '}
                                    {dayjs(visualization.created_at).format('DD-MM-YYYY')}
                                </>
                            )}
                        </small>
                    </div>
                    {visualization.description && (
                        <div>
                            <small className="text-muted">{visualization.description}</small>
                        </div>
                    )}
                </div>
            </div>
            <div className="w-full md:shrink-0 md:grow-0 md:w-3/12 md:basis-3/12 md:max-w-3/12 flex items-end flex-col p-0">
                <div className="grow mb-1">
                    <div className="hidden md:flex items-end justify-end">
                        <RelativeBreadcrumbs researchField={researchField} />
                    </div>
                    <div className="hidden md:flex items-end justify-end mt-1">
                        <Thumbnail visualization={visualization} />
                    </div>
                </div>
                <div className="hidden md:flex items-end justify-end mt-1">
                    <UserAvatar userId={visualization.created_by} />
                </div>
            </div>
        </div>
    );
};

export default VisualizationCard;
