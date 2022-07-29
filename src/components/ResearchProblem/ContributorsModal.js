import ContentLoader from 'react-content-loader';
import { Modal, ModalBody, ModalHeader } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faAward } from '@fortawesome/free-solid-svg-icons';
import ContributorCard from 'components/ContributorCard/ContributorCard';
import PropTypes from 'prop-types';
import pluralize from 'pluralize';
import useResearchProblemContributors from './hooks/useResearchProblemContributors';

const ContributorsModal = ({ researchProblemId, openModal, setOpenModal }) => {
    const { contributors, isLoading, isLoadingFailed } = useResearchProblemContributors({
        researchProblemId,
        pageSize: 19,
    });

    return (
        <Modal isOpen={openModal} toggle={() => setOpenModal(v => !v)} size="lg">
            <ModalHeader toggle={() => setOpenModal(v => !v)}>
                <Icon icon={faAward} className="text-primary me-2" />
                Top 30 Contributors
            </ModalHeader>
            <ModalBody>
                <div className="ps-3 pe-3">
                    {!isLoading &&
                        contributors.map((contributor, index) => (
                            <div className="pt-2 pb-2" key={`rp${index}`}>
                                <div className="d-flex">
                                    <div className="ps-4 pe-4 pt-2">{index + 1}.</div>
                                    <div>
                                        <ContributorCard
                                            contributor={{
                                                ...contributor.user,
                                                subTitle: contributor.contributions ? pluralize('contribution', contributor.contributions, true) : '',
                                            }}
                                        />
                                    </div>
                                </div>
                                {contributors.length - 1 !== index && <hr className="mb-0 mt-3" />}
                            </div>
                        ))}
                    {!isLoading && !isLoadingFailed && contributors?.length === 0 && (
                        <div className="mt-4 mb-4">
                            No contributors yet.
                            <i> Be the first contributor!</i>
                        </div>
                    )}
                    {!isLoading && isLoadingFailed && <div className="mt-4 mb-4 text-danger">Something went wrong while loading contributors.</div>}
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
    initialSort: PropTypes.string,
    initialIncludeSubFields: PropTypes.bool,
};

export default ContributorsModal;
