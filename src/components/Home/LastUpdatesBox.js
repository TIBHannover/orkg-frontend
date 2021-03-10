import { SmallButton } from 'components/styled';
import styled from 'styled-components';
import useTopChangelog from './hooks/useTopChangelog';
import moment from 'moment';
import { Link } from 'react-router-dom';
import { getResourceLink } from 'utils';
import { truncate } from 'lodash';
import PropTypes from 'prop-types';

const StyledActivity = styled.div`
    border-left: 3px solid ${props => props.theme.ultraLightBlueDarker};
    color: ${props => props.theme.bodyColor};
    position: relative;
    font-size: 15px;
    .time {
        color: ${props => props.theme.darkblueDarker};
        margin-top: -0.2rem;
        margin-bottom: 0.2rem;
        font-size: 16px;
    }
    .time::before {
        width: 0.7rem;
        height: 0.7rem;
        margin-left: -1.45rem;
        margin-right: 0.5rem;
        border-radius: 14px;
        content: '';
        background-color: ${props => props.theme.ultraLightBlueDarker};
        display: inline-block;
        position: absolute;
        margin-top: 3px;
    }
    a {
        color: ${props => props.theme.ORKGPrimaryColor};
    }

    &:last-child {
        border-left: none;
        padding-left: 1.2rem !important;
    }
`;

const LastUpdatesBox = () => {
    const { activities } = useTopChangelog();

    return (
        <div className="box rounded-lg p-3 flex-grow-1 d-flex flex-column">
            <h5>Last updates</h5>
            <div className="mt-3 flex-grow-1">
                <div>
                    {activities &&
                        activities.length > 0 &&
                        activities.slice(0, 3).map(activity => (
                            <StyledActivity key={`sss${activity.id}`} className="pl-3 pb-3">
                                <div className="time">{moment(activity.created_at).fromNow()}</div>
                                <div className="action">
                                    {activity.profile?.id ? activity.profile.display_name : <i>Anonymous user</i>} added{' '}
                                    <Link to={getResourceLink(activity.classes[0], activity.id)}> {truncate(activity.label, { length: 50 })}</Link>
                                </div>
                            </StyledActivity>
                        ))}
                </div>
            </div>
            {activities.length > 3 && (
                <div className="text-center">
                    <SmallButton onClick={() => null} color="lightblue">
                        View more
                    </SmallButton>
                </div>
            )}
        </div>
    );
};

LastUpdatesBox.propTypes = {
    id: PropTypes.string.isRequired
};

export default LastUpdatesBox;
