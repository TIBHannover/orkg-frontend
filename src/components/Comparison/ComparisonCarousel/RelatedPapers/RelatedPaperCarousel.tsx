import { faArrowCircleLeft, faArrowCircleRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import AddContribution from 'components/Comparison/AddContribution/AddContribution';
import RelatedPaperModal from 'components/Comparison/ComparisonCarousel/RelatedPapers/RelatedPaperModal';
import AddPaperModal from 'components/PaperForm/AddPaperModal';
import StyledSlider from 'components/ResearchProblem/Benchmarks/styled';
import { isArray } from 'lodash';
import React, { useState } from 'react';
import { Button, Card, CardBody, CardText, CardTitle } from 'reactstrap';
import { GetSimilarPapersParams, getSimilarPapers, similarPaperURL } from 'services/orkgSimpaper';
import { SimilarPaper } from 'services/orkgSimpaper/types';
import useSWR from 'swr';

interface RelatedPapersCarouselProps {
    contributionIds: string[];
    handleAddContributions: (ids: string[]) => void;
}

const RelatedPapersCarousel: React.FC<RelatedPapersCarouselProps> = ({ handleAddContributions, contributionIds }) => {
    const [isOpenCreatePaper, setIsOpenCreatePaper] = useState(false);
    const [initialValueCreatePaper, setInitialValueCreatePaper] = useState<string | null>(null);
    const [isOpenAddContribution, setIsOpenAddContribution] = useState(false);
    const [isOpenRelatedPaperModal, setIsOpenRelatedPaperModal] = useState(false);
    const [currentSimilarPaper, setCurrentSimilarPaper] = useState<SimilarPaper>();

    const settings = {
        dots: false,
        infinite: false,
        speed: 500,
        slidesToShow: 3,
        centerMode: false,
        slidesToScroll: 5,
        nextArrow: <Icon icon={faArrowCircleRight} />,
        prevArrow: <Icon icon={faArrowCircleLeft} />,
        rows: 1,
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

    const handleCreatePaper = (ids: string[] | { contributionId: string }) => {
        handleAddContributions(isArray(ids) ? ids : [ids.contributionId]);
        setIsOpenCreatePaper(false);
    };

    /**
     * Add contributions
     *
     * @param {Array[String]} newContributionIds Contribution ids to add
     */
    const addContributions = (newContributionIds: string[]) => {
        handleCreatePaper(newContributionIds);
    };

    const params: GetSimilarPapersParams = {
        contributionIds,
        mode: 'DYNAMIC',
    };

    const { data: similarPaperList, isLoading } = useSWR([params, similarPaperURL, 'getSimilarPapers'], ([_params]) => getSimilarPapers(_params));

    const handleOpenCreatePaperModal = (initialValue: string) => {
        setIsOpenAddContribution(false);
        setIsOpenCreatePaper(true);
        setInitialValueCreatePaper(initialValue);
    };

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

            <StyledSlider {...settings}>
                {similarPaperList.map((paper) => (
                    <div className="w-100 mx-1" key={paper?.title}>
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
                                            <b>{paper?.title}</b>
                                        </div>
                                        <div>
                                            <Button
                                                color="smart-darker"
                                                size="sm"
                                                className="float-right"
                                                onClick={() => {
                                                    setCurrentSimilarPaper(paper);
                                                    setIsOpenAddContribution(true);
                                                }}
                                            >
                                                Add
                                            </Button>
                                        </div>
                                    </div>
                                </CardTitle>
                                <CardText>
                                    {paper?.abstract && (
                                        <p>
                                            <div
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
                                        </p>
                                    )}
                                </CardText>
                            </CardBody>
                        </Card>
                    </div>
                ))}
            </StyledSlider>
            {isOpenAddContribution && (
                <AddContribution
                    allowCreate
                    onAddContributions={addContributions}
                    showDialog={isOpenAddContribution}
                    toggle={() => setIsOpenAddContribution((v) => !v)}
                    initialSearchQuery={currentSimilarPaper?.title}
                    // @ts-expect-error
                    onCreatePaper={handleOpenCreatePaperModal}
                />
            )}
            {isOpenCreatePaper && (
                <AddPaperModal
                    isOpen
                    onCreatePaper={handleCreatePaper}
                    toggle={() => setIsOpenCreatePaper((v) => !v)}
                    initialValue={initialValueCreatePaper !== null ? initialValueCreatePaper : undefined}
                />
            )}
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
