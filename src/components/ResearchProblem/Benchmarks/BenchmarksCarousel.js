import { Link } from 'react-router-dom';
import ROUTES from 'constants/routes';
import styled from 'styled-components';
import { reverse } from 'named-urls';
import { faArrowCircleLeft, faArrowCircleRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { StyledSlider } from './styled';

const BenchmarkCarouselCardStyled = styled.div`
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
                    slidesToScroll: 3,
                },
            },
            {
                breakpoint: 600,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 2,
                },
            },
            {
                breakpoint: 480,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                },
            },
        ],
    };

    return (
        <div style={{ margin: -7 }}>
            <StyledSlider {...settings}>
                {benchmarks.map((benchmark, index) => {
                    const marginClasses = classNames({
                        'ms-0': index === 0,
                        'me-0': index === benchmarks.length,
                    });
                    return (
                        <BenchmarkCarouselCardStyled key={benchmark.id} className={marginClasses}>
                            <Link
                                to={reverse(ROUTES.BENCHMARK, { datasetId: benchmark.id, problemId: props.problemId })}
                                className="d-flex box rounded m-2 p-3 flex-grow-1"
                                style={{ textDecoration: 'none', flex: 1 }}
                            >
                                <div className="d-flex flex-column">
                                    <div className="benchmarkName flex-grow-1">{benchmark.label}</div>

                                    <div className="benchmarkStats text-muted">
                                        Models: <b>{benchmark.total_models}</b> <br />
                                        Papers: <b>{benchmark.total_papers}</b> <br />
                                        Code: <b>{benchmark.total_codes}</b>
                                    </div>
                                </div>
                            </Link>
                        </BenchmarkCarouselCardStyled>
                    );
                })}
            </StyledSlider>
        </div>
    );
}

BenchmarksCarousel.propTypes = {
    problemId: PropTypes.string.isRequired,
    benchmarks: PropTypes.array.isRequired,
};

export default BenchmarksCarousel;
