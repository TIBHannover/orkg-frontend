import ContentLoader from 'components/ContentLoader/ContentLoader';
import useTopChangelog from 'components/LastUpdatesBox/hooks/useTopChangelog';
import { StyledActivity } from 'components/LastUpdatesBox/styled';
import ROUTES from 'constants/routes';
import dayjs from 'dayjs';
import { truncate } from 'lodash';
import { reverse } from 'named-urls';
import Link from 'next/link';
import PropTypes from 'prop-types';
import { Modal, ModalBody, ModalHeader } from 'reactstrap';
import { getResourceLink, getResourceTypeLabel } from 'utils';

const LastUpdatesBox = ({ researchFieldId, openModal, setOpenModal }) => {
    const { activities, isLoading } = useTopChangelog({ researchFieldId, pageSize: 30 });

    return (
        <Modal isOpen={openModal} toggle={() => setOpenModal((v) => !v)} size="lg">
            <ModalHeader toggle={() => setOpenModal((v) => !v)}>Last 30 updates</ModalHeader>
            <ModalBody>
                <div className="ps-3 pe-3">
                    {!isLoading &&
                        activities.map((activity, index) => (
                            <StyledActivity key={`sss${activity.id}`} className="ps-3 pb-3">
                                <div className="time">{dayjs(activity.created_at).fromNow()}</div>
                                <div className="action">
                                    {activity.profile?.id ? (
                                        <Link href={reverse(ROUTES.USER_PROFILE, { userId: activity.profile.id })}>
                                            {activity.profile.display_name}
                                        </Link>
                                    ) : (
                                        <i>Anonymous user</i>
                                    )}{' '}
                                    added
                                    {` a ${getResourceTypeLabel(activity.classes?.length > 0 ? activity.classes[0] : '')} `}
                                    <Link href={getResourceLink(activity.classes?.length > 0 ? activity.classes[0] : '', activity.id)}>
                                        {' '}
                                        {truncate(activity.label, { length: 50 })}
                                    </Link>
                                </div>
                            </StyledActivity>
                        ))}
                    {isLoading && (
                        <div className="mt-4 mb-4">
                            <ContentLoader speed={2} width={400} height={120} viewBox="0 0 400 120" style={{ width: '100% !important' }}>
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
    setOpenModal: PropTypes.func.isRequired,
};

export default LastUpdatesBox;
