import { useState } from 'react';
import { Button, Carousel, CarouselItem, CarouselIndicators, Card, CardBody, CardTitle, CardSubtitle } from 'reactstrap';
import { Link } from 'react-router-dom';
import ROUTES from 'constants/routes';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { openAuthDialog } from 'actions/auth';
import ICON_CITED from 'assets/img/benefits/cited.png';
import ICON_FEEDBACK from 'assets/img/benefits/feedback.png';
import ICON_COMMUNITY from 'assets/img/benefits/community.png';
import ICON_CONTRIBUTE from 'assets/img/benefits/contribute.png';
import ICON_CONVINCE from 'assets/img/benefits/convince.png';
import ICON_REPUTATION from 'assets/img/benefits/reputation.png';
import ICON_VISIBILITY from 'assets/img/benefits/visibility.png';
import { UncontrolledButtonDropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

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
        icon: ICON_CITED,
        description:
            'If others can quickly determine the merits of your work with a suitable ORKG representation, they are more likely to build on your work or position their work in relation to yours and thus cite you.'
    },
    {
        title: 'Get qualitative feedback',
        icon: ICON_FEEDBACK,
        description:
            'Collaboratively working on comparisons and visualizations of the state-of-the art in your field will give you insights on how others see your work in comparison. You can observe the strengths and weaknesses of different approaches in ORKG comparisons, visualizations and leaderboards.'
    },
    {
        title: 'Convince peer-reviewers',
        icon: ICON_CONVINCE,
        description:
            'When you accompany your research with an ORKG comparison showing how your approach compares to the state-of-the-art you help peer-reviewers to understand the merits of your work and chances your paper will be accepted increase.'
    },
    {
        title: 'Provide a key service to your community',
        icon: ICON_COMMUNITY,
        description:
            'Researcher like you are craving for obtaining an overview on the state-of-the art in your field. By organizing the research as comparisons and visualizations you will help many in your field to stay atop of the paper flood.'
    },
    {
        title: 'Knowledge base for science',
        icon: ICON_CONTRIBUTE,
        description:
            'We are flooded with new publications in research every day and it is increasingly challenging to keep up with the information overload. By organizing research contributions in the ORKG you help yourself and others in your field to keep oversight over the state-of-the-art.'
    },
    {
        title: 'Get more visibility',
        icon: ICON_VISIBILITY,
        description:
            'We prominently acknowledge all contributions to the ORKG. Other researchers in your field will appreciate the service you are doing.'
    },
    {
        title: 'Build reputation',
        icon: ICON_REPUTATION,
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
                        <Card style={{ border: 0, minHeight: '250px' }}>
                            <CardBody className="pt-0 mb-0 d-flex justify-content-center align-items-center" style={{ flexDirection: 'column' }}>
                                <CardTitle tag="h5" className="pt-0 d-flex">
                                    <img src={item.icon} alt={item.title} style={{ borderWidth: 0, height: '50px' }} />
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
                    <h2 className="h6 mb-0 mt-0">{!!user ? 'Start contributing!' : 'Join ORKG!'}</h2>
                </div>
                <div className="flex-shrink-0">
                    {!!user && (
                        <UncontrolledButtonDropdown size="sm">
                            <Button size="sm" color="lightblue" tag={Link} to={ROUTES.ADD_PAPER.GENERAL_DATA}>
                                <Icon className="mr-1" icon={faPlus} />
                                Add paper
                            </Button>

                            <DropdownToggle split color="darkblue" />
                            <DropdownMenu right>
                                <DropdownItem tag={Link} to={ROUTES.ADD_COMPARISON}>
                                    Add comparison
                                </DropdownItem>
                            </DropdownMenu>
                        </UncontrolledButtonDropdown>
                    )}
                    {!!!user && (
                        <Button
                            size="sm"
                            onClick={() => {
                                dispatch(openAuthDialog({ action: 'signup' }));
                            }}
                        >
                            <span>Signup</span>
                        </Button>
                    )}
                </div>
            </div>

            <hr className="mx-3 mt-1" />
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
