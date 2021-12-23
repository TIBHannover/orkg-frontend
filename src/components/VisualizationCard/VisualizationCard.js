import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faUser, faCalendar } from '@fortawesome/free-solid-svg-icons';
import ROUTES from 'constants/routes.js';
import UserAvatar from 'components/UserAvatar/UserAvatar';
import useVisualizationResearchField from './hooks/useVisualizationResearchField';
import RelativeBreadcrumbs from 'components/RelativeBreadcrumbs/RelativeBreadcrumbs';
import { CardBadge } from 'components/styled';
import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import styled from 'styled-components';
import Thumbnail from './Thumbnail';
import PropTypes from 'prop-types';
import moment from 'moment';

const VisualizationCardStyled = styled.div`
    a {
        cursor: pointer !important;
        &:hover {
            cursor: pointer !important;
            text-decoration: none;
        }
    }
`;

const VisualizationCard = props => {
    const { researchField } = useVisualizationResearchField({
        visualizationId: props.visualization.id
    });

    return (
        <VisualizationCardStyled style={{ flexWrap: 'wrap' }} className={`list-group-item d-flex px-4 py-3 `}>
            <div className="col-md-9 d-flex p-0">
                <div className="d-flex flex-column flex-grow-1">
                    <div className="mb-2">
                        <Link
                            to={
                                props.visualization.comparisonId
                                    ? reverse(ROUTES.COMPARISON, { comparisonId: props.visualization.comparisonId }) + '#Vis' + props.visualization.id
                                    : reverse(ROUTES.VISUALIZATION, { id: props.visualization.id })
                            }
                        >
                            {props.visualization.label ? props.visualization.label : <em>No title</em>}
                        </Link>
                        {props.showBadge && (
                            <div className="d-inline-block ms-2">
                                <CardBadge color="primary">Visualization</CardBadge>
                            </div>
                        )}
                    </div>
                    <div className="mb-1">
                        <small>
                            {props.visualization.authors && props.visualization.authors.length > 0 && (
                                <>
                                    <Icon size="sm" icon={faUser} /> {props.visualization.authors.map(a => a.label).join(', ')}
                                </>
                            )}
                            {props.visualization.created_at && (
                                <>
                                    <Icon size="sm" icon={faCalendar} className="ms-2 me-1" />{' '}
                                    {moment(props.visualization.created_at).format('DD-MM-YYYY')}
                                </>
                            )}
                        </small>
                    </div>
                    {props.visualization.description && (
                        <div>
                            <small className="text-muted">{props.visualization.description}</small>
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
                        <Thumbnail visualization={props.visualization} />
                    </div>
                </div>
                <div className="d-none d-md-flex align-items-end justify-content-end mt-1">
                    <UserAvatar userId={props.visualization.created_by} />
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
        description: PropTypes.string
    }).isRequired,
    showBadge: PropTypes.bool.isRequired
};

VisualizationCard.defaultProps = {
    showBadge: false
};

export default VisualizationCard;
