import { Card, CardBody } from 'reactstrap';
import { Link } from 'react-router-dom';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const BenchmarkCardStyled = styled.div`
    cursor: initial;
    .researchProblemStats {
        text-align: left;
        font-size: smaller;
    }

    .orgLogo {
        margin-top: 10px;
        border: 1px;
        padding: 2px;
    }

    .researchProblemName {
        font-weight: bold;
    }
    &:hover {
        .researchProblemName {
            text-decoration: underline;
        }
    }
`;

function BenchmarkCard(props) {
    return (
        <BenchmarkCardStyled className="col-4 mb-4">
            {!props.research_problem_benchmark.logo && (
                <Card className="h-100">
                    <Link
                        //to={reverse(ROUTES.RESEARCH_PROBLEM, { researchProblemId: props.research_problem_benchmark[research_problem].id })}
                        to={reverse(ROUTES.RESEARCH_PROBLEM, { researchProblemId: props.research_problem_benchmark.id })}
                        style={{ textDecoration: 'none' }}
                    >
                        <CardBody>
                            <div className="mt-2">
                                {/* <div className="researchProblemName">{props.research_problem_benchmark[research_problem].label}</div> */}
                                <div className="researchProblemName">{props.research_problem_benchmark.name}</div>

                                <div className="researchProblemStats text-muted">
                                    {/*Papers: <b>{props.research_problem_benchmark.total_papers}</b> <br />
                                    Datasets: <b>{props.research_problem_benchmark.total_datasets}</b> <br />
                                    Code: <b>{props.research_problem_benchmark.total_codes}</b>*/}
                                    Papers: <b>{props.research_problem_benchmark.numPapers}</b> <br />
                                    Datasets: <b>{props.research_problem_benchmark.numDatasets}</b> <br />
                                    Code: <b>{props.research_problem_benchmark.numCode}</b>
                                </div>
                            </div>
                        </CardBody>
                    </Link>
                </Card>
            )}
        </BenchmarkCardStyled>
    );
}

BenchmarkCard.propTypes = {
    research_problem_benchmark: PropTypes.object.isRequired
};

export default BenchmarkCard;
