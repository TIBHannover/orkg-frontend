import Link from 'next/link';
import { Dispatch, FC, SetStateAction } from 'react';

import Modal from '@/components/Ui/Modal/Modal';
import ModalBody from '@/components/Ui/Modal/ModalBody';
import ModalHeader from '@/components/Ui/Modal/ModalHeader';
import ROUTES from '@/constants/routes';
import { Node } from '@/services/backend/types';
import { reverseWithSlug } from '@/utils';

type ResearchProblemsModalProps = {
    problems: Node[];
    openModal: boolean;
    setOpenModal: Dispatch<SetStateAction<boolean>>;
};

const ResearchProblemsModal: FC<ResearchProblemsModalProps> = ({ problems, openModal, setOpenModal }) => (
    <Modal isOpen={openModal} toggle={() => setOpenModal((v) => !v)} size="lg">
        <ModalHeader toggle={() => setOpenModal((v) => !v)}>
            <div className="d-flex justify-content-end mb-2 me-2">
                <div>Research problems</div>
            </div>
        </ModalHeader>
        <ModalBody>
            <ul className="ps-3 pe-3">
                {problems?.map((rp) => (
                    <li key={`p${rp.id}`}>
                        <Link href={reverseWithSlug(ROUTES.RESEARCH_PROBLEM, { researchProblemId: rp.id, slug: rp.label })}>{rp.label}</Link>
                    </li>
                ))}
            </ul>
        </ModalBody>
    </Modal>
);

export default ResearchProblemsModal;
