import Link from 'components/NextJsMigration/Link';
import { reverse } from 'named-urls';
import styled from 'styled-components';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faCalendar, faFile, faChartBar, faPaperclip } from '@fortawesome/free-solid-svg-icons';
import ROUTES from 'constants/routes.js';
import MarkFeatured from 'components/MarkFeaturedUnlisted/MarkFeatured/MarkFeatured';
import MarkUnlisted from 'components/MarkFeaturedUnlisted/MarkUnlisted/MarkUnlisted';
import useMarkFeaturedUnlisted from 'components/MarkFeaturedUnlisted/hooks/useMarkFeaturedUnlisted';
import PropTypes from 'prop-types';
import moment from 'moment';
import { CardBadge } from 'components/styled';
import UserAvatar from 'components/UserAvatar/UserAvatar';
import RelativeBreadcrumbs from 'components/RelativeBreadcrumbs/RelativeBreadcrumbs';
import { truncate } from 'lodash';
import Thumbnail from 'components/Cards/ComparisonCard/Thumbnail';
import Versions from 'components/Cards/ComparisonCard/Versions';

const ComparisonCardStyled = styled.li`
    &:last-child {
        border-bottom-right-radius: ${props => (props.rounded === 'true' ? '0 !important' : '')};
    }
`;

const ComparisonCard = ({ comparison, rounded, showHistory = true, showBreadcrumbs = true, showBadge = false, showCurationFlags = true }) => {
    const { isFeatured, isUnlisted, handleChangeStatus } = useMarkFeaturedUnlisted({
        resourceId: comparison.id,
        unlisted: comparison?.unlisted,
        featured: comparison?.featured,
    });
    return (
        <ComparisonCardStyled
            style={{ flexWrap: 'wrap' }}
            rounded={rounded}
            className={`list-group-item d-flex py-3 pe-4 ${showCurationFlags ? ' ps-3  ' : ' ps-4  '}`}
        >
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
                <div className="d-flex flex-column">
                    <div className="mb-2">
                        <Link href={reverse(ROUTES.COMPARISON, { comparisonId: comparison.id })}>
                            {comparison.label ? comparison.label : <em>No title</em>}
                        </Link>
                        {showBadge && (
                            <div className="d-inline-block ms-2">
                                <CardBadge color="primary">Comparison</CardBadge>
                            </div>
                        )}
                    </div>
                    <div className="d-inline-block d-md-none mt-1 me-1">
                        {showBreadcrumbs && <RelativeBreadcrumbs researchField={comparison.researchField} />}
                    </div>

                    <div className="mb-1">
                        <small>
                            <Icon size="sm" icon={faFile} className="me-1" /> {comparison.contributions?.length} Contributions
                            <Icon size="sm" icon={faChartBar} className="ms-2 me-1" /> {comparison.visualizations?.length} Visualizations
                            {(comparison.resources?.length > 0 || comparison.figures?.length > 0) && (
                                <>
                                    <Icon size="sm" icon={faPaperclip} className="ms-2 me-1" />{' '}
                                    {comparison.resources.length + comparison.resources.length} attachments
                                </>
                            )}
                            {comparison.created_at && (
                                <>
                                    <Icon size="sm" icon={faCalendar} className="ms-2 me-1" /> {moment(comparison.created_at).format('DD-MM-YYYY')}
                                </>
                            )}
                        </small>
                    </div>

                    {comparison.description && (
                        <div>
                            <small className="text-muted">{truncate(comparison.description, { length: 200 })}</small>
                        </div>
                    )}
                    {showHistory && comparison.versions && comparison.versions.length > 1 && (
                        <Versions versions={comparison.versions} id={comparison.id} />
                    )}
                </div>
            </div>
            <div className="col-md-3 d-flex align-items-end flex-column p-0">
                <div className="flex-grow-1 mb-1">
                    <div className="d-none d-md-flex align-items-end justify-content-end">
                        <RelativeBreadcrumbs researchField={comparison.researchField} />
                    </div>
                    <div className="d-none d-md-flex align-items-end justify-content-end mt-1">
                        <Thumbnail figures={comparison.figures} visualizations={comparison.visualizations} id={comparison.id} />
                    </div>
                </div>
                <UserAvatar userId={comparison.created_by} />
            </div>
        </ComparisonCardStyled>
    );
};

ComparisonCard.propTypes = {
    comparison: PropTypes.shape({
        id: PropTypes.string.isRequired,
        label: PropTypes.string,
        description: PropTypes.string,
        contributions: PropTypes.array,
        created_at: PropTypes.string,
        resources: PropTypes.array,
        figures: PropTypes.array,
        researchField: PropTypes.shape({
            id: PropTypes.string.isRequired,
            label: PropTypes.string,
        }),
        created_by: PropTypes.string,
        versions: PropTypes.array,
        visualizations: PropTypes.array,
        featured: PropTypes.bool,
        unlisted: PropTypes.bool,
    }).isRequired,
    rounded: PropTypes.string,
    showHistory: PropTypes.bool,
    showBreadcrumbs: PropTypes.bool,
    showBadge: PropTypes.bool,
    showCurationFlags: PropTypes.bool,
};

export default ComparisonCard;
