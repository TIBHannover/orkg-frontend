import { Card, CardBody } from 'reactstrap';
import { Link } from 'react-router-dom';
import ROUTES from 'constants/routes';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { reverseWithSlug } from 'utils';

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
        <BenchmarkCardStyled className="col-3 mb-4">
            <Card className="h-100">
                <Link
                    to={reverseWithSlug(ROUTES.RESEARCH_PROBLEM, {
                        researchProblemId: props.benchmark.research_problem.id,
                        slug: props.benchmark.research_problem.label
                    })}
                    style={{ textDecoration: 'none' }}
                >
                    <CardBody>
                        <div className="mt-2">
                            <div className="researchProblemName">{props.benchmark.research_problem.label}</div>

                            <div className="researchProblemStats text-muted">
                                Papers: <b>{props?.benchmark.total_papers}</b> <br />
                                Datasets: <b>{props?.benchmark.total_datasets}</b> <br />
                                Code: <b>{props?.benchmark.total_codes}</b>
                            </div>
                        </div>
                    </CardBody>
                </Link>
            </Card>
        </BenchmarkCardStyled>
    );
}

BenchmarkCard.propTypes = {
    benchmark: PropTypes.object.isRequired
};

export default BenchmarkCard;
