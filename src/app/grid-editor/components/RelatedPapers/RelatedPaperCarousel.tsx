import { faExternalLinkAlt, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Card } from '@heroui/react';
import React, { useState } from 'react';
import { Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import useSWR from 'swr';

import RelatedPaperModal from '@/app/grid-editor/components/RelatedPapers/RelatedPaperModal';
import { getSimilarPapers, GetSimilarPapersParams, similarPaperURL } from '@/services/orkgSimpaper';
import { SimilarPaper } from '@/services/orkgSimpaper/types';

type RelatedPapersCarouselProps = {
    contributionIds: string[];
    handleAddContributions: (title: string) => void;
};

const RelatedPapersCarousel: React.FC<RelatedPapersCarouselProps> = ({ handleAddContributions, contributionIds }) => {
    const [isOpenRelatedPaperModal, setIsOpenRelatedPaperModal] = useState(false);
    const [currentSimilarPaper, setCurrentSimilarPaper] = useState<SimilarPaper>();

    const params: GetSimilarPapersParams = {
        contributionIds,
        mode: 'DYNAMIC',
    };

    const { data: similarPaperList, isLoading } = useSWR([params, similarPaperURL, 'getSimilarPapers'], ([_params]) => getSimilarPapers(_params));

    if (isLoading || !similarPaperList || similarPaperList.length === 0) {
        return null;
    }

    return (
        <section className="py-4 mb-12">
            <header className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-4 mt-6">
                <h5 className="m-0">Add related papers</h5>
                <span className="text-sm text-muted">
                    Search supported by{' '}
                    <a href="https://www.semanticscholar.org/" target="_blank" rel="noreferrer" className="font-medium">
                        Semantic Scholar
                    </a>
                </span>
            </header>

            <Swiper
                slidesPerView={1}
                spaceBetween={16}
                breakpoints={{
                    640: { slidesPerView: 2 },
                    1024: { slidesPerView: 3 },
                }}
                pagination={{ clickable: true }}
                navigation
                modules={[Pagination, Navigation]}
                className="orkgSwiper"
            >
                {similarPaperList.map((paper) => (
                    <SwiperSlide className="pb-10 h-auto" key={paper?.title}>
                        <Card className="h-full min-h-[180px] flex flex-col gap-2 bg-smart text-white border-0">
                            <Card.Header className="gap-1">
                                <Card.Title className="text-sm font-semibold leading-snug line-clamp-2 text-white pr-2">{paper?.title}</Card.Title>
                            </Card.Header>
                            {paper?.abstract && (
                                <Card.Content className="flex-1">
                                    <p className="text-xs leading-relaxed line-clamp-3 text-white/85">{paper.abstract}</p>
                                </Card.Content>
                            )}
                            <Card.Footer className="mt-auto flex items-center justify-between gap-2">
                                {paper?.abstract ? (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="!bg-transparent !p-0 h-auto min-h-0 text-white/90 hover:text-white no-underline"
                                        onPress={() => {
                                            setCurrentSimilarPaper(paper);
                                            setIsOpenRelatedPaperModal(true);
                                        }}
                                    >
                                        <FontAwesomeIcon icon={faExternalLinkAlt} className="text-xs" />
                                        Read more
                                    </Button>
                                ) : (
                                    <span />
                                )}
                                <Button
                                    size="sm"
                                    className="!bg-smart-darker text-white hover:!brightness-110"
                                    onPress={() => {
                                        setCurrentSimilarPaper(paper);
                                        handleAddContributions(paper.title);
                                    }}
                                >
                                    <FontAwesomeIcon icon={faPlus} />
                                    Add
                                </Button>
                            </Card.Footer>
                        </Card>
                    </SwiperSlide>
                ))}
            </Swiper>

            {isOpenRelatedPaperModal && (
                <RelatedPaperModal
                    paper={currentSimilarPaper}
                    isOpen={isOpenRelatedPaperModal}
                    toggle={() => setIsOpenRelatedPaperModal((v) => !v)}
                />
            )}
        </section>
    );
};

export default RelatedPapersCarousel;
