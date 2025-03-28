import { faCubes, faFile } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { reverse } from 'named-urls';
import Link from 'next/link';
import PropTypes from 'prop-types';
import { useState } from 'react';
import Dotdotdot from 'react-dotdotdot';
import Gravatar from 'react-gravatar';
import { Card, CardBody, CardFooter, CardSubtitle, CardTitle, Carousel, CarouselItem } from 'reactstrap';
import styled from 'styled-components';

import ContentLoader from '@/components/ContentLoader/ContentLoader';
import Tooltip from '@/components/FloatingUI/Tooltip';
import { CarouselIndicatorsStyled } from '@/components/styled';
import ROUTES from '@/constants/routes';
import { getOrganizationLogoUrl } from '@/services/backend/organizations';

const CarouselContainer = styled.div`
    width: 100%;

    & li {
        width: 10px !important;
        height: 10px !important;
        border-radius: 100% !important;
        background-color: ${(props) => props.theme.primary} !important;
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

const StyledGravatar = styled(Gravatar)`
    border: 2px solid ${(props) => props.theme.secondary};
    cursor: pointer;
    &:hover {
        border: 2px solid ${(props) => props.theme.primaryColor};
    }
`;

const CardFooterStyled = styled(CardFooter)`
    && {
        background: ${(props) => props.theme.lightLighter};
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

    const goToIndex = (newIndex) => {
        setActiveIndex(newIndex);
    };

    const slides = () =>
        props.observatories.map((observatory) => (
            <CarouselItem onExiting={() => setAnimating(true)} onExited={() => setAnimating(false)} className="pb-1 mb-4" key={`fp${observatory.id}`}>
                <ObservatoryCardStyled className="">
                    <Card style={{ border: 0 }}>
                        <Link href={reverse(ROUTES.OBSERVATORY, { id: observatory.id })} style={{ textDecoration: 'none' }}>
                            <CardBody className="pt-0 mb-0">
                                <CardTitle tag="h5">{observatory.name}</CardTitle>
                                <CardSubtitle tag="h6" style={{ height: '20px' }} className="mb-1 text-muted">
                                    <Dotdotdot clamp={2}>{observatory.description}</Dotdotdot>
                                </CardSubtitle>
                            </CardBody>
                        </Link>
                        <div className="mt-3 mb-3 ps-2 pe-2">
                            <Link
                                className="text-center d-flex"
                                href={reverse(ROUTES.OBSERVATORY, { id: observatory.id })}
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
                        <CardFooterStyled className="text-muted">
                            <small>
                                <FontAwesomeIcon icon={faCubes} className="me-1" /> {observatory.comparisons} comparisons
                                <FontAwesomeIcon icon={faFile} className="me-1 ms-2" />
                                {observatory.resources} papers
                            </small>
                            <div className="float-end" style={{ height: '25px' }}>
                                {observatory.members.slice(0, 5).map((contributor) => (
                                    <Tooltip key={`contributor${contributor.id}`} content={contributor.display_name}>
                                        <Link className="ms-1" href={reverse(ROUTES.USER_PROFILE, { userId: contributor.id })}>
                                            <StyledGravatar className="rounded-circle" md5={contributor.gravatar_id} size={24} />
                                        </Link>
                                    </Tooltip>
                                ))}
                            </div>
                        </CardFooterStyled>
                    </Card>
                </ObservatoryCardStyled>
            </CarouselItem>
        ));

    return (
        <CarouselContainer>
            {!props.isLoading &&
                (props.observatories.length ? (
                    <Carousel activeIndex={activeIndex} next={next} previous={previous}>
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
                    <ContentLoader width={300} height={50} viewBox="0 0 300 50" speed={2} title={false}>
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
