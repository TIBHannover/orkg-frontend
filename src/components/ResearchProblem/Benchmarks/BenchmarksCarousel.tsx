import { faArrowCircleLeft, faArrowCircleRight, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon, FontAwesomeIconProps } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import Link from 'next/link';
import styled from 'styled-components';

import StyledSlider from '@/components/ResearchProblem/Benchmarks/styled';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';

type SlickArrowProps = FontAwesomeIconProps & {
    currentSlide?: number;
    slideCount?: number;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const SlickArrow = ({ currentSlide, slideCount, ...rest }: SlickArrowProps) => <FontAwesomeIcon {...rest} />;

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

type Benchmark = {
    id: string;
    label: string;
    total_models: number;
    total_papers: number;
    total_codes: number;
};

type BenchmarksCarouselProps = {
    problemId: string;
    benchmarks: Benchmark[];
    isLoading: boolean;
    isLastPageReached: boolean;
    hasNextPage: boolean;
    loadNextPage: () => void;
    handleKeyDown: () => void;
    page: number;
};

const BenchmarksCarousel = ({ problemId, benchmarks, isLoading, hasNextPage, loadNextPage, page }: BenchmarksCarouselProps) => {
    const settings = {
        dots: false,
        infinite: false,
        speed: 500,
        slidesToShow: 5,
        centerMode: false,
        slidesToScroll: 5,
        nextArrow: !isLoading ? <SlickArrow icon={faArrowCircleRight} /> : <SlickArrow icon={faSpinner} spin />,
        prevArrow: <SlickArrow icon={faArrowCircleLeft} />,
        rows: 1,
        lazyLoad: 'ondemand' as const,
        onLazyLoad: (slidesLoaded: number[]) => {
            if (hasNextPage) {
                loadNextPage();
            }
            if (page !== 0 && slidesLoaded && !hasNextPage) {
                // slidesLoaded();
            }
        },
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
                                href={reverse(ROUTES.BENCHMARK, { datasetId: benchmark.id, problemId })}
                                className="flex box rounded m-2 p-4 grow"
                                style={{ textDecoration: 'none', flex: 1 }}
                            >
                                <div className="flex flex-col">
                                    <div className="benchmarkName grow">{benchmark.label}</div>

                                    <div className="benchmarkStats text-gray-500">
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
};

export default BenchmarksCarousel;
