import { faTrash } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';
import { FormGroup, Input, Label, Modal, ModalBody, ModalHeader } from 'reactstrap';

import ContentLoader from '@/components/ContentLoader/ContentLoader';
import useAuthentication from '@/components/hooks/useAuthentication';
import useResearchProblems from '@/components/ResearchProblemsBox/hooks/useResearchProblems';
import ResearchProblemCard from '@/components/ResearchProblemsBox/ResearchProblemCard';
import { VISIBILITY_FILTERS } from '@/constants/contentTypes';
import { RESOURCES } from '@/constants/graphSettings';

const ResearchProblemsModal = ({ id, by = 'ResearchField', openModal, setOpenModal }) => {
    const { isCurationAllowed } = useAuthentication();
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
        handleLoadMore,
        deleteResearchProblem,
    } = useResearchProblems({
        id,
        by,
        pageSize: 25,
        initialSort: 'combined',
        initialIncludeSubFields: true,
    });

    return (
        <Modal isOpen={openModal} toggle={() => setOpenModal((v) => !v)} size="lg">
            <ModalHeader toggle={() => setOpenModal((v) => !v)}>
                <div className="d-flex justify-content-end mb-2 me-2">
                    <div>Research problems</div>
                    <div className="mb-0 ms-2 me-2">
                        <Input value={sort} onChange={(e) => setSort(e.target.value)} bsSize="sm" type="select" name="sort" disabled={isLoading}>
                            <option value="combined">Top recent</option>
                            <option value={VISIBILITY_FILTERS.ALL_LISTED}>Recently added</option>
                            <option value={VISIBILITY_FILTERS.FEATURED}>Featured</option>
                            <option value={VISIBILITY_FILTERS.UNLISTED}>Unlisted</option>
                        </Input>
                    </div>
                    {id !== RESOURCES.RESEARCH_FIELD_MAIN && by === 'ResearchField' && (
                        <div className="d-flex rounded" style={{ fontSize: '0.875rem', padding: '0.25rem 0' }}>
                            <FormGroup check className="mb-0">
                                <Label check className="mb-0">
                                    <Input
                                        onChange={(e) => setIncludeSubFields(e.target.checked)}
                                        checked={includeSubFields}
                                        type="checkbox"
                                        disabled={isLoading}
                                    />
                                    Include subfields
                                </Label>
                            </FormGroup>
                        </div>
                    )}
                </div>
            </ModalHeader>
            <ModalBody>
                <div className="ps-3 pe-3">
                    {problems.map((rp, index) => (
                        <div className="pt-2 pb-2" key={`rp${rp.id}`}>
                            <ResearchProblemCard
                                problem={rp}
                                options={
                                    isCurationAllowed && by === 'Observatory'
                                        ? [
                                              {
                                                  label: 'Delete this research problem from the observatory',
                                                  action: () => deleteResearchProblem(rp),
                                                  icon: faTrash,
                                                  requireConfirmation: true,
                                              },
                                          ]
                                        : []
                                }
                            />
                            {problems.length - 1 !== index && <hr className="mb-0 mt-3" />}
                        </div>
                    ))}
                    {!isLoading && hasNextPage && (
                        <div
                            style={{ cursor: 'pointer' }}
                            className="list-group-item list-group-item-action text-center"
                            onClick={!isLoading ? handleLoadMore : undefined}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    if (!isLoading) {
                                        handleLoadMore();
                                    }
                                }
                            }}
                            role="button"
                            tabIndex={0}
                        >
                            Load more research problems
                        </div>
                    )}
                    {!hasNextPage && isLastPageReached && page !== 1 && <div className="text-center mt-3">You have reached the last page</div>}
                    {isLoading && (
                        <div className="mt-4 mb-4">
                            <ContentLoader speed={2} width={400} height={120} viewBox="0 0 400 120" style={{ width: '100% !important' }}>
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
    id: PropTypes.string.isRequired,
    by: PropTypes.string.isRequired, // ResearchField || Observatory
    openModal: PropTypes.bool.isRequired,
    setOpenModal: PropTypes.func.isRequired,
};

export default ResearchProblemsModal;
