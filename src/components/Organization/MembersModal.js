import { Modal, ModalBody, ModalHeader } from 'reactstrap';
import ContributorCard from 'components/ContributorCard/ContributorCard';
import PropTypes from 'prop-types';

const MembersModal = ({ members, openModal, setOpenModal }) => {
    return (
        <Modal isOpen={openModal} toggle={() => setOpenModal(v => !v)} size="lg">
            <ModalHeader toggle={() => setOpenModal(v => !v)}>Organization members</ModalHeader>
            <ModalBody>
                <div className="ps-3 pe-3">
                    {members.map((contributor, index) => {
                        return (
                            <div className="pt-2 pb-2" key={`rp${index}`}>
                                <div className="d-flex">
                                    <div>
                                        <ContributorCard
                                            contributor={{
                                                ...contributor
                                            }}
                                        />
                                    </div>
                                </div>
                                {members.length - 1 !== index && <hr className="mb-0 mt-3" />}
                            </div>
                        );
                    })}
                    {members?.length === 0 && <div className="mt-4 mb-4">No members yet.</div>}
                </div>
            </ModalBody>
        </Modal>
    );
};

MembersModal.propTypes = {
    members: PropTypes.array.isRequired,
    openModal: PropTypes.bool.isRequired,
    setOpenModal: PropTypes.func.isRequired
};

export default MembersModal;
