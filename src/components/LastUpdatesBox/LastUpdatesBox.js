import { useState } from 'react';
import ContentLoader from 'react-content-loader';
import useTopChangelog from 'components/LastUpdatesBox/hooks/useTopChangelog';
import LastUpdatesModal from './LastUpdatesModal';
import { StyledActivity } from './styled';
import moment from 'moment';
import { Link } from 'react-router-dom';
import { getResourceLink, getResourceTypeLabel } from 'utils';
import { reverse } from 'named-urls';
import ROUTES from 'constants/routes';
import { truncate } from 'lodash';
import PropTypes from 'prop-types';
import { Button } from 'reactstrap';

const LastUpdatesBox = ({ researchFieldId }) => {
    const { activities, isLoading } = useTopChangelog({ researchFieldId, pageSize: 4 });
    const [openModal, setOpenModal] = useState(false);

    return (
        <div className="box rounded-3 p-3 flex-grow-1 d-flex flex-column">
            <h5>Last updates</h5>
            <div className="mt-3 flex-grow-1">
                <div>
                    <div>
                        {!isLoading &&
                            activities?.length > 0 &&
                            activities.slice(0, 3).map(activity => (
                                <StyledActivity key={`log${activity.id}`} className="ps-3 pb-3">
                                    <div className="time">{moment(activity.created_at).fromNow()}</div>
                                    <div className="action">
                                        {activity.profile?.id ? (
                                            <>
                                                <Link to={reverse(ROUTES.USER_PROFILE, { userId: activity.profile.id })}>
                                                    {activity.profile.display_name}
                                                </Link>
                                            </>
                                        ) : (
                                            <i>Anonymous user</i>
                                        )}{' '}
                                        added
                                        {` ${getResourceTypeLabel(activity.classes?.length > 0 ? activity.classes[0] : '')} `}
                                        <Link to={getResourceLink(activity.classes?.length > 0 ? activity.classes[0] : '', activity.id)}>
                                            {truncate(activity.label, { length: 50 })}
                                        </Link>
                                    </div>
                                </StyledActivity>
                            ))}
                    </div>
                    {!isLoading && activities.length > 3 && (
                        <div className="text-center">
                            <Button size="sm" onClick={() => setOpenModal(v => !v)} color="light">
                                View more
                            </Button>
                        </div>
                    )}
                    {!isLoading && activities?.length === 0 && (
                        <div className="mt-4 mb-4">
                            No updates in this research field yet.
                            <br />
                            <i> Be the first to start building the knowledge!</i>
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
                    {activities.length > 3 && openModal && (
                        <LastUpdatesModal openModal={openModal} setOpenModal={setOpenModal} researchFieldId={researchFieldId} />
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
