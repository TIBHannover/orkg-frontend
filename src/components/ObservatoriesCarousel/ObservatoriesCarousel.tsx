import { FC } from 'react';
import { Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import ContentLoader from '@/components/ContentLoader/ContentLoader';
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
                            <SwiperSlide key={`observatory-${observatory.id}`} className="px-4">
                                <ObservatoryItem observatory={observatory} />
                            </SwiperSlide>
                        ))}
                    </Swiper>
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
                    <ContentLoader width={300} height={50} viewBox="0 0 300 50" speed={2}>
                        <rect x="1" y="0" rx="4" ry="4" width="300" height="20" />
                        <rect x="1" y="25" rx="3" ry="3" width="250" height="20" />
                    </ContentLoader>
                </div>
            )}
        </div>
    );
};

export default ObservatoriesCarousel;
