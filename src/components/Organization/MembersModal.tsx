import { Contributor } from '@orkg/orkg-client';
import { Dispatch, FC, SetStateAction } from 'react';

import ContributorCard from '@/components/Cards/ContributorCard/ContributorCard';
import Modal from '@/components/Ui/Modal/Modal';
import ModalBody from '@/components/Ui/Modal/ModalBody';
import ModalHeader from '@/components/Ui/Modal/ModalHeader';

type MembersModalProps = {
    members: Contributor[];
    openModal: boolean;
    setOpenModal: Dispatch<SetStateAction<boolean>>;
};

const MembersModal: FC<MembersModalProps> = ({ members, openModal, setOpenModal }) => (
    <Modal isOpen={openModal} toggle={() => setOpenModal((v) => !v)} size="lg">
        <ModalHeader toggle={() => setOpenModal((v) => !v)}>Organization members</ModalHeader>
        <ModalBody>
            <div className="ps-3 pe-3">
                {members.map((contributor, index) => (
                    <div className="pt-2 pb-2" key={`rp${index}`}>
                        <div className="d-flex">
                            <div>
                                <ContributorCard id={contributor.id} />
                            </div>
                        </div>
                    </div>
                ))}
                {members?.length === 0 && <div className="mt-4 mb-4">No members yet</div>}
            </div>
        </ModalBody>
    </Modal>
);
export default MembersModal;
