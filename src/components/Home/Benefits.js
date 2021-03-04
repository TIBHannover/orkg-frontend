import { useState } from 'react';
import { Button, Carousel, CarouselItem, CarouselIndicators, Card, CardBody, CardTitle, CardSubtitle } from 'reactstrap';
import { Link } from 'react-router-dom';
import ROUTES from 'constants/routes';
import styled from 'styled-components';
import { reverse } from 'named-urls';

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

const items = [
    {
        title: 'Get cited',
        description:
            'If others can quickly determine the merits of your work with a suitable ORKG representation, they are more likely to build on your work or position their work in relation to yours and thus cite you.'
    },
    {
        title: 'Get qualitative feedback',
        description:
            'Collaboratively working on comparisons and visualizations of the state-of-the art in your field will give you insights on how others see your work in comparison. You can observe the strengths and weaknesses of different approaches in ORKG comparisons, visualizations and leaderboards.'
    },
    {
        title: 'Convince peer-reviewers',
        description:
            'When you accompany your research with an ORKG comparison showing how your approach compares to the state-of-the-art you help peer-reviewers to understand the merits of your work and chances your paper will be accepted increase.'
    },
    {
        title: 'Provide a key service to your community',
        description:
            'Researcher like you are craving for obtaining an overview on the state-of-the art in your field. By organizing the research as comparisons and visualizations you will help many in your field to stay atop of the paper flood.'
    },
    {
        title: 'Knowledge base for science',
        description:
            'We are flooded with new publications in research every day and it is increasingly challenging to keep up with the information overload. By organizing research contributions in the ORKG you help yourself and others in your field to keep oversight over the state-of-the-art.'
    },
    {
        title: 'Get more visibility',
        description:
            'We prominently acknowledge all contributions to the ORKG. Other researchers in your field will appreciate the service you are doing.'
    },
    {
        title: 'Build reputation',
        description:
            'Creating reasonable ORKG descriptions for approaches tackling key research problems in your field will help you building a reputation. Once your contributions reached a certain maturity level, they can even be formally published as a scientific publication (e.g. by assigning a DOI to a comparison) and can receive citations.'
    }
];

export default function Benefits() {
    const [activeIndex, setActiveIndex] = useState(0);
    const [animating, setAnimating] = useState(false);

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

    const slides = () => {
        return items.map((item, index) => {
            return (
                <CarouselItem onExiting={() => setAnimating(true)} onExited={() => setAnimating(false)} className="pb-1 mb-4" key={`fp${index}`}>
                    <ObservatoryCardStyled className="">
                        <Card style={{ border: 0, minHeight: '220px' }}>
                            <Link to={reverse(ROUTES.OBSERVATORY, { id: item.index })} style={{ textDecoration: 'none' }}>
                                <CardBody className="pt-0 mb-0">
                                    <CardTitle tag="h5">{item.title}</CardTitle>
                                    <CardSubtitle tag="h6" className="mb-1 text-muted">
                                        {item.description}
                                    </CardSubtitle>
                                </CardBody>
                            </Link>
                        </Card>
                    </ObservatoryCardStyled>
                </CarouselItem>
            );
        });
    };

    return (
        <>
            <h2 className="h5 pt-3 pl-3 pr-3 pb-0">
                <span>Join ORKG!</span>

                <Button size="sm" to={ROUTES.OBSERVATORIES} style={{ fontSize: '0.9rem', float: 'right' }}>
                    <span>Signup</span>
                </Button>
            </h2>
            <hr className="mx-3 mt-0" />
            <div>
                <CarouselContainer>
                    <Carousel activeIndex={activeIndex} next={next} previous={previous}>
                        {slides()}

                        <CarouselIndicatorsStyled items={items} activeIndex={activeIndex} onClickHandler={goToIndex} />
                    </Carousel>
                </CarouselContainer>
            </div>
        </>
    );
}
