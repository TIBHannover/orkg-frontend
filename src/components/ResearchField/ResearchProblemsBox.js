import { Badge } from 'reactstrap';
import { SmallButton } from 'components/styled';
import ROUTES from 'constants/routes.js';
import { Link } from 'react-router-dom';
import useResearchFieldProblems from 'components/ResearchField/hooks/useResearchFieldProblems';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';

const ResearchProblemsBox = ({ id }) => {
    const [researchProblems] = useResearchFieldProblems();

    return (
        <div className="box rounded-lg p-3 flex-grow-1 d-flex flex-column">
            <h5>Research problems</h5>
            <div className="flex-grow-1">
                {researchProblems && researchProblems.length > 0 && (
                    <ul className="pl-3 pt-2">
                        {researchProblems.slice(0, 5).map(rp => (
                            <li key={`rp${rp.problem.id}`}>
                                <Link to={reverse(ROUTES.RESEARCH_PROBLEM, { researchProblemId: rp.problem.id })}>
                                    {rp.problem.label}{' '}
                                    <small>
                                        <Badge className="ml-1" color="info" pill>
                                            {rp.papers}
                                        </Badge>
                                    </small>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            {researchProblems.length > 5 && (
                <div className="text-center">
                    <SmallButton onClick={() => null} color="lightblue">
                        View more
                    </SmallButton>
                </div>
            )}
            {researchProblems && researchProblems.length === 0 && <>No research problems.</>}
        </div>
    );
};

ResearchProblemsBox.propTypes = {
    id: PropTypes.string.isRequired
};

export default ResearchProblemsBox;
