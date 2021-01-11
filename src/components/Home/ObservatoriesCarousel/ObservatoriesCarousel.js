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
    const [animating, setAnimating] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setIsLoading(true);
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
        return observatories.map(observatory => {
            return (
                <CarouselItemStyled
                    onExiting={() => setAnimating(true)}
                    onExited={() => setAnimating(false)}
                    className="pt-2 pb-1 mb-4"
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
                                            <div key={o.id} className="justify-content-center d-flex">
                                                <img className="orgLogo" key={`imageLogo${o.id}`} height="60px" src={o.logo} alt={`${o.name} logo`} />
                                            </div>
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
                {!isLoading ? (
                    <Carousel activeIndex={activeIndex} next={next} previous={previous}>
                        {slides()}

                        <CarouselIndicators items={observatories} activeIndex={activeIndex} onClickHandler={goToIndex} />
                    </Carousel>
                ) : (
                    <div style={{ height: '130px' }} className="pt-4 pb-1 pl-4 pr-4">
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
        </div>
    );
}
