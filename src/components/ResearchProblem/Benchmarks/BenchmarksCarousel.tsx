import { faArrowCircleLeft, faArrowCircleRight, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon, FontAwesomeIconProps } from '@fortawesome/react-fontawesome';
import { DatasetRepresentation } from '@orkg/orkg-client';
import classNames from 'classnames';
import Link from 'next/link';

import StyledSlider from '@/components/ResearchProblem/Benchmarks/styled';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';

type SlickArrowProps = FontAwesomeIconProps & {
    currentSlide?: number;
    slideCount?: number;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const SlickArrow = ({ currentSlide, slideCount, ...rest }: SlickArrowProps) => <FontAwesomeIcon {...rest} />;

type BenchmarksCarouselProps = {
    problemId: string;
    benchmarks: DatasetRepresentation[];
    isLoading: boolean;
    hasNextPage: boolean;
    loadNextPage: () => void;
};

const SLIDES_TO_SHOW = 5;

const BenchmarksCarousel = ({ problemId, benchmarks, isLoading, hasNextPage, loadNextPage }: BenchmarksCarouselProps) => {
    const settings = {
        dots: false,
        infinite: false,
        speed: 500,
        slidesToShow: SLIDES_TO_SHOW,
        centerMode: false,
        slidesToScroll: SLIDES_TO_SHOW,
        nextArrow: !isLoading ? (
            <SlickArrow icon={faArrowCircleRight} style={{ width: 20, height: 20 }} />
        ) : (
            <SlickArrow icon={faSpinner} spin style={{ width: 20, height: 20 }} />
        ),
        prevArrow: <SlickArrow icon={faArrowCircleLeft} style={{ width: 20, height: 20 }} />,
        rows: 1,
        afterChange: (currentSlide: number) => {
            if (hasNextPage && !isLoading && currentSlide + SLIDES_TO_SHOW >= benchmarks.length) {
                loadNextPage();
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
                        'me-0': index === benchmarks.length - 1,
                    });
                    return (
                        <div key={benchmark.id} className={classNames('!flex group', marginClasses)}>
                            <Link
                                href={reverse(ROUTES.BENCHMARK, { datasetId: benchmark.id, problemId })}
                                className="flex box rounded m-2 p-4 grow no-underline flex-1"
                            >
                                <div className="flex flex-col">
                                    <div className="grow font-bold group-hover:underline">{benchmark.label}</div>

                                    <div className="text-left text-sm text-gray-500">
                                        Models: <b>{benchmark.totalModels}</b> <br />
                                        Papers: <b>{benchmark.totalPapers}</b> <br />
                                        Code: <b>{benchmark.totalCodes}</b>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    );
                })}
            </StyledSlider>
        </div>
    );
};

export default BenchmarksCarousel;
