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
import UserAvatar from 'components/UserAvatar/UserAvatar';
import RelativeBreadcrumbs from 'components/RelativeBreadcrumbs/RelativeBreadcrumbs';
import { truncate } from 'lodash';

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

                    {props.conference.description && (
                        <div>
                            <small className="text-muted">{truncate(props.conference.description, { length: 200 })}</small>
                        </div>
                    )}
                </div>
            </div>
        </EventsCardStyled>
    );
}

EventsCard.propTypes = {
    conference: PropTypes.shape({
        display_id: PropTypes.string,
        name: PropTypes.string,
        description: PropTypes.string,
        dates: PropTypes.array,
    }),
};
export default EventsCard;
