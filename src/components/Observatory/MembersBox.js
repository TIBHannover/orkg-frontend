import { useState, useEffect } from 'react';
import { Button, Modal, ModalBody, ModalHeader } from 'reactstrap';
import { getUsersByObservatoryId } from 'services/backend/observatories';
import ContributorCard from 'components/ContributorCard/ContributorCard';
import PropTypes from 'prop-types';

const MembersBox = ({ observatoryId, organizationsList }) => {
    const [members, setMembers] = useState([]);
    const [isLoadingMembers, setIsLoadingMembers] = useState(null);
    const [openModal, setOpenModal] = useState(false);

    useEffect(() => {
        const loadMembers = () => {
            setIsLoadingMembers(true);
            getUsersByObservatoryId(observatoryId)
                .then(contributors => {
                    setMembers(contributors);
                    setIsLoadingMembers(false);
                })
                .catch(error => {
                    setIsLoadingMembers(false);
                });
        };

        loadMembers();
    }, [observatoryId]);

    return (
        <div className="box rounded-lg p-4 flex-grow-1 d-flex flex-column">
            <h5>Members</h5>
            <div className="flex-grow-1">
                {!isLoadingMembers ? (
                    <div className="mt-3">
                        {members.length > 0 ? (
                            <div>
                                {members.slice(0, 4).map((user, index) => {
                                    return (
                                        <div key={`oc${index}`}>
                                            <ContributorCard
                                                contributor={{
                                                    ...user,
                                                    subTitle: organizationsList.find(o => o.id.includes(user.organization_id))?.name
                                                }}
                                            />
                                            {members.slice(0, 4).length - 1 !== index && <hr style={{ width: '90%', margin: '10px auto' }} />}
                                        </div>
                                    );
                                })}
                                {!isLoadingMembers && members?.length > 4 && (
                                    <div className="text-center mt-3">
                                        <Button size="sm" onClick={() => setOpenModal(v => !v)} color="lightblue">
                                            View more
                                        </Button>
                                        {openModal && (
                                            <Modal isOpen={openModal} toggle={() => setOpenModal(v => !v)} size="lg">
                                                <ModalHeader toggle={() => setOpenModal(v => !v)}>Observatory members</ModalHeader>
                                                <ModalBody>
                                                    <div className="clearfix">
                                                        {members.map((user, index) => {
                                                            return (
                                                                <div key={`moc${index}`}>
                                                                    <ContributorCard
                                                                        contributor={{
                                                                            ...user,
                                                                            subTitle: organizationsList.find(o => o.id.includes(user.organization_id))
                                                                                ?.name
                                                                        }}
                                                                    />
                                                                    {members.length - 1 !== index && (
                                                                        <hr style={{ width: '90%', margin: '10px auto' }} />
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </ModalBody>
                                            </Modal>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center mt-4 mb-4">No members in this observatory yet.</div>
                        )}
                    </div>
                ) : (
                    <div className="text-center mt-4 mb-4">Loading members ...</div>
                )}
            </div>
        </div>
    );
};

MembersBox.propTypes = {
    observatoryId: PropTypes.string.isRequired,
    organizationsList: PropTypes.array.isRequired
};

export default MembersBox;
