import { useState, useEffect, useCallback } from 'react';
import { Button, Modal, ModalBody, ModalHeader } from 'reactstrap';
import { getProblemsByObservatoryId } from 'services/backend/observatories';
import AddResearchProblem from 'components/Observatory/AddResearchProblem';
import PropTypes from 'prop-types';
import ROUTES from 'constants/routes';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { reverseWithSlug } from 'utils';
import capitalize from 'capitalize';

const ResearchProblemsBox = ({ observatoryId, organizationsList }) => {
    const user = useSelector(state => state.auth.user);
    const [openModal, setOpenModal] = useState(false);
    const [showAddResearchProblemDialog, setShowAddResearchProblemDialog] = useState(false);
    const [isLoadingProblems, setIsLoadingProblems] = useState(null);
    const [problemsList, setProblemsList] = useState([]);

    const loadProblems = useCallback(() => {
        setIsLoadingProblems(true);
        getProblemsByObservatoryId(observatoryId)
            .then(problems => {
                setProblemsList(problems);
                setIsLoadingProblems(false);
            })
            .catch(error => {
                setIsLoadingProblems(false);
            });
    }, [observatoryId]);

    useEffect(() => {
        loadProblems();
    }, [observatoryId, loadProblems]);

    const updateObservatoryResearchProblem = () => {
        loadProblems();
    };

    return (
        <div className="box rounded-3 p-4 flex-grow-1">
            <h5>Research Problems</h5>
            {!!user && user.isCurationAllowed && (
                <Button outline size="sm" style={{ float: 'right', marginTop: '-33px' }} onClick={() => setShowAddResearchProblemDialog(v => !v)}>
                    <Icon icon={faPlus} /> Add
                </Button>
            )}
            {!isLoadingProblems ? (
                <div className="mb-4 mt-2">
                    {problemsList.length > 0 ? (
                        <div>
                            <ol className="list-group" style={{ paddingLeft: 15 }}>
                                {problemsList.slice(0, 5).map((problem, index) => {
                                    return (
                                        <li key={`rp${index}`} className="mt-2">
                                            <Link
                                                to={reverseWithSlug(ROUTES.RESEARCH_PROBLEM, {
                                                    researchProblemId: problem.id,
                                                    slug: problem.label
                                                })}
                                            >
                                                {capitalize(problem.label)}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ol>
                        </div>
                    ) : (
                        <div className="text-center mt-4 mb-4">No Research Problems</div>
                    )}
                    {problemsList?.length > 5 && (
                        <div className="text-center mt-3">
                            <Button size="sm" onClick={() => setOpenModal(v => !v)} color="light">
                                View more
                            </Button>
                            {openModal && (
                                <Modal isOpen={openModal} toggle={() => setOpenModal(v => !v)} size="lg">
                                    <ModalHeader toggle={() => setOpenModal(v => !v)}>Research Problems</ModalHeader>
                                    <ModalBody>
                                        <ol className="list-group" style={{ paddingLeft: 15 }}>
                                            {problemsList.map((problem, index) => {
                                                return (
                                                    <li key={`rp${index}`} className="mt-2">
                                                        <Link
                                                            to={reverseWithSlug(ROUTES.RESEARCH_PROBLEM, {
                                                                researchProblemId: problem.id,
                                                                slug: problem.label
                                                            })}
                                                        >
                                                            {capitalize(problem.label)}
                                                        </Link>
                                                    </li>
                                                );
                                            })}
                                        </ol>
                                    </ModalBody>
                                </Modal>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center mt-4 mb-4">Loading research problems ...</div>
            )}

            <AddResearchProblem
                showDialog={showAddResearchProblemDialog}
                toggle={() => setShowAddResearchProblemDialog(v => !v)}
                id={observatoryId}
                organizationId={organizationsList.length > 0 ? organizationsList[0]['id'] : ''}
                updateObservatoryResearchProblem={updateObservatoryResearchProblem}
            />
        </div>
    );
};

ResearchProblemsBox.propTypes = {
    observatoryId: PropTypes.string.isRequired,
    organizationsList: PropTypes.array.isRequired
};

export default ResearchProblemsBox;
