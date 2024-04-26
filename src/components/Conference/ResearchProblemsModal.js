import Link from 'components/NextJsMigration/Link';
import { Modal, ModalBody, ModalHeader } from 'reactstrap';
import PropTypes from 'prop-types';
import ROUTES from 'constants/routes.js';
import { reverseWithSlug } from 'utils';

const ResearchProblemsModal = ({ problems, openModal, setOpenModal }) => (
    <Modal isOpen={openModal} toggle={() => setOpenModal((v) => !v)} size="lg">
        <ModalHeader toggle={() => setOpenModal((v) => !v)}>
            <div className="d-flex justify-content-end mb-2 me-2">
                <div>Research problems</div>
            </div>
        </ModalHeader>
        <ModalBody>
            <ul className="ps-3 pe-3">
                {problems.map((rp) => (
                    <li key={`p${rp.id}`}>
                        <Link href={reverseWithSlug(ROUTES.RESEARCH_PROBLEM, { researchProblemId: rp.id, slug: rp.label })}>{rp.label}</Link>
                    </li>
                ))}
            </ul>
        </ModalBody>
    </Modal>
);

ResearchProblemsModal.propTypes = {
    problems: PropTypes.array.isRequired,
    openModal: PropTypes.bool.isRequired,
    setOpenModal: PropTypes.func.isRequired,
};

export default ResearchProblemsModal;
