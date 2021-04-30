import { Card, CardBody } from 'reactstrap';
import { Link } from 'react-router-dom';
import ROUTES from 'constants/routes';
import styled from 'styled-components';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';

import { StyledSlider } from './styled';

const BenchmarkCarouselCardStyled = styled.div`
    .benchmarkStats {
        text-align: left;
        font-size: smaller;
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

function BenchmarksCarousel(props) {
    const { research_problem_benchmarks } = props;
    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 5,
        slidesToScroll: 1
    };

    return (
        <div className="carousel-container">
            <StyledSlider {...settings}>
                {research_problem_benchmarks.map(research_problem_benchmark => (
                    <BenchmarkCarouselCardStyled key={research_problem_benchmark.id}>
                        <Card>
                            <Link to={reverse(ROUTES.BENCHMARK, { resourceId: research_problem_benchmark.id })} style={{ textDecoration: 'none' }}>
                                <CardBody>
                                    <div>
                                        <div className="benchmarkName">{research_problem_benchmark.label}</div>

                                        <div className="benchmarkStats text-muted">
                                            Models: <b>{research_problem_benchmark.total_models}</b> <br />
                                            Papers: <b>{research_problem_benchmark.total_papers}</b> <br />
                                            Code: <b>{research_problem_benchmark.total_codes}</b>
                                        </div>
                                    </div>
                                </CardBody>
                            </Link>
                        </Card>
                    </BenchmarkCarouselCardStyled>
                ))}
            </StyledSlider>
        </div>
    );
}

BenchmarksCarousel.propTypes = {
    research_problem_benchmarks: PropTypes.array.isRequired
};

export default BenchmarksCarousel;
