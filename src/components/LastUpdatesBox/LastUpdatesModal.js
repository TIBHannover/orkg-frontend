import ContentLoader from 'react-content-loader';
import useTopChangelog from 'components/LastUpdatesBox/hooks/useTopChangelog';
import { Modal, ModalBody, ModalHeader } from 'reactstrap';
import { StyledActivity } from './styled';
import moment from 'moment';
import { Link } from 'react-router-dom';
import { getResourceLink, getResourceTypeLabel } from 'utils';
import { truncate } from 'lodash';
import PropTypes from 'prop-types';

const LastUpdatesBox = ({ researchFieldId, openModal, setOpenModal }) => {
    const { activities, isLoading } = useTopChangelog({ researchFieldId, pageSize: 30 });

    return (
        <Modal isOpen={openModal} toggle={() => setOpenModal(v => !v)} size="lg">
            <ModalHeader toggle={() => setOpenModal(v => !v)}>Last updates</ModalHeader>
            <ModalBody>
                <div className="pl-2 pr-2 mb-3">Last 30 updates:</div>
                <div className="pl-3 pr-3">
                    {!isLoading &&
                        activities.map((activity, index) => {
                            return (
                                <StyledActivity key={`sss${activity.id}`} className="pl-3 pb-3">
                                    <div className="time">{moment(activity.created_at).fromNow()}</div>
                                    <div className="action">
                                        {activity.profile?.id ? activity.profile.display_name : <i>Anonymous user</i>} added
                                        {` a ${getResourceTypeLabel(activity.classes?.length > 0 ? activity.classes[0] : '')} `}
                                        <Link to={getResourceLink(activity.classes?.length > 0 ? activity.classes[0] : '', activity.id)}>
                                            {' '}
                                            {truncate(activity.label, { length: 50 })}
                                        </Link>
                                    </div>
                                </StyledActivity>
                            );
                        })}
                    {isLoading && (
                        <div className="mt-4 mb-4">
                            <ContentLoader
                                speed={2}
                                width={400}
                                height={120}
                                viewBox="0 0 400 120"
                                style={{ width: '100% !important' }}
                                backgroundColor="#f3f3f3"
                                foregroundColor="#ecebeb"
                            >
                                <rect x="30" y="5" rx="3" ry="3" width="350" height="6" />
                                <rect x="30" y="15" rx="3" ry="3" width="100" height="5" />
                                <rect x="30" y="35" rx="3" ry="3" width="350" height="6" />
                                <rect x="30" y="45" rx="3" ry="3" width="350" height="5" />
                                <rect x="30" y="65" rx="3" ry="3" width="100" height="6" />
                                <rect x="30" y="75" rx="3" ry="3" width="350" height="5" />
                                <rect x="14" y="0" rx="3" ry="3" width="3" height="100" />
                            </ContentLoader>
                        </div>
                    )}
                </div>
            </ModalBody>
        </Modal>
    );
};

LastUpdatesBox.propTypes = {
    researchFieldId: PropTypes.string.isRequired,
    openModal: PropTypes.bool.isRequired,
    setOpenModal: PropTypes.func.isRequired
};

export default LastUpdatesBox;
