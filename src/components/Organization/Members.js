import { useState, useEffect } from 'react';
import { CardTitle } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faEllipsisH } from '@fortawesome/free-solid-svg-icons';
import { getUsersByOrganizationId } from 'services/backend/organizations';
import ContentLoader from 'react-content-loader';
import MembersModal from './MembersModal';
import ROUTES from 'constants/routes.js';
import { StyledGravatar, StyledDotGravatar, ContributorsAvatars } from 'components/styled';
import Tippy from '@tippyjs/react';
import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';

const Members = ({ organizationsId }) => {
    const [members, setMembers] = useState([]);
    const [isLoadingMembers, setIsLoadingMembers] = useState(null);
    const [openModal, setOpenModal] = useState(false);

    useEffect(() => {
        const loadMembers = () => {
            setIsLoadingMembers(true);
            getUsersByOrganizationId(organizationsId)
                .then(members => {
                    setMembers(members);
                    setIsLoadingMembers(false);
                })
                .catch(error => {
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
                            <Tippy offset={[0, 20]} placement="bottom" content={<>{member.display_name}</>}>
                                <Link to={reverse(ROUTES.USER_PROFILE, { userId: member.id })}>
                                    <StyledGravatar className="rounded-circle" md5={member.gravatar_id} size={48} />
                                </Link>
                            </Tippy>
                        </div>
                    ))}
                    {members.length > 18 && (
                        <Tippy key="contributor" content="View More">
                            <StyledDotGravatar onClick={() => setOpenModal(v => !v)} className="rounded-circle">
                                <Icon icon={faEllipsisH} />
                            </StyledDotGravatar>
                        </Tippy>
                    )}
                </ContributorsAvatars>
            )}
            {!isLoadingMembers && members?.length === 0 && <div className="mt-4 mb-4">No members in this organizations yet.</div>}
            {members.length > 18 && openModal && (
                <MembersModal members={members} openModal={openModal} setOpenModal={setOpenModal} organizationsId={organizationsId} />
            )}
            {isLoadingMembers && (
                <div className="mt-4 mb-4" style={{ width: '100% !important' }}>
                    <ContentLoader
                        height="100%"
                        width="100%"
                        viewBox="0 0 100 4"
                        style={{ width: '100% !important' }}
                        backgroundColor="#f3f3f3"
                        foregroundColor="#ecebeb"
                    >
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
    organizationsId: PropTypes.string.isRequired
};

export default Members;
