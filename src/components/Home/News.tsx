import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import Showdown from 'showdown';
import styled from 'styled-components';
import { EffectFade, Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import Card from '@/components/Ui/Card/Card';
import CardBody from '@/components/Ui/Card/CardBody';
import CardSubtitle from '@/components/Ui/Card/CardSubtitle';
import CardTitle from '@/components/Ui/Card/CardTitle';
import { getNewsCards } from '@/services/cms';
import { NewsCard } from '@/services/cms/types';

const CarouselContainer = styled.div`
    width: 100%;

    & li {
        width: 10px !important;
        height: 10px !important;
        border-radius: 100% !important;
        background-color: ${(props) => props.theme.primary} !important;
    }
`;

const converter = new Showdown.Converter();
converter.setFlavor('github');

export default function News() {
    const [isLoading, setIsLoading] = useState(false);
    const [items, setItems] = useState<NewsCard[]>([]);

    useEffect(() => {
        const loadNews = async () => {
            setIsLoading(true);
            setItems((await getNewsCards({ limit: 8, sort: 'createdAt:desc' }))?.data || []);
            setIsLoading(false);
        };
        loadNews();
    }, []);

    return !isLoading && dayjs(items?.[0]?.attributes?.publishedAt) > dayjs().subtract(2, 'month') ? (
        <div className="mt-3 box rounded d-flex flex-column overflow-hidden">
            <div className="d-flex align-items-center pt-3 ps-3 pe-3 pb-0">
                <div className="flex-grow-1">
                    <h2 className="h5 mb-1 mt-0">Latest news</h2>
                </div>
            </div>

            <hr className="mx-3 mt-1" />

            <CarouselContainer>
                {items.length === 0 && <div className="text-center mt-3 mb-4">No news messages found</div>}
                {items?.length > 0 && (
                    <Swiper
                        spaceBetween={30}
                        speed={1000}
                        centeredSlides
                        effect="fade"
                        pagination={{
                            clickable: true,
                        }}
                        navigation
                        modules={[EffectFade, Pagination, Navigation]}
                        className="orkgSwiper"
                    >
                        {items.map((item) => (
                            <SwiperSlide key={`news-${item.id}`} className="px-3 mb-3">
                                <Card style={{ border: 0, minHeight: 150 }}>
                                    <CardBody className="pt-0 mb-0 d-flex justify-content-center flex-column">
                                        <CardTitle tag="h5" className="pt-0 d-flex">
                                            {item.attributes?.title}
                                        </CardTitle>
                                        <CardSubtitle
                                            tag="h6"
                                            className="mb-1 text-muted"
                                            dangerouslySetInnerHTML={{ __html: converter.makeHtml(item.attributes?.message) }}
                                        />
                                    </CardBody>
                                </Card>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                )}
            </CarouselContainer>
        </div>
    ) : null;
}
