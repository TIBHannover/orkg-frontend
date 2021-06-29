import { useState, useEffect } from 'react';
import { Row, Col } from 'reactstrap';
import { getVisualization } from 'services/similarity';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faUser, faCalendar } from '@fortawesome/free-solid-svg-icons';
import ROUTES from 'constants/routes.js';
import UserAvatar from 'components/UserAvatar/UserAvatar';
import { CardBadge } from 'components/styled';
import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import styled from 'styled-components';
import Thumbnail from 'components/ComparisonCard/Thumbnail';
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

const VisualizationCardNew = props => {
    return (
        <VisualizationCardStyled className="list-group-item list-group-item-action ">
            <Row>
                <Col md={9}>
                    <Link
                        to={
                            props.visualization.comparisonId
                                ? reverse(ROUTES.COMPARISON, { comparisonId: props.visualization.comparisonId }) + '#Vis' + props.visualization.id
                                : reverse(ROUTES.RESOURCE, { id: props.visualization.id })
                        }
                    >
                        {props.visualization.label ? props.visualization.label : <em>No title</em>}
                    </Link>
                    {props.showBadge && (
                        <div>
                            <CardBadge color="primary">Visualization</CardBadge>
                        </div>
                    )}
                    <div>
                        <small>
                            {props.visualization.authors && props.visualization.authors.length > 0 && (
                                <>
                                    <Icon size="sm" icon={faUser} /> {props.visualization.authors.map(a => a.label).join(', ')}
                                </>
                            )}
                            {props.visualization.created_at && (
                                <>
                                    <Icon size="sm" icon={faCalendar} className="ml-2 mr-1" />{' '}
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
                </Col>
                <div className="col-md-3 d-flex align-items-end flex-column">
                    <div className="d-none d-md-flex align-items-end justify-content-end mt-1">
                        <Thumbnail visualizations={[props.visualization]} id={props.visualization.id} />
                    </div>
                    <div className="d-none d-md-flex align-items-end justify-content-end mt-2">
                        <UserAvatar userId={props.visualization.created_by} />
                    </div>
                </div>
            </Row>
        </VisualizationCardStyled>
    );
};

VisualizationCardNew.propTypes = {
    visualization: PropTypes.shape({
        id: PropTypes.string.isRequired,
        comparisonId: PropTypes.string,
        label: PropTypes.string,
        authors: PropTypes.array,
        created_at: PropTypes.string,
        created_by: PropTypes.string,
        description: PropTypes.string
    }).isRequired,
    showBadge: PropTypes.bool.isRequired,
    showCurationFlags: PropTypes.bool.isRequired
};

VisualizationCardNew.defaultProps = {
    showBadge: false,
    showCurationFlags: true
};

export default VisualizationCardNew;
