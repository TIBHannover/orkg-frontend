import ContentLoader from 'react-content-loader';
import useResearchFieldProblems from 'components/ResearchProblemsBox/hooks/useResearchFieldProblems';
import ProblemsDropdownFilter from './ProblemsDropdownFilter';
import { Modal, ModalBody, ModalHeader } from 'reactstrap';
import ROUTES from 'constants/routes.js';
import { Link } from 'react-router-dom';
import { reverseWithSlug } from 'utils';
import PropTypes from 'prop-types';

const ResearchProblemsModal = ({ researchFieldId, openModal, setOpenModal }) => {
    const {
        problems,
        page,
        sort,
        includeSubFields,
        isLoading,
        hasNextPage,
        isLastPageReached,
        setSort,
        setIncludeSubFields,
        handleLoadMore
    } = useResearchFieldProblems({
        researchFieldId,
        pageSize: 10,
        initialSort: 'newest',
        initialIncludeSubFields: true
    });

    return (
        <Modal isOpen={openModal} toggle={() => setOpenModal(v => !v)} size="lg">
            <ModalHeader toggle={() => setOpenModal(v => !v)}>
                Research problems
                <div style={{ display: 'inline-block', marginLeft: '20px' }}>
                    <ProblemsDropdownFilter
                        sort={sort}
                        isLoading={isLoading}
                        includeSubFields={includeSubFields}
                        setSort={setSort}
                        setIncludeSubFields={setIncludeSubFields}
                    />
                </div>
            </ModalHeader>
            <ModalBody>
                <div className="ps-3 pe-3">
                    {problems.map((rp, index) => (
                        <div className="pt-2 pb-2" key={`rp${rp.id}`}>
                            <div className="d-flex">
                                <div>
                                    <Link to={reverseWithSlug(ROUTES.RESEARCH_PROBLEM, { researchProblemId: rp.id, slug: rp.label })}>
                                        {rp.label}{' '}
                                    </Link>
                                    <br />
                                    {/* {rp.papers} paper */}
                                </div>
                            </div>
                            {problems.length - 1 !== index && <hr className="mb-0 mt-3" />}
                        </div>
                    ))}
                    {!isLoading && hasNextPage && (
                        <div
                            style={{ cursor: 'pointer' }}
                            className="list-group-item list-group-item-action text-center"
                            onClick={!isLoading ? handleLoadMore : undefined}
                            onKeyDown={e => (e.keyCode === 13 ? (!isLoading ? handleLoadMore : undefined) : undefined)}
                            role="button"
                            tabIndex={0}
                        >
                            Load more research problems
                        </div>
                    )}
                    {!hasNextPage && isLastPageReached && page !== 1 && <div className="text-center mt-3">You have reached the last page.</div>}
                    {isLoading && (
                        <div className="mt-4 mb-4">
                            <ContentLoader
                                speed={2}
                                width={400}
                                height={120}
                                viewBox="0 0 400 120"
                                style={{ width: '100% !important' }}
                                backgroundColor="#f3f3f3"
                                foregroundColor="#ecebeb"
                            >
                                <rect x="0" y="5" rx="3" ry="3" width="350" height="6" />
                                <rect x="0" y="15" rx="3" ry="3" width="150" height="5" />
                                <rect x="0" y="35" rx="3" ry="3" width="350" height="6" />
                                <rect x="0" y="45" rx="3" ry="3" width="150" height="5" />
                                <rect x="0" y="65" rx="3" ry="3" width="350" height="6" />
                                <rect x="0" y="75" rx="3" ry="3" width="150" height="5" />
                            </ContentLoader>
                        </div>
                    )}
                </div>
            </ModalBody>
        </Modal>
    );
};

ResearchProblemsModal.propTypes = {
    researchFieldId: PropTypes.string.isRequired,
    openModal: PropTypes.bool.isRequired,
    setOpenModal: PropTypes.func.isRequired
};

export default ResearchProblemsModal;
