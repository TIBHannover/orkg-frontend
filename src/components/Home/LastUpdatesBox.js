import styled from 'styled-components';
import ContentLoader from 'react-content-loader';
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

const LastUpdatesBox = ({ researchFieldId }) => {
    const { activities, isLoading } = useTopChangelog({ researchFieldId, pageSize: 3 });
    return (
        <div className="box rounded-lg p-3 flex-grow-1 d-flex flex-column">
            <h5>Last updates</h5>
            <div className="mt-3 flex-grow-1">
                <div>
                    {!isLoading &&
                        activities?.length > 0 &&
                        activities.map(activity => (
                            <StyledActivity key={`sss${activity.id}`} className="pl-3 pb-3">
                                <div className="time">{moment(activity.created_at).fromNow()}</div>
                                <div className="action">
                                    {activity.profile?.id ? activity.profile.display_name : <i>Anonymous user</i>} added{' '}
                                    <Link to={getResourceLink(activity.classes?.length > 0 ? activity.classes[0] : '', activity.id)}>
                                        {' '}
                                        {truncate(activity.label, { length: 50 })}
                                    </Link>
                                </div>
                            </StyledActivity>
                        ))}
                    {!isLoading && activities?.length === 0 && (
                        <div className="mt-4 mb-4">
                            No updates in this research field yet.
                            <br />
                            <i> be the first to start building the knowledge!</i>.
                        </div>
                    )}
                    {isLoading && (
                        <div className="mt-4 mb-4">
                            <ContentLoader height={130} width={200} foregroundColor="#d9d9d9" backgroundColor="#ecebeb">
                                <rect x="30" y="5" rx="3" ry="3" width="150" height="6" />
                                <rect x="30" y="15" rx="3" ry="3" width="100" height="5" />
                                <rect x="30" y="35" rx="3" ry="3" width="150" height="6" />
                                <rect x="30" y="45" rx="3" ry="3" width="150" height="5" />
                                <rect x="30" y="65" rx="3" ry="3" width="100" height="6" />
                                <rect x="30" y="75" rx="3" ry="3" width="150" height="5" />
                                <rect x="14" y="0" rx="3" ry="3" width="3" height="100" />
                            </ContentLoader>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

LastUpdatesBox.propTypes = {
    researchFieldId: PropTypes.string.isRequired
};

export default LastUpdatesBox;
