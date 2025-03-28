import { faEllipsisH } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { reverse } from 'named-urls';
import Link from 'next/link';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { CardTitle } from 'reactstrap';

import ContentLoader from '@/components/ContentLoader/ContentLoader';
import Tooltip from '@/components/FloatingUI/Tooltip';
import MembersModal from '@/components/Organization/MembersModal';
import { ContributorsAvatars, StyledDotGravatar, StyledGravatar } from '@/components/styled';
import ROUTES from '@/constants/routes';
import { getUsersByOrganizationId } from '@/services/backend/organizations';

const Members = ({ organizationsId }) => {
    const [members, setMembers] = useState([]);
    const [isLoadingMembers, setIsLoadingMembers] = useState(null);
    const [openModal, setOpenModal] = useState(false);

    useEffect(() => {
        const loadMembers = () => {
            setIsLoadingMembers(true);
            getUsersByOrganizationId(organizationsId)
                .then((_members) => {
                    setMembers(_members);
                    setIsLoadingMembers(false);
                })
                .catch(() => {
                    setIsLoadingMembers(false);
                });
        };

        loadMembers();
    }, [organizationsId]);

    return (
        <div>
            <div className="d-flex mb-3">
                <CardTitle tag="h5" className="flex-grow-1">
                    Members
                </CardTitle>
            </div>
            {!isLoadingMembers && members && members.length > 0 && (
                <ContributorsAvatars>
                    {members.slice(0, 18).map((member /* 18 perfect for the container width */) => (
                        <div key={`contributor${member.id}`}>
                            <Tooltip placement="bottom" content={member.display_name}>
                                <Link href={reverse(ROUTES.USER_PROFILE, { userId: member.id })}>
                                    <StyledGravatar className="rounded-circle" md5={member.gravatar_id} size={48} />
                                </Link>
                            </Tooltip>
                        </div>
                    ))}
                    {members.length > 18 && (
                        <Tooltip key="contributor" content="View More">
                            <StyledDotGravatar onClick={() => setOpenModal((v) => !v)} className="rounded-circle">
                                <FontAwesomeIcon icon={faEllipsisH} />
                            </StyledDotGravatar>
                        </Tooltip>
                    )}
                </ContributorsAvatars>
            )}
            {!isLoadingMembers && members?.length === 0 && <div className="mb-2">No members in this organization yet</div>}
            {members.length > 18 && openModal && (
                <MembersModal members={members} openModal={openModal} setOpenModal={setOpenModal} organizationsId={organizationsId} />
            )}
            {isLoadingMembers && (
                <div className="mt-4 mb-4" style={{ width: '100% !important' }}>
                    <ContentLoader height="100%" width="100%" viewBox="0 0 100 4" style={{ width: '100% !important' }}>
                        <circle cx="2" cy="2" r="2" />
                        <circle cx="7" cy="2" r="2" />
                        <circle cx="12" cy="2" r="2" />
                        <circle cx="17" cy="2" r="2" />
                        <circle cx="22" cy="2" r="2" />
                    </ContentLoader>
                </div>
            )}
        </div>
    );
};

Members.propTypes = {
    organizationsId: PropTypes.string.isRequired,
};

export default Members;
