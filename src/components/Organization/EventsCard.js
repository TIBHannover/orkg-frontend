import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import styled from 'styled-components';
import ROUTES from 'constants/routes.js';
import PropTypes from 'prop-types';

const EventsCardStyled = styled.li`
    &:last-child {
        border-bottom-right-radius: ${props => (props.rounded === 'true' ? '0 !important' : '')};
    }
`;

function EventsCard(props) {
    return (
        <EventsCardStyled style={{ flexWrap: 'wrap' }} className="list-group-item d-flex py-3 pe-4 ps-4">
            <div className="col-md-9 d-flex p-0">
                <div className="d-flex flex-column">
                    <div className="mb-2">
                        <Link to={reverse(ROUTES.EVENT_SERIES, { id: encodeURIComponent(props.conference.display_id) })}>
                            {props.conference.name ? props.conference.name : <em>No title</em>}
                        </Link>
                    </div>
                </div>
            </div>
        </EventsCardStyled>
    );
}

EventsCard.propTypes = {
    conference: PropTypes.shape({
        display_id: PropTypes.string,
        name: PropTypes.string,
    }),
};
export default EventsCard;
