import { useEffect, useState } from 'react';
import { Card, CardBody, CardSubtitle, CardTitle, Carousel, CarouselItem } from 'reactstrap';
import { getNewsCards } from 'services/cms';
import { CarouselIndicatorsStyled } from 'components/styled';
import styled from 'styled-components';
import * as Showdown from 'showdown';

const CarouselContainer = styled.div`
    width: 100%;

    & li {
        width: 10px !important;
        height: 10px !important;
        border-radius: 100% !important;
        background-color: ${props => props.theme.primary} !important;
    }
`;

const converter = new Showdown.Converter();
converter.setFlavor('github');

export default function News() {
    const [activeIndex, setActiveIndex] = useState(0);
    const [animating, setAnimating] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [items, setItems] = useState([]);

    useEffect(() => {
        const loadNews = async () => {
            setIsLoading(true);
            setItems(await getNewsCards({ limit: 8, sort: 'created_at:DESC' }));
            setIsLoading(false);
        };
        loadNews();
    }, []);

    const next = () => {
        if (animating) {
            return;
        }
        const nextIndex = activeIndex === items.length - 1 ? 0 : activeIndex + 1;
        setActiveIndex(nextIndex);
    };

    const previous = () => {
        if (animating) {
            return;
        }
        const nextIndex = activeIndex === 0 ? items.length - 1 : activeIndex - 1;
        setActiveIndex(nextIndex);
    };

    const goToIndex = newIndex => {
        setActiveIndex(newIndex);
    };

    return (
        <>
            <div className="d-flex align-items-center pt-3 ps-3 pe-3 pb-0">
                <div className="flex-grow-1">
                    <h2 className="h6 mb-1 mt-0">Latest news</h2>
                </div>
            </div>

            <hr className="mx-3 mt-1" />

            <CarouselContainer>
                {!isLoading && items.length === 0 && <div className="text-center mt-3 mb-4">No news messages found</div>}
                {isLoading && <div className="text-center mt-3 mb-4">Loading...</div>}
                {items?.length > 0 && (
                    <Carousel activeIndex={activeIndex} next={next} previous={previous}>
                        {items.map((item, index) => (
                            <CarouselItem onExiting={() => setAnimating(true)} onExited={() => setAnimating(false)} className="pb-1 mb-4" key={index}>
                                <Card style={{ border: 0, minHeight: 150 }}>
                                    <CardBody className="pt-0 mb-0 d-flex justify-content-center flex-column">
                                        <CardTitle tag="h5" className="pt-0 d-flex">
                                            {item.title}
                                        </CardTitle>
                                        <CardSubtitle
                                            tag="h6"
                                            className="mb-1 text-muted"
                                            dangerouslySetInnerHTML={{ __html: converter.makeHtml(item.message) }}
                                        />
                                    </CardBody>
                                </Card>
                            </CarouselItem>
                        ))}
                        <CarouselIndicatorsStyled items={items} activeIndex={activeIndex} onClickHandler={goToIndex} />
                    </Carousel>
                )}
            </CarouselContainer>
        </>
    );
}
