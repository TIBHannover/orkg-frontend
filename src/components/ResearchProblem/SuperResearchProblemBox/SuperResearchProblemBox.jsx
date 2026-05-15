import Link from 'next/link';
import PropTypes from 'prop-types';

import ROUTES from '@/constants/routes';
import { reverseWithSlug } from '@/utilsTyped';

const SuperResearchProblemBox = ({ isLoading, superProblems }) => (
    <div className="box rounded-lg p-4 grow flex flex-col">
        <h5>Super-problems</h5>
        <div>
            <small className="text-gray-500">
                Research problems that has this problem as <i>Sub Problem</i>
            </small>
        </div>
        {!isLoading ? (
            <div className="mb-6 mt-6 pl-4 pr-4">
                {superProblems.length > 0 ? (
                    <ul className="pl-1">
                        {superProblems.map((superProblem) => (
                            <li key={`suprp${superProblem.id}`}>
                                <Link
                                    href={reverseWithSlug(ROUTES.RESEARCH_PROBLEM, {
                                        researchProblemId: superProblem.id,
                                        slug: superProblem.label,
                                    })}
                                >
                                    {superProblem.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-center mt-6 mb-6">No super research problems</div>
                )}
            </div>
        ) : (
            <div className="text-center mt-6 mb-6">Loading super research problems...</div>
        )}
    </div>
);

SuperResearchProblemBox.propTypes = {
    isLoading: PropTypes.bool.isRequired,
    superProblems: PropTypes.array.isRequired,
};

export default SuperResearchProblemBox;
