import { FC, useState } from 'react';
import ObservatoryItem from 'components/ObservatoriesCarousel/ObservatoryItem';
import { CarouselIndicatorsStyled } from 'components/styled';
import ContentLoader from 'react-content-loader';
import { Carousel } from 'reactstrap';
import styled from 'styled-components';
import { Observatory } from 'services/backend/types';

const CarouselContainer = styled.div`
    width: 100%;
    & .carousel-item.active {
        display: flex;
        flex-wrap: wrap;
        min-height: 100%;
    }

    & li {
        width: 10px !important;
        height: 10px !important;
        border-radius: 100% !important;
        background-color: ${props => props.theme.primary} !important;
    }
`;
type ObservatoriesCarouselProps = {
    isLoading: boolean;
    observatories: Observatory[];
};

const ObservatoriesCarousel: FC<ObservatoriesCarouselProps> = ({ isLoading, observatories }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [animating, setAnimating] = useState(false);

    const next = () => {
        if (animating) {
            return;
        }
        const nextIndex = activeIndex === observatories.length - 1 ? 0 : activeIndex + 1;
        setActiveIndex(nextIndex);
    };

    const previous = () => {
        if (animating) {
            return;
        }
        const nextIndex = activeIndex === 0 ? observatories.length - 1 : activeIndex - 1;
        setActiveIndex(nextIndex);
    };

    const goToIndex = (newIndex: number) => {
        setActiveIndex(newIndex);
    };

    return (
        <CarouselContainer className="flex-grow-1 d-flex">
            {!isLoading &&
                (observatories?.length ? (
                    <Carousel className="flex-grow-1 d-flex" activeIndex={activeIndex} next={next} previous={previous}>
                        {observatories.map((observatory, index) => (
                            <ObservatoryItem
                                key={observatory.id}
                                observatory={observatory}
                                onExiting={() => setAnimating(true)}
                                onExited={() => setAnimating(false)}
                                active={activeIndex === index}
                            />
                        ))}
                        <CarouselIndicatorsStyled items={observatories.slice(0, 15)} activeIndex={activeIndex} onClickHandler={goToIndex} />
                    </Carousel>
                ) : (
                    <div className="flex-grow-1 mt-4 text-center">
                        No observatories yet
                        <br />
                        <small>
                            <a href="https://orkg.org/about/27/Observatories" target="_blank" rel="noopener noreferrer">
                                How observatories are managed?
                            </a>
                        </small>
                    </div>
                ))}
            {isLoading && (
                <div style={{ height: '130px' }} className="pt-4 pb-1 ps-4 pe-4">
                    <ContentLoader width={300} height={50} viewBox="0 0 300 50" speed={2} backgroundColor="#f3f3f3" foregroundColor="#ecebeb">
                        <rect x="1" y="0" rx="4" ry="4" width="300" height="20" />
                        <rect x="1" y="25" rx="3" ry="3" width="250" height="20" />
                    </ContentLoader>
                </div>
            )}
        </CarouselContainer>
    );
};

export default ObservatoriesCarousel;
