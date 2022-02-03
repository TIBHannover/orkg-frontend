import { Card, CardBody } from 'reactstrap';
import { Link } from 'react-router-dom';
import ROUTES from 'constants/routes';
import styled from 'styled-components';
import { reverse } from 'named-urls';
import { faArrowCircleLeft, faArrowCircleRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import { StyledSlider } from './styled';
import PropTypes from 'prop-types';

const BenchmarkCarouselCardStyled = styled.div`
    margin: 0 10px;
    display: flex !important;

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
        centerMode: false,
        slidesToScroll: 1,
        nextArrow: <Icon icon={faArrowCircleRight} />,
        prevArrow: <Icon icon={faArrowCircleLeft} />,
        rows: 1,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 3
                }
            },
            {
                breakpoint: 600,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 2
                }
            },
            {
                breakpoint: 480,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1
                }
            }
        ]
    };

    return (
        <div>
            <StyledSlider {...settings}>
                {benchmarks.map((benchmark, index) => {
                    const marginClasses = classNames({
                        'ms-0': index === 0,
                        'me-0': index === benchmarks.length
                    });
                    return (
                        <BenchmarkCarouselCardStyled key={benchmark.id} className={marginClasses}>
                            <Card className="flex-grow-1">
                                <Link
                                    to={reverse(ROUTES.BENCHMARK, { datasetId: benchmark.id, problemId: props.problemId })}
                                    className="d-flex"
                                    style={{ textDecoration: 'none', flex: 1 }}
                                >
                                    <CardBody className="d-flex flex-column">
                                        <div className="benchmarkName flex-grow-1">{benchmark.label}</div>

                                        <div className="benchmarkStats text-muted">
                                            Models: <b>{benchmark.total_models}</b> <br />
                                            Papers: <b>{benchmark.total_papers}</b> <br />
                                            Code: <b>{benchmark.total_codes}</b>
                                        </div>
                                    </CardBody>
                                </Link>
                            </Card>
                        </BenchmarkCarouselCardStyled>
                    );
                })}
            </StyledSlider>
        </div>
    );
}

BenchmarksCarousel.propTypes = {
    problemId: PropTypes.string.isRequired,
    benchmarks: PropTypes.array.isRequired
};

export default BenchmarksCarousel;
