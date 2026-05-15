import { Card } from '@heroui/react';
import { EffectFade, Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import useSWR from 'swr';

import { parseMarkdown } from '@/lib/markdown';
import { getNewsCards, url as cmsUrl } from '@/services/cms';

export default function News() {
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setDate(twoMonthsAgo.getDate() - 60);

    const { data: _items, isLoading } = useSWR([cmsUrl, 'getNewsCards'], ([_]) =>
        getNewsCards({
            limit: 8,
            sort: 'createdAt:desc',
            filters: {
                publishedAt: {
                    $gte: twoMonthsAgo.toISOString(),
                },
            },
        }),
    );

    const items = _items?.data ?? [];

    if (isLoading || !items || items.length === 0) {
        return null;
    }

    return (
        <div className="mt-4 box rounded flex flex-col overflow-hidden">
            <div className="flex items-center pt-4 pl-4 pr-4 pb-0">
                <div className="grow">
                    <h2 className="text-xl mb-1 mt-0">Latest news</h2>
                </div>
            </div>

            <hr className="mx-4 mt-1" />

            <div className="w-full">
                {items.length === 0 && <div className="text-center mt-4 mb-6">No news messages found</div>}
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
                        className="orkgSwiper w-full"
                    >
                        {items.map((item) => (
                            <SwiperSlide key={`news-${item.id}`} className="px-4 mb-4">
                                <Card className="min-h-[150px]">
                                    <Card.Header>
                                        <Card.Title>{item.attributes?.title}</Card.Title>
                                    </Card.Header>
                                    <Card.Content>
                                        <div
                                            className="prose mb-1 text-gray-500"
                                            dangerouslySetInnerHTML={{ __html: parseMarkdown(item.attributes?.message ?? '') }}
                                        />
                                    </Card.Content>
                                </Card>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                )}
            </div>
        </div>
    );
}
