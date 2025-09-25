import React, { useState } from 'react';
import { Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import useSWR from 'swr';

import RelatedPaperModal from '@/app/grid-editor/components/RelatedPapers/RelatedPaperModal';
import Button from '@/components/Ui/Button/Button';
import Card from '@/components/Ui/Card/Card';
import CardBody from '@/components/Ui/Card/CardBody';
import CardText from '@/components/Ui/Card/CardText';
import CardTitle from '@/components/Ui/Card/CardTitle';
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
        <div className="py-3 mb-5">
            <div className="d-flex mb-3 mt-4">
                <h5 className="m-0">Add related papers</h5>
                <div className="ms-2">
                    | Search supported by{' '}
                    <a href="https://www.semanticscholar.org/" target="_blank" rel="noreferrer">
                        Semantic Scholar
                    </a>
                </div>
            </div>

            <div>
                <Swiper
                    slidesPerView={3}
                    pagination={{
                        clickable: true,
                    }}
                    navigation
                    modules={[Pagination, Navigation]}
                    className="orkgSwiper"
                >
                    {similarPaperList.map((paper) => (
                        <SwiperSlide className="pb-4" key={paper?.title} style={{ width: '33%' }}>
                            <Card>
                                <CardBody
                                    className="bg-smart"
                                    style={{
                                        height: '150px',
                                        borderRadius: '5px',
                                        padding: '5px 10px',
                                        color: 'white',
                                    }}
                                >
                                    <CardTitle>
                                        <div className="p-1 d-flex justify-content-between flex-row">
                                            <div
                                                style={{
                                                    WebkitLineClamp: 2,
                                                    overflow: 'hidden',
                                                    display: '-webkit-box',
                                                    WebkitBoxOrient: 'vertical',
                                                }}
                                            >
                                                {paper?.title}
                                            </div>
                                            <div>
                                                <Button
                                                    color="smart-darker"
                                                    size="sm"
                                                    className="float-right"
                                                    onClick={() => {
                                                        setCurrentSimilarPaper(paper);
                                                        handleAddContributions(paper.title);
                                                    }}
                                                >
                                                    Add
                                                </Button>
                                            </div>
                                        </div>
                                    </CardTitle>
                                    <CardText className="text-break">
                                        {paper?.abstract && (
                                            <div>
                                                <div
                                                    className="text-break"
                                                    style={{
                                                        WebkitLineClamp: 2,
                                                        overflow: 'hidden',
                                                        display: '-webkit-box',
                                                        WebkitBoxOrient: 'vertical',
                                                    }}
                                                >
                                                    {paper?.abstract}
                                                </div>
                                                <Button
                                                    color="link"
                                                    className="p-0 text-white"
                                                    onClick={() => {
                                                        setCurrentSimilarPaper(paper);
                                                        setIsOpenRelatedPaperModal(true);
                                                    }}
                                                >
                                                    Read more
                                                </Button>
                                            </div>
                                        )}
                                    </CardText>
                                </CardBody>
                            </Card>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
            {isOpenRelatedPaperModal && (
                <RelatedPaperModal
                    paper={currentSimilarPaper}
                    isOpen={isOpenRelatedPaperModal}
                    toggle={() => setIsOpenRelatedPaperModal((v) => !v)}
                />
            )}
        </div>
    );
};

export default RelatedPapersCarousel;
