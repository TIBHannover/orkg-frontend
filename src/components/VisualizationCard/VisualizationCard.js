import { Row, Col } from 'reactstrap';
import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import styled from 'styled-components';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faUser, faCalendar } from '@fortawesome/free-solid-svg-icons';
import ROUTES from 'constants/routes.js';
import PropTypes from 'prop-types';
import moment from 'moment';

const PaperCardStyled = styled.div`
    & .options {
        visibility: hidden;
    }

    &.selected {
        background: ${props => props.theme.bodyBg};
    }

    &:hover .options,
    &.selected .options {
        visibility: visible;
    }
`;

const VisualizationCard = props => {
    return (
        <PaperCardStyled className="list-group-item list-group-item-action ">
            <Row>
                <Col>
                    <Link
                        to={
                            props.visualization.comparisonId
                                ? reverse(ROUTES.COMPARISON, { comparisonId: props.visualization.comparisonId })
                                : reverse(ROUTES.RESOURCE, { id: props.visualization.id })
                        }
                    >
                        {props.visualization.label ? props.visualization.label : <em>No title</em>}
                    </Link>
                    <br />
                    <div>
                        <small>
                            {props.visualization.authorNames && props.visualization.authorNames.length > 0 && (
                                <>
                                    <Icon size="sm" icon={faUser} /> {props.visualization.authorNames.map(a => a.label).join(', ')}
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
            </Row>
        </PaperCardStyled>
    );
};

VisualizationCard.propTypes = {
    visualization: PropTypes.shape({
        id: PropTypes.string.isRequired,
        comparisonId: PropTypes.string,
        label: PropTypes.string,
        authorNames: PropTypes.array,
        created_at: PropTypes.string,
        description: PropTypes.string
    }).isRequired
};

export default VisualizationCard;
