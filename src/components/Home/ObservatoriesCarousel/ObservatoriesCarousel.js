import React, { useState, useEffect } from 'react';
import { Carousel, CarouselItem, CarouselIndicators, Card, CardBody } from 'reactstrap';
import { Link } from 'react-router-dom';
import ROUTES from 'constants/routes.js';
import { getAllObservatories } from 'services/backend/observatories';
import { getAllOrganizations } from 'services/backend/organizations';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import styled from 'styled-components';
import { reverse } from 'named-urls';
import ContentLoader from 'react-content-loader';

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

const CarouselItemStyled = styled(CarouselItem)`
    //border-left: 4px solid ${props => props.theme.orkgPrimaryColor};
`;

export default function ObservatoriesCarousel() {
    const [activeIndex, setActiveIndex] = useState(0);
    const [observatories, setObservatories] = useState([]);

    useEffect(() => {
        setIsLoading(true);
        getAllOrganizations().then(v => {
            console.log(v);
        });
        getAllOrganizations().then(org => {
            getAllObservatories().then(obs => {
                const ll = obs.map(ob => {
                    return { ...ob, orgs: org.filter(o => ob.organization_ids.includes(o.id)) };
                });
                setObservatories(ll);
                setIsLoading(false);
            });
        });
    }, []);

    const [animating, setAnimating] = useState(false);
    const [IsLoading, setIsLoading] = useState(false);

    const next = () => {
        if (animating) {
            return;
        }
        const nextIndex = activeIndex === observatories.length - 1 ? 0 : activeIndex + 1;
        setActiveIndex(nextIndex);
    };

    const previous = () => {
        if (animating) {
            return;
        }
        const nextIndex = activeIndex === 0 ? observatories.length - 1 : activeIndex - 1;
        setActiveIndex(nextIndex);
    };

    const goToIndex = newIndex => {
        setActiveIndex(newIndex);
    };

    const slides = () => {
        return observatories.map((observatory, index) => {
            return (
                <CarouselItemStyled
                    onExiting={() => setAnimating(true)}
                    onExited={() => setAnimating(false)}
                    className="pt-4 pb-1 mb-4"
                    key={`fp${observatory.id}`}
                >
                    <ObservatoryCardStyled className="">
                        {!observatory.logo && (
                            <Card className="h-100 d-flex align-items-center" style={{ border: 0 }}>
                                <Link
                                    className="d-flex align-items-center"
                                    to={reverse(ROUTES.OBSERVATORY, { id: observatory.id })}
                                    style={{ textDecoration: 'none' }}
                                >
                                    <CardBody>
                                        {observatory.orgs.map(o => (
                                            <span key={o.id}>
                                                <img
                                                    className="justify-content-center orgLogo"
                                                    key={`imageLogo${o.id}`}
                                                    height="45px"
                                                    src={o.logo}
                                                    alt={`${o.name} logo`}
                                                />
                                            </span>
                                        ))}{' '}
                                        <div className="mt-3">
                                            <div className="observatoryName text-center">{observatory.name}</div>
                                        </div>
                                    </CardBody>
                                </Link>
                            </Card>
                        )}
                    </ObservatoryCardStyled>
                </CarouselItemStyled>
            );
        });
    };

    return (
        <div className="box rounded-lg" style={{ overflow: 'hidden' }}>
            <h2
                className="h5"
                style={{
                    marginBottom: 0,
                    padding: '15px'
                }}
            >
                <Icon icon={faStar} className="text-primary" /> Observatories
                <Link to={ROUTES.OBSERVATORIES}>
                    <span style={{ fontSize: '0.9rem', float: 'right', marginTop: 2, marginBottom: 15 }}>More observatories</span>
                </Link>
            </h2>

            <CarouselContainer>
                {!IsLoading ? (
                    <Carousel activeIndex={activeIndex} next={next} previous={previous}>
                        {slides()}

                        <CarouselIndicators items={observatories} activeIndex={activeIndex} onClickHandler={goToIndex} />
                    </Carousel>
                ) : (
                    <div style={{ height: '130px' }} className="pt-4 pb-1 pl-4 pr-4">
                        <ContentLoader speed={2} primaryColor="#f3f3f3" secondaryColor="#ecebeb" ariaLabel={false}>
                            <rect x="1" y="0" rx="4" ry="4" width="300" height="20" />
                            <rect x="1" y="25" rx="3" ry="3" width="250" height="20" />
                        </ContentLoader>
                    </div>
                )}
            </CarouselContainer>
        </div>
    );
}
