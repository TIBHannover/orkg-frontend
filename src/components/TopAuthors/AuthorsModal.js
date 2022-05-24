import ContentLoader from 'react-content-loader';
import { Modal, ModalBody, ModalHeader } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faAward } from '@fortawesome/free-solid-svg-icons';
import AuthorCard from 'components/AuthorCard/AuthorCard';
import PropTypes from 'prop-types';
import pluralize from 'pluralize';
import useResearchProblemAuthors from './hooks/useResearchProblemAuthors';

const ContributorsModal = ({ researchProblemId, openModal, setOpenModal }) => {
    const { authors, isLoading } = useResearchProblemAuthors({
        researchProblemId,
        pageSize: 30,
    });

    return (
        <Modal isOpen={openModal} toggle={() => setOpenModal(v => !v)} size="lg">
            <ModalHeader toggle={() => setOpenModal(v => !v)}>
                <Icon icon={faAward} className="text-primary ms-2" /> Top 30 Authors
            </ModalHeader>
            <ModalBody>
                <div className="ps-3 pe-3">
                    {!isLoading &&
                        authors.map((author, index) => (
                            <div className="pt-2 pb-2" key={`rp${index}`}>
                                <div className="d-flex">
                                    <div className="ps-4 pe-4 pt-2">{index + 1}.</div>
                                    <div>
                                        <AuthorCard author={author.author} subTitle={pluralize('paper', author.papers, true)} />
                                    </div>
                                </div>
                                {authors.length - 1 !== index && <hr className="mb-0 mt-3" />}
                            </div>
                        ))}
                    {!isLoading && authors?.length === 0 && <div className="mt-4 mb-4">No authors yet.</div>}
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
                </div>
            </ModalBody>
        </Modal>
    );
};

ContributorsModal.propTypes = {
    researchProblemId: PropTypes.string.isRequired,
    openModal: PropTypes.bool.isRequired,
    setOpenModal: PropTypes.func.isRequired,
};

export default ContributorsModal;
