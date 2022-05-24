import ROUTES from 'constants/routes';
import { Link } from 'react-router-dom';
import { reverseWithSlug } from 'utils';
import PropTypes from 'prop-types';

const SuperResearchProblemBox = ({ isLoading, superProblems }) => {
    return (
        <div className="box rounded-3 p-3 flex-grow-1 d-flex flex-column">
            <h5>Super-problems</h5>
            <div>
                <small className="text-muted">
                    Research problems that has this problem as <i>Sub Problem</i>
                </small>
            </div>
            {!isLoading ? (
                <div className="mb-4 mt-4 ps-3 pe-3">
                    {superProblems.length > 0 ? (
                        <ul className="ps-1">
                            {superProblems.map(superProblem => {
                                return (
                                    <li key={`suprp${superProblem.id}`}>
                                        <Link
                                            to={reverseWithSlug(ROUTES.RESEARCH_PROBLEM, {
                                                researchProblemId: superProblem.id,
                                                slug: superProblem.label
                                            })}
                                        >
                                            {superProblem.label}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <div className="text-center mt-4 mb-4">No super research problems</div>
                    )}
                </div>
            ) : (
                <div className="text-center mt-4 mb-4">Loading super research problems...</div>
            )}
        </div>
    );
};

SuperResearchProblemBox.propTypes = {
    isLoading: PropTypes.bool.isRequired,
    superProblems: PropTypes.array.isRequired
};

export default SuperResearchProblemBox;
