import { faCalendar, faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import dayjs from 'dayjs';
import { reverse } from 'named-urls';
import Link from 'next/link';
import { FC } from 'react';
import styled from 'styled-components';

import useVisualizationResearchField from '@/components/Cards/VisualizationCard/hooks/useVisualizationResearchField';
import Thumbnail from '@/components/Cards/VisualizationCard/Thumbnail';
import Coins from '@/components/Coins/Coins';
import useMarkFeaturedUnlisted from '@/components/MarkFeaturedUnlisted/hooks/useMarkFeaturedUnlisted';
import MarkFeatured from '@/components/MarkFeaturedUnlisted/MarkFeatured/MarkFeatured';
import MarkUnlisted from '@/components/MarkFeaturedUnlisted/MarkUnlisted/MarkUnlisted';
import RelativeBreadcrumbs from '@/components/RelativeBreadcrumbs/RelativeBreadcrumbs';
import { CardBadge } from '@/components/styled';
import UserAvatar from '@/components/UserAvatar/UserAvatar';
import { VISIBILITY } from '@/constants/contentTypes';
import ROUTES from '@/constants/routes';
import { Visualization } from '@/services/backend/types';

const VisualizationCardStyled = styled.div`
    a {
        cursor: pointer !important;
        &:hover {
            cursor: pointer !important;
            text-decoration: none;
        }
    }
`;

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
        <VisualizationCardStyled className={`list-group-item d-flex py-3 pe-4 ${showCurationFlags ? ' ps-3  ' : ' ps-4  '}`}>
            <div className="col-md-9 d-flex p-0">
                {renderCoins && <Coins item={visualization} genre="unknown" />}
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
                        <Link href={reverse(ROUTES.VISUALIZATION, { id: visualization.id })}>
                            {visualization.title ? visualization.title : <em>No title</em>}
                        </Link>
                        {showBadge && (
                            <div className="d-inline-block ms-2">
                                <CardBadge color="primary">Visualization</CardBadge>
                            </div>
                        )}
                    </div>
                    <div className="mb-1">
                        <small>
                            {visualization.authors && visualization.authors.length > 0 && (
                                <>
                                    <FontAwesomeIcon size="sm" icon={faUser} /> {visualization.authors.map((a) => a.name).join(', ')}
                                </>
                            )}
                            {visualization.created_at && (
                                <>
                                    <FontAwesomeIcon size="sm" icon={faCalendar} className="ms-2 me-1" />{' '}
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
            <div className="col-md-3 d-flex align-items-end flex-column p-0">
                <div className="flex-grow-1 mb-1">
                    <div className="d-none d-md-flex align-items-end justify-content-end">
                        <RelativeBreadcrumbs researchField={researchField} />
                    </div>
                    <div className="d-none d-md-flex align-items-end justify-content-end mt-1">
                        <Thumbnail visualization={visualization} />
                    </div>
                </div>
                <div className="d-none d-md-flex align-items-end justify-content-end mt-1">
                    <UserAvatar userId={visualization.created_by} />
                </div>
            </div>
        </VisualizationCardStyled>
    );
};

export default VisualizationCard;
