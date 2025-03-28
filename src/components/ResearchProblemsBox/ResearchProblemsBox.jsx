import { faCheck, faPlus, faTimes, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { truncate } from 'lodash';
import Link from 'next/link';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { Button } from 'reactstrap';

import ActionButton from '@/components/ActionButton/ActionButton';
import ContentLoader from '@/components/ContentLoader/ContentLoader';
import Tooltip from '@/components/FloatingUI/Tooltip';
import useAuthentication from '@/components/hooks/useAuthentication';
import AddResearchProblem from '@/components/Observatory/AddResearchProblem';
import useResearchProblems from '@/components/ResearchProblemsBox/hooks/useResearchProblems';
import ResearchProblemsModal from '@/components/ResearchProblemsBox/ResearchProblemsModal';
import ROUTES from '@/constants/routes';
import { reverseWithSlug } from '@/utils';

const ResearchProblemsBox = ({ id, by = 'ResearchField', isEditMode }) => {
    const { problems, isLoading, totalElements, setProblems, deleteResearchProblem, setTotalElements } = useResearchProblems({
        id,
        by,
        initialSort: 'combined',
        pageSize: 10,
    });
    const [openModal, setOpenModal] = useState(false);
    const { user } = useAuthentication();
    const [showAddResearchProblemDialog, setShowAddResearchProblemDialog] = useState(false);

    return (
        <div className="box rounded-3 p-3 flex-grow-1 d-flex flex-column">
            <div className="d-flex">
                <h5 className="flex-grow-1">Research problems</h5>{' '}
                {isEditMode && !!user && user.isCurationAllowed && by === 'Observatory' && (
                    <>
                        <Button outline size="sm" className="d-inline-block" onClick={() => setShowAddResearchProblemDialog((v) => !v)}>
                            <FontAwesomeIcon icon={faPlus} /> Add
                        </Button>
                        <AddResearchProblem
                            showDialog={showAddResearchProblemDialog}
                            toggle={() => setShowAddResearchProblemDialog((v) => !v)}
                            id={id}
                            setProblems={setProblems}
                            setTotalElements={setTotalElements}
                        />
                    </>
                )}
            </div>
            <div className="flex-grow-1">
                {!isLoading && totalElements > 0 && (
                    <ul className="ps-3 pt-2">
                        {problems.slice(0, 5).map((rp) => (
                            <li key={`rp${rp.id}`}>
                                <Tooltip content={rp.label} disabled={rp.label?.length <= 70}>
                                    <Link href={reverseWithSlug(ROUTES.RESEARCH_PROBLEM, { researchProblemId: rp.id, slug: rp.label })}>
                                        {truncate(rp.label, { length: 70 })}
                                    </Link>
                                </Tooltip>{' '}
                                {isEditMode && !!user && user.isCurationAllowed && by === 'Observatory' && (
                                    <ActionButton
                                        title="Delete this research problem from the observatory"
                                        icon={faTrash}
                                        key={`problem${rp.id}`}
                                        requireConfirmation
                                        confirmationMessage="Are you sure?"
                                        confirmationButtons={[
                                            {
                                                title: 'Delete',
                                                color: 'danger',
                                                icon: faCheck,
                                                action: () => deleteResearchProblem(rp),
                                            },
                                            {
                                                title: 'Cancel',
                                                color: 'secondary',
                                                icon: faTimes,
                                            },
                                        ]}
                                    />
                                )}
                            </li>
                        ))}
                    </ul>
                )}
                {!isLoading && totalElements === 0 && <div className="text-center my-4">No research problems yet</div>}
            </div>
            {isLoading && (
                <div className="mt-4 mb-4">
                    <ContentLoader height={130} width={300} foregroundColor="#d9d9d9" backgroundColor="#ecebeb">
                        <rect x="0" y="5" rx="3" ry="3" width="250" height="6" />
                        <rect x="0" y="15" rx="3" ry="3" width="150" height="5" />
                        <rect x="0" y="35" rx="3" ry="3" width="250" height="6" />
                        <rect x="0" y="45" rx="3" ry="3" width="150" height="5" />
                        <rect x="0" y="65" rx="3" ry="3" width="250" height="6" />
                        <rect x="0" y="75" rx="3" ry="3" width="150" height="5" />
                    </ContentLoader>
                </div>
            )}
            {totalElements > 5 && (
                <div className="text-center mt-2">
                    <Button size="sm" onClick={() => setOpenModal((v) => !v)} color="light">
                        View more
                    </Button>
                    {openModal && <ResearchProblemsModal openModal={openModal} setOpenModal={setOpenModal} id={id} by={by} />}
                </div>
            )}
        </div>
    );
};
ResearchProblemsBox.propTypes = {
    id: PropTypes.string.isRequired,
    by: PropTypes.string.isRequired, // ResearchField || Observatory
    organizationsList: PropTypes.array,
    isEditMode: PropTypes.bool.isRequired,
};

export default ResearchProblemsBox;
