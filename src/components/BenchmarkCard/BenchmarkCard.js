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
        <BenchmarkCardStyled className="col-3 mb-4">
            <Card className="h-100">
                <Link to={reverse(ROUTES.RESEARCH_PROBLEM, { researchProblemId: props.benchmark.id })} style={{ textDecoration: 'none' }}>
                    <CardBody>
                        <div className="mt-2">
                            <div className="researchProblemName">{props.benchmark.label}</div>

                            <div className="researchProblemStats text-muted">
                                Papers: <b>{props?.benchmark.numPapers}</b> <br />
                                Datasets: <b>{props?.benchmark.numDatasets}</b> <br />
                                Code: <b>{props?.benchmark.numCode}</b>
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
