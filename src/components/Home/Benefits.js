import { openAuthDialog } from 'actions/auth';
import { ReactComponent as IconCited } from 'assets/img/benefits/cited.svg';
import { ReactComponent as IconCommunity } from 'assets/img/benefits/community.svg';
import { ReactComponent as IconContribute } from 'assets/img/benefits/contribute.svg';
import { ReactComponent as IconConvince } from 'assets/img/benefits/convince.svg';
import { ReactComponent as IconFeedback } from 'assets/img/benefits/feedback.svg';
import { ReactComponent as IconReputation } from 'assets/img/benefits/reputation.svg';
import { ReactComponent as IconVisibility } from 'assets/img/benefits/visibility.svg';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Card, CardBody, CardSubtitle, CardTitle, Carousel, CarouselIndicators, CarouselItem } from 'reactstrap';
import styled from 'styled-components';

const CarouselContainer = styled.div`
    width: 100%;

    & li {
        width: 10px !important;
        height: 10px !important;
        border-radius: 100% !important;
        background-color: ${props => props.theme.orkgPrimaryColor} !important;
    }
`;

const ObservatoryCardStyled = styled.div`
    cursor: initial;
    .orgLogo {
        border: 1px;
        padding: 2px;
    }

    .observatoryName {
        font-weight: bold;
    }
    &:hover {
        .observatoryName {
            text-decoration: underline;
        }
    }
`;

const CarouselIndicatorsStyled = styled(CarouselIndicators)`
    && {
        margin: 0;
    }

    background: ${props => props.theme.ultraLightBlue};
`;

const ITEMS = [
    {
        title: 'Get cited',
        Icon: IconCited,
        description:
            'If others can quickly determine the merits of your work with a suitable ORKG representation, they are more likely to build on your work or position their work in relation to yours and thus cite you.'
    },
    {
        title: 'Get qualitative feedback',
        Icon: IconFeedback,
        description:
            'Collaboratively working on comparisons and visualizations of the state-of-the art in your field will give you insights on how others see your work in comparison. You can observe the strengths and weaknesses of different approaches in ORKG comparisons, visualizations and leaderboards.'
    },
    {
        title: 'Convince peer-reviewers',
        Icon: IconConvince,
        description:
            'When you accompany your research with an ORKG comparison showing how your approach compares to the state-of-the-art you help peer-reviewers to understand the merits of your work and chances your paper will be accepted increase.'
    },
    {
        title: 'Provide a key service to your community',
        Icon: IconCommunity,
        description:
            'Researcher like you are craving for obtaining an overview on the state-of-the art in your field. By organizing the research as comparisons and visualizations you will help many in your field to stay atop of the paper flood.'
    },
    {
        title: 'Knowledge base for science',
        Icon: IconContribute,
        description:
            'We are flooded with new publications in research every day and it is increasingly challenging to keep up with the information overload. By organizing research contributions in the ORKG you help yourself and others in your field to keep oversight over the state-of-the-art.'
    },
    {
        title: 'Get more visibility',
        Icon: IconVisibility,
        description:
            'We prominently acknowledge all contributions to the ORKG. Other researchers in your field will appreciate the service you are doing.'
    },
    {
        title: 'Build reputation',
        Icon: IconReputation,
        description:
            'Creating reasonable ORKG descriptions for approaches tackling key research problems in your field will help you building a reputation. Once your contributions reached a certain maturity level, they can even be formally published as a scientific publication (e.g. by assigning a DOI to a comparison) and can receive citations.'
    }
];

export default function Benefits() {
    const [activeIndex, setActiveIndex] = useState(0);
    const [animating, setAnimating] = useState(false);
    const dispatch = useDispatch();
    const user = useSelector(state => state.auth.user);
    const next = () => {
        if (animating) {
            return;
        }
        const nextIndex = activeIndex === ITEMS.length - 1 ? 0 : activeIndex + 1;
        setActiveIndex(nextIndex);
    };

    const previous = () => {
        if (animating) {
            return;
        }
        const nextIndex = activeIndex === 0 ? ITEMS.length - 1 : activeIndex - 1;
        setActiveIndex(nextIndex);
    };

    const goToIndex = newIndex => {
        setActiveIndex(newIndex);
    };

    const slides = () => {
        return ITEMS.map((item, index) => {
            return (
                <CarouselItem onExiting={() => setAnimating(true)} onExited={() => setAnimating(false)} className="pb-1 mb-4" key={`fp${index}`}>
                    <ObservatoryCardStyled className="">
                        <Card style={{ border: 0, minHeight: 250 }}>
                            <CardBody className="pt-0 mb-0 d-flex justify-content-center align-items-center flex-column">
                                <CardTitle tag="h5" className="pt-0 d-flex">
                                    <item.Icon className="flex-shrink-0" style={{ width: 50 }} />
                                    <div className="align-items-center d-flex">{item.title}</div>
                                </CardTitle>
                                <CardSubtitle tag="h6" className="mb-1 text-muted">
                                    {item.description}
                                </CardSubtitle>
                            </CardBody>
                        </Card>
                    </ObservatoryCardStyled>
                </CarouselItem>
            );
        });
    };

    return (
        <>
            <div className="d-flex align-items-center pt-3 pl-3 pr-3 pb-0">
                <div className="flex-grow-1">
                    <h2 className="h6 mb-1 mt-0">{!!user ? 'Start contributing!' : 'Join ORKG!'}</h2>
                </div>
                <div className="flex-shrink-0">
                    {!!!user && (
                        <Button
                            color="darkblue"
                            size="sm"
                            onClick={() => {
                                dispatch(openAuthDialog({ action: 'signup' }));
                            }}
                        >
                            <span>Sign up</span>
                        </Button>
                    )}
                </div>
            </div>

            <hr className="mx-3 mt-1" />
            <div>
                <CarouselContainer>
                    <Carousel activeIndex={activeIndex} next={next} previous={previous}>
                        {slides()}

                        <CarouselIndicatorsStyled items={ITEMS} activeIndex={activeIndex} onClickHandler={goToIndex} />
                    </Carousel>
                </CarouselContainer>
            </div>
        </>
    );
}
