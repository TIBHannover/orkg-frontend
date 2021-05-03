import { Card, CardBody } from 'reactstrap';
import { Link } from 'react-router-dom';
import ROUTES from 'constants/routes';
import styled from 'styled-components';
import { reverse } from 'named-urls';
import { faArrowCircleLeft, faArrowCircleRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';

import { StyledSlider } from './styled';

const BenchmarkCarouselCardStyled = styled.div`
    padding: 0 10px;
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
    const { benchmarks } = props;
    const settings = {
        dots: false,
        infinite: false,
        speed: 500,
        slidesToShow: 5,
        slidesToScroll: 1,
        nextArrow: <Icon icon={faArrowCircleRight} />,
        prevArrow: <Icon icon={faArrowCircleLeft} />,
        rows: 1
    };

    return (
        <div className="carousel-container">
            <StyledSlider {...settings}>
                {benchmarks.map(benchmark => (
                    <BenchmarkCarouselCardStyled key={benchmark.id}>
                        <Card>
                            <Link to={reverse(ROUTES.BENCHMARK, { resourceId: benchmark.id })} style={{ textDecoration: 'none' }}>
                                <CardBody>
                                    <div>
                                        <div className="benchmarkName">{benchmark.label}</div>

                                        <div className="benchmarkStats text-muted">
                                            Models: <b>{benchmark.total_models}</b> <br />
                                            Papers: <b>{benchmark.total_papers}</b> <br />
                                            Code: <b>{benchmark.total_codes}</b>
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
    benchmarks: PropTypes.array.isRequired
};

export default BenchmarksCarousel;
