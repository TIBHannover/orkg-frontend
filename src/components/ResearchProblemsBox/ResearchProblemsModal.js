import ContentLoader from 'react-content-loader';
import useResearchProblems from 'components/ResearchProblemsBox/hooks/useResearchProblems';
import ResearchProblemCard from 'components/ResearchProblemsBox/ResearchProblemCard';
import { MISC } from 'constants/graphSettings';
import { FormGroup, Label, Input, Modal, ModalBody, ModalHeader } from 'reactstrap';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';

const ResearchProblemsModal = ({ id, by = 'ResearchField', openModal, setOpenModal }) => {
    const isCurationAllowed = useSelector(state => state.auth.user?.isCurationAllowed);
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
    } = useResearchProblems({
        id,
        by,
        pageSize: 25,
        initialSort: 'combined',
        initialIncludeSubFields: true,
    });

    return (
        <Modal isOpen={openModal} toggle={() => setOpenModal(v => !v)} size="lg">
            <ModalHeader toggle={() => setOpenModal(v => !v)}>
                <div className="d-flex justify-content-end mb-2 me-2">
                    <div>Research problems</div>
                    <div className="mb-0 ms-2 me-2">
                        <Input value={sort} onChange={e => setSort(e.target.value)} bsSize="sm" type="select" name="sort" disabled={isLoading}>
                            <option value="combined">Top recent</option>
                            <option value="newest">Recently added</option>
                            <option value="featured">Featured</option>
                            {isCurationAllowed && <option value="unlisted">Unlisted</option>}
                        </Input>
                    </div>
                    {id !== MISC.RESEARCH_FIELD_MAIN && by === 'ResearchField' && (
                        <div className="d-flex rounded" style={{ fontSize: '0.875rem', padding: '0.25rem 0' }}>
                            <FormGroup check className="mb-0">
                                <Label check className="mb-0">
                                    <Input
                                        onChange={e => setIncludeSubFields(e.target.checked)}
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
                            <ResearchProblemCard problem={rp} />
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
    id: PropTypes.string.isRequired,
    by: PropTypes.string.isRequired, // ResearchField || Observatory
    openModal: PropTypes.bool.isRequired,
    setOpenModal: PropTypes.func.isRequired,
};

export default ResearchProblemsModal;
