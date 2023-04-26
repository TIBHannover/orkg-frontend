import { faCubes, faFile } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import UserAvatar from 'components/UserAvatar/UserAvatar';
import { CarouselIndicatorsStyled } from 'components/styled';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import pluralize from 'pluralize';
import PropTypes from 'prop-types';
import { useState } from 'react';
import ContentLoader from 'react-content-loader';
import Dotdotdot from 'react-dotdotdot';
import { Link } from 'react-router-dom';
import { Card, CardBody, CardFooter, CardSubtitle, CardTitle, Carousel, CarouselItem } from 'reactstrap';
import { getOrganizationLogoUrl } from 'services/backend/organizations';
import styled from 'styled-components';

const CarouselContainer = styled.div`
    width: 100%;
    & .carousel-item.active {
        display: flex;
        flex-wrap: wrap;
        min-height: 100%;
    }

    & li {
        width: 10px !important;
        height: 10px !important;
        border-radius: 100% !important;
        background-color: ${props => props.theme.primary} !important;
    }
`;

const ObservatoryCardStyled = styled(Card)`
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

const CardFooterStyled = styled(CardFooter)`
    && {
        background: ${props => props.theme.lightLighter};
    }
`;

function ObservatoriesCarousel(props) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [animating, setAnimating] = useState(false);

    const next = () => {
        if (animating) {
            return;
        }
        const nextIndex = activeIndex === props.observatories.length - 1 ? 0 : activeIndex + 1;
        setActiveIndex(nextIndex);
    };

    const previous = () => {
        if (animating) {
            return;
        }
        const nextIndex = activeIndex === 0 ? props.observatories.length - 1 : activeIndex - 1;
        setActiveIndex(nextIndex);
    };

    const goToIndex = newIndex => {
        setActiveIndex(newIndex);
    };

    const slides = () =>
        props.observatories.map(observatory => (
            <CarouselItem
                onExiting={() => setAnimating(true)}
                onExited={() => setAnimating(false)}
                className="pb-1 pb-4 flex-grow-1"
                key={`fp${observatory.id}`}
            >
                <ObservatoryCardStyled className=" d-flex flex-grow-1" style={{ border: 0 }}>
                    <CardBody className="pt-0 mb-0">
                        <Link to={reverse(ROUTES.OBSERVATORY, { id: observatory.display_id })} style={{ textDecoration: 'none' }}>
                            <CardTitle tag="h5">{observatory.name}</CardTitle>
                            <CardSubtitle tag="h6" style={{ height: '20px' }} className="mb-1 text-muted">
                                <Dotdotdot clamp={2}>{observatory.description}</Dotdotdot>
                            </CardSubtitle>
                        </Link>
                        <div className="mt-3 mb-3 ps-2 pe-2">
                            <Link
                                className="text-center d-flex"
                                to={reverse(ROUTES.OBSERVATORY, { id: observatory.display_id })}
                                style={{ textDecoration: 'none', height: '80px', width: '100%', overflow: 'hidden' }}
                            >
                                {observatory.orgs.slice(0, 2).map(
                                    (
                                        o, // show only two logos
                                    ) => (
                                        <div key={`imageLogo${o.id}`} className="flex-grow-1">
                                            <img className="orgLogo" height="60px" src={getOrganizationLogoUrl(o?.id)} alt={`${o.name} logo`} />
                                        </div>
                                    ),
                                )}
                            </Link>
                        </div>
                    </CardBody>
                    <CardFooterStyled className="text-muted">
                        <small>
                            <Icon icon={faCubes} className="me-1" /> {pluralize('comparison', observatory.comparisons, true)}
                            <Icon icon={faFile} className="me-1 ms-2" />
                            {pluralize('paper', observatory.papers, true)}
                        </small>
                        <div className="float-end" style={{ height: '25px' }}>
                            {observatory.members.slice(0, 5).map(contributor => (
                                <UserAvatar key={contributor} userId={contributor} size={24} />
                            ))}
                        </div>
                    </CardFooterStyled>
                </ObservatoryCardStyled>
            </CarouselItem>
        ));

    return (
        <CarouselContainer className="flex-grow-1 d-flex">
            {!props.isLoading &&
                (props.observatories.length ? (
                    <Carousel className="flex-grow-1 d-flex" activeIndex={activeIndex} next={next} previous={previous}>
                        {slides()}

                        <CarouselIndicatorsStyled items={props.observatories} activeIndex={activeIndex} onClickHandler={goToIndex} />
                    </Carousel>
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
            {props.isLoading && (
                <div style={{ height: '130px' }} className="pt-4 pb-1 ps-4 pe-4">
                    <ContentLoader
                        width={300}
                        height={50}
                        viewBox="0 0 300 50"
                        speed={2}
                        backgroundColor="#f3f3f3"
                        foregroundColor="#ecebeb"
                        title={false}
                    >
                        <rect x="1" y="0" rx="4" ry="4" width="300" height="20" />
                        <rect x="1" y="25" rx="3" ry="3" width="250" height="20" />
                    </ContentLoader>
                </div>
            )}
        </CarouselContainer>
    );
}

ObservatoriesCarousel.propTypes = {
    isLoading: PropTypes.bool.isRequired,
    observatories: PropTypes.array.isRequired,
};

export default ObservatoriesCarousel;
