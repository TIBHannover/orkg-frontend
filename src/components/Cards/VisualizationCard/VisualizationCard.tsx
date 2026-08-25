import { faCalendar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import dayjs from 'dayjs';
import Link from 'next/link';
import { FC } from 'react';

import CardBadge from '@/components/Cards/CardBadge/CardBadge';
import CardColumns from '@/components/Cards/CardShell/CardColumns';
import CardShell from '@/components/Cards/CardShell/CardShell';
import MetadataRow from '@/components/Cards/CardShell/MetadataRow';
import Authors from '@/components/Cards/PaperCard/Authors';
import useVisualizationResearchField from '@/components/Cards/VisualizationCard/hooks/useVisualizationResearchField';
import Thumbnail from '@/components/Cards/VisualizationCard/Thumbnail';
import Coins from '@/components/Coins/Coins';
import useMarkFeaturedUnlisted from '@/components/MarkFeaturedUnlisted/hooks/useMarkFeaturedUnlisted';
import MarkFeatured from '@/components/MarkFeaturedUnlisted/MarkFeatured/MarkFeatured';
import MarkUnlisted from '@/components/MarkFeaturedUnlisted/MarkUnlisted/MarkUnlisted';
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
                researchField={researchField}
                createdBy={visualization.created_by}
                aside={<Thumbnail visualization={visualization} />}
            >
                {renderCoins && <Coins item={visualization} genre="unknown" />}
                <div className="mb-2">
                    <Link href={reverse(ROUTES.VISUALIZATION, { id: visualization.id })} className="hover:no-underline">
                        {visualization.title ? visualization.title : <em>No title</em>}
                    </Link>
                    {showBadge && (
                        <span className="ml-2 inline-block align-middle">
                            <CardBadge>Visualization</CardBadge>
                        </span>
                    )}
                </div>
                <MetadataRow
                    className="mb-1"
                    items={[
                        !!visualization.authors?.length && { key: 'authors', node: <Authors authors={visualization.authors} /> },
                        !!visualization.created_at && {
                            key: 'created-at',
                            node: (
                                <span
                                    className="inline-flex items-center"
                                    title={`Created ${dayjs(visualization.created_at).format('DD MMMM YYYY')}`}
                                >
                                    <FontAwesomeIcon size="sm" icon={faCalendar} className="me-1 text-muted" />
                                    {dayjs(visualization.created_at).format('DD MMM YYYY')}
                                </span>
                            ),
                        },
                    ]}
                />
                {visualization.description && <div className="text-sm text-muted">{visualization.description}</div>}
            </CardColumns>
        </CardShell>
    );
};

export default VisualizationCard;
