import { Link } from 'react-router-dom';
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
import Versions from './Versions';
import Thumbnail from './Thumbnail';
import UserAvatar from 'components/UserAvatar/UserAvatar';
import RelativeBreadcrumbs from 'components/RelativeBreadcrumbs/RelativeBreadcrumbs';
import { truncate } from 'lodash';

const ComparisonCardStyled = styled.div`
    &:last-child {
        border-bottom-right-radius: ${props => (props.rounded === 'true' ? '0 !important' : '')};
    }
`;

const ComparisonCard = props => {
    const { isFeatured, isUnlisted, handleChangeStatus } = useMarkFeaturedUnlisted({
        resourceId: props.comparison.id,
        unlisted: props.comparison?.unlisted,
        featured: props.comparison?.featured
    });
    return (
        <ComparisonCardStyled
            rounded={props.rounded}
            className={`list-group-item list-group-item-action d-flex pr-3 ${props.showCurationFlags ? ' pl-2  ' : ' pl-4  '}`}
        >
            <div className="col-md-9 d-flex p-0">
                {props.showCurationFlags && (
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
                    <div>
                        <Link to={reverse(ROUTES.COMPARISON, { comparisonId: props.comparison.id })}>
                            {props.comparison.label ? props.comparison.label : <em>No title</em>}
                        </Link>
                        {props.showBadge && (
                            <div className="d-inline-block ml-2">
                                <CardBadge color="primary">Comparison</CardBadge>
                            </div>
                        )}
                    </div>
                    <div className="d-inline-block d-md-none mt-1 mr-1">
                        {props.showBreadcrumbs && <RelativeBreadcrumbs researchField={props.comparison.researchField} />}
                    </div>

                    <div>
                        <small>
                            <Icon size="sm" icon={faFile} className="mr-1" /> {props.comparison.contributions?.length} Contributions
                            <Icon size="sm" icon={faChartBar} className="ml-2 mr-1" /> {props.comparison.visualizations?.length} Visualizations
                            {(props.comparison.resources?.length > 0 || props.comparison.figures?.length > 0) && (
                                <>
                                    <Icon size="sm" icon={faPaperclip} className="ml-2 mr-1" />{' '}
                                    {props.comparison.resources.length + props.comparison.resources.length} attachments
                                </>
                            )}
                            {props.comparison.created_at && (
                                <>
                                    <Icon size="sm" icon={faCalendar} className="ml-2 mr-1" />{' '}
                                    {moment(props.comparison.created_at).format('DD-MM-YYYY')}
                                </>
                            )}
                        </small>
                    </div>

                    {props.comparison.description && (
                        <div>
                            <small className="text-muted">{truncate(props.comparison.description, { length: 200 })}</small>
                        </div>
                    )}
                    {props.showHistory && props.comparison.versions && props.comparison.versions.length > 1 && (
                        <Versions versions={props.comparison.versions} id={props.comparison.id} />
                    )}
                </div>
            </div>
            <div className="col-md-3 d-flex align-items-end flex-column p-0">
                <div className="flex-grow-1 mb-1">
                    <div className="d-none d-md-flex align-items-end justify-content-end">
                        <RelativeBreadcrumbs researchField={props.comparison.researchField} />
                    </div>
                    <div className="d-none d-md-flex align-items-end justify-content-end mt-1">
                        <Thumbnail figures={props.comparison.figures} visualizations={props.comparison.visualizations} id={props.comparison.id} />
                    </div>
                </div>
                <UserAvatar userId={props.comparison.created_by} />
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
            label: PropTypes.string
        }),
        created_by: PropTypes.string,
        versions: PropTypes.array,
        visualizations: PropTypes.array,
        featured: PropTypes.bool,
        unlisted: PropTypes.bool
    }).isRequired,
    rounded: PropTypes.string,
    showHistory: PropTypes.bool,
    showBreadcrumbs: PropTypes.bool.isRequired,
    showBadge: PropTypes.bool.isRequired,
    showCurationFlags: PropTypes.bool.isRequired
};

ComparisonCard.defaultProps = {
    showHistory: true,
    showBreadcrumbs: true,
    showBadge: false,
    showCurationFlags: true
};
export default ComparisonCard;
