import { Badge, Button } from 'reactstrap';
import ROUTES from 'constants/routes.js';
import { Link } from 'react-router-dom';
import useResearchFieldProblems from 'components/Home/hooks/useResearchFieldProblems';
import { reverseWithSlug } from 'utils';
import PropTypes from 'prop-types';

const ResearchProblemsBox = ({ id }) => {
    const { researchProblems } = useResearchFieldProblems();

    return (
        <div className="box rounded-lg p-3 flex-grow-1 d-flex flex-column">
            <h5>Research problems</h5>
            <div className="flex-grow-1">
                {researchProblems && researchProblems.length > 0 && (
                    <ul className="pl-3 pt-2">
                        {researchProblems.slice(0, 5).map(rp => (
                            <li key={`rp${rp.id}`}>
                                <Link to={reverseWithSlug(ROUTES.RESEARCH_PROBLEM, { researchProblemId: rp.id, slug: rp.label })}>
                                    {rp.researchProblem}{' '}
                                    <small>
                                        <Badge className="ml-1" color="info" pill>
                                            {rp.papersCount}
                                        </Badge>
                                    </small>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
                {researchProblems && researchProblems.length === 0 && <>No research problems.</>}
            </div>
            {researchProblems.length > 5 && (
                <div className="text-center">
                    <Button size="sm" onClick={() => null} color="light">
                        View more
                    </Button>
                </div>
            )}
        </div>
    );
};

ResearchProblemsBox.propTypes = {
    id: PropTypes.string.isRequired
};

export default ResearchProblemsBox;
