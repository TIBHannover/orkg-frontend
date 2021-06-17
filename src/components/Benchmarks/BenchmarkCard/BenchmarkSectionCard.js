import { Card, CardBody } from 'reactstrap';
import { Link } from 'react-router-dom';
//in the ROUTES javascript we add a path to a new page called Datasets
//see section III in https://gitlab.com/TIBHannover/orkg/orkg-backend/-/issues/263
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const BenchmarkSectionCardStyled = styled.div`
    cursor: initial;
    .benchmarkStats {
        text-align: left;
        font-size: smaller;
    }

    .dataLogo {
        margin-top: 10px;
        border: 1px;
        padding: 2px;
    }

    .benchmarkName {
        font-weight: bold;
    }
    &:hover {
        .benchmarkName {
            text-decoration: underline;
        }
    }
`;

function BenchmarkSectionCard(props) {
    return (
        <BenchmarkSectionCardStyled className="col-2">
            {!props.research_problem_benchmark.logo && (
                <Card>
                    <Link to={reverse(ROUTES.BENCHMARK, { resourceId: props.research_problem_benchmark.id })} style={{ textDecoration: 'none' }}>
                        <CardBody>
                            <div>
                                {/*<div className="benchmarkName">{props.research_problem_benchmark.label}</div>*/}
                                <div className="benchmarkName">{props.research_problem_benchmark.name}</div>

                                <div className="benchmarkStats text-muted">
                                    {/*Models: <b>{props.research_problem_benchmark.total_models}</b> <br />
                                    Papers: <b>{props.research_problem_benchmark.total_papers}</b> <br />
                                    Code: <b>{props.research_problem_benchmark.total_codes}</b> */}
                                    Models: <b>{props.research_problem_benchmark.numModels}</b> <br />
                                    Papers: <b>{props.research_problem_benchmark.numPapers}</b> <br />
                                    Code: <b>{props.research_problem_benchmark.numCode}</b>
                                </div>
                            </div>
                        </CardBody>
                    </Link>
                </Card>
            )}
        </BenchmarkSectionCardStyled>
    );
}

BenchmarkSectionCard.propTypes = {
    research_problem_benchmark: PropTypes.object.isRequired
};

export default BenchmarkSectionCard;
