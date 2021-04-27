//Adapted from https://github.com/rakumairu/simple-react-carousel/blob/part-3/src/components/Carousel/Carousel.js
import { useEffect, useState } from 'react';
import { Card, CardBody } from 'reactstrap';
import { Link } from 'react-router-dom';
import ROUTES from 'constants/routes';
import styled from 'styled-components';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';
import './benchmarkscarousel.css';

const BenchmarkCarouselCardStyled = styled.div`
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

function BenchmarksCarousel(props) {
    const { research_problem_benchmarks, show } = props;

    const [currentIndex, setCurrentIndex] = useState(0);
    const [length, setLength] = useState(research_problem_benchmarks.length);

    const [touchPosition, setTouchPosition] = useState(null);

    // Set the length to match current children from props
    useEffect(() => {
        setLength(research_problem_benchmarks.length);
    }, [research_problem_benchmarks]);

    const next = () => {
        if (currentIndex < length - show) {
            setCurrentIndex(prevState => prevState + 1);
        }
    };

    const prev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prevState => prevState - 1);
        }
    };

    const handleTouchStart = e => {
        const touchDown = e.touches[0].clientX;
        setTouchPosition(touchDown);
    };

    const handleTouchMove = e => {
        const touchDown = touchPosition;

        if (touchDown === null) {
            return;
        }

        const currentTouch = e.touches[0].clientX;
        const diff = touchDown - currentTouch;

        if (diff > 5) {
            next();
        }

        if (diff < -5) {
            prev();
        }

        setTouchPosition(null);
    };

    return (
        <div className="carousel-container">
            <div className="carousel-wrapper">
                {/* You can alwas change the content of the button to other things */}
                {currentIndex > 0 && (
                    <button onClick={prev} className="left-arrow">
                        &lt;
                    </button>
                )}
                <div className="carousel-content-wrapper" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove}>
                    <div className={`carousel-content show-${show}`} style={{ transform: `translateX(-${currentIndex * (100 / show)}%)` }}>
                        {research_problem_benchmarks.map(research_problem_benchmark => (
                            <BenchmarkCarouselCardStyled className="col-2">
                                <Card>
                                    <Link
                                        to={reverse(ROUTES.BENCHMARK, { resourceId: research_problem_benchmark.id })}
                                        style={{ textDecoration: 'none' }}
                                    >
                                        <CardBody>
                                            <div>
                                                <div className="benchmarkName">{research_problem_benchmark.label}</div>

                                                <div className="benchmarkStats text-muted">
                                                    {/*Models: <b>{props.research_problem_benchmark.total_models}</b> <br />
                                                    Papers: <b>{props.research_problem_benchmark.total_papers}</b> <br />
                                                    Code: <b>{props.research_problem_benchmark.total_codes}</b> */}
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
                    </div>
                </div>
                {/* You can alwas change the content of the button to other things */}
                {currentIndex < length - show && (
                    <button onClick={next} className="right-arrow">
                        &gt;
                    </button>
                )}
            </div>
        </div>
    );
}

BenchmarksCarousel.propTypes = {
    show: PropTypes.number.isRequired,
    research_problem_benchmarks: PropTypes.object.isRequired
};

export default BenchmarksCarousel;
