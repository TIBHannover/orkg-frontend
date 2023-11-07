import Link from 'components/NextJsMigration/Link';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faUser, faCalendar } from '@fortawesome/free-solid-svg-icons';
import ROUTES from 'constants/routes.js';
import UserAvatar from 'components/UserAvatar/UserAvatar';
import MarkFeatured from 'components/MarkFeaturedUnlisted/MarkFeatured/MarkFeatured';
import MarkUnlisted from 'components/MarkFeaturedUnlisted/MarkUnlisted/MarkUnlisted';
import useMarkFeaturedUnlisted from 'components/MarkFeaturedUnlisted/hooks/useMarkFeaturedUnlisted';
import RelativeBreadcrumbs from 'components/RelativeBreadcrumbs/RelativeBreadcrumbs';
import { CardBadge } from 'components/styled';
import { reverse } from 'named-urls';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import moment from 'moment';
import Thumbnail from 'components/Cards/VisualizationCard/Thumbnail';
import useVisualizationResearchField from 'components/Cards/VisualizationCard/hooks/useVisualizationResearchField';

const VisualizationCardStyled = styled.div`
    a {
        cursor: pointer !important;
        &:hover {
            cursor: pointer !important;
            text-decoration: none;
        }
    }
`;

const VisualizationCard = ({ showBadge = false, showCurationFlags = true, visualization }) => {
    const { isFeatured, isUnlisted, handleChangeStatus } = useMarkFeaturedUnlisted({
        resourceId: visualization.id,
        unlisted: visualization?.unlisted,
        featured: visualization?.featured,
    });

    const { researchField } = useVisualizationResearchField({
        visualizationId: visualization.id,
    });

    return (
        <VisualizationCardStyled className={`list-group-item d-flex py-3 pe-4 ${showCurationFlags ? ' ps-3  ' : ' ps-4  '}`}>
            <div className="col-md-9 d-flex p-0">
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
                        <Link
                            href={
                                visualization.comparisonId
                                    ? `${reverse(ROUTES.COMPARISON, { comparisonId: visualization.comparisonId })}#Vis${visualization.id}`
                                    : reverse(ROUTES.VISUALIZATION, { id: visualization.id })
                            }
                        >
                            {visualization.label ? visualization.label : <em>No title</em>}
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
                                    <Icon size="sm" icon={faUser} /> {visualization.authors.map(a => a.label).join(', ')}
                                </>
                            )}
                            {visualization.created_at && (
                                <>
                                    <Icon size="sm" icon={faCalendar} className="ms-2 me-1" /> {moment(visualization.created_at).format('DD-MM-YYYY')}
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

VisualizationCard.propTypes = {
    visualization: PropTypes.shape({
        id: PropTypes.string.isRequired,
        comparisonId: PropTypes.string,
        label: PropTypes.string,
        authors: PropTypes.array,
        created_at: PropTypes.string,
        created_by: PropTypes.string,
        description: PropTypes.string,
        featured: PropTypes.bool,
        unlisted: PropTypes.bool,
    }).isRequired,
    showBadge: PropTypes.bool,
    showCurationFlags: PropTypes.bool,
};

export default VisualizationCard;
