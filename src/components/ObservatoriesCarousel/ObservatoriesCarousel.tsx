import { Skeleton } from '@heroui/react';
import { FC } from 'react';
import { Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import ObservatoryItem from '@/components/ObservatoriesCarousel/ObservatoryItem';
import { Observatory } from '@/services/backend/types';

type ObservatoriesCarouselProps = {
    isLoading: boolean;
    observatories: Observatory[];
};

const ObservatoriesCarousel: FC<ObservatoriesCarouselProps> = ({ isLoading, observatories }) => {
    return (
        <div>
            {!isLoading &&
                (observatories?.length ? (
                    <Swiper
                        pagination={{
                            dynamicBullets: true,
                        }}
                        navigation
                        modules={[Pagination, Navigation]}
                        className="orkgSwiper"
                    >
                        {observatories.map((observatory) => (
                            <SwiperSlide key={`observatory-${observatory.id}`} className="px-6">
                                <ObservatoryItem observatory={observatory} />
                            </SwiperSlide>
                        ))}
                    </Swiper>
                ) : (
                    <div className="grow mt-6 text-center">
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
                <div style={{ height: '130px' }} className="pt-6 pb-1 pl-6 pr-6 flex flex-col gap-2">
                    <Skeleton className="w-full h-5 rounded" />
                    <Skeleton className="w-5/6 h-5 rounded" />
                </div>
            )}
        </div>
    );
};

export default ObservatoriesCarousel;
