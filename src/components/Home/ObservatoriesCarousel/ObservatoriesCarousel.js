import React, { useState, useEffect } from 'react';
import { Carousel, CarouselItem, CarouselIndicators, Card, CardBody, CardFooter, CardTitle, CardSubtitle } from 'reactstrap';
import { Link } from 'react-router-dom';
import ROUTES from 'constants/routes.js';
import Dotdotdot from 'react-dotdotdot';
import { getAllObservatories, getObservatoriesStats, getUsersByObservatoryId } from 'services/backend/observatories';
import { getAllOrganizations } from 'services/backend/organizations';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faStar, faFile, faCubes } from '@fortawesome/free-solid-svg-icons';
import Tippy from '@tippy.js/react';
import styled from 'styled-components';
import Gravatar from 'react-gravatar';
import { reverse } from 'named-urls';
import { set, orderBy } from 'lodash';
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

const CarouselIndicatorsStyled = styled(CarouselIndicators)`
    && {
        margin: 0;
    }

    background: #e9ebf2;
`;

const StyledGravatar = styled(Gravatar)`
    border: 2px solid ${props => props.theme.darkblue};
    cursor: pointer;
    &:hover {
        border: 2px solid ${props => props.theme.primaryColor};
    }
`;

export default function ObservatoriesCarousel() {
    const [activeIndex, setActiveIndex] = useState(0);
    const [observatories, setObservatories] = useState([]);
    const [animating, setAnimating] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setIsLoading(true);

        const observatories = getAllObservatories();
        const obsStats = getObservatoriesStats();
        const organizations = getAllOrganizations();

        Promise.all([observatories, obsStats, organizations])
            .then(data => {
                let observatoriesData = data[0]
                    .filter(ob => {
                        const obsStat = data[1].find(el => el.observatory_id === ob.id);
                        return obsStat && (obsStat.comparisons > 0 || obsStat.resources > 0);
                    })
                    .map(ob => {
                        //const contributors = await getUsersByObservatoryId(ob.id);
                        const obsStat = data[1].find(el => el.observatory_id === ob.id);
                        return { ...ob, ...obsStat, orgs: data[2].filter(o => ob.organization_ids.includes(o.id)) };
                    });
                const cont = observatoriesData.map(o => getUsersByObservatoryId(o.id));
                Promise.all(cont).then(c => {
                    observatoriesData = orderBy(
                        observatoriesData.map((o, index) => set(o, 'contributors', c[index])),
                        ['comparisons', 'resources'],
                        ['desc', 'desc']
                    );
                    setObservatories(observatoriesData);
                    console.log(observatoriesData);
                    setIsLoading(false);
                });
            })
            .catch(e => {
                setIsLoading(false);
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
                <CarouselItem
                    onExiting={() => setAnimating(true)}
                    onExited={() => setAnimating(false)}
                    className=" pb-1 mb-4"
                    key={`fp${observatory.id}`}
                >
                    <ObservatoryCardStyled className="">
                        {!observatory.logo && (
                            <Card style={{ border: 0 }}>
                                <Link to={reverse(ROUTES.OBSERVATORY, { id: observatory.id })} style={{ textDecoration: 'none' }}>
                                    <CardBody className="pt-0 mb-0">
                                        <CardTitle tag="h5">{observatory.name}</CardTitle>
                                        <CardSubtitle tag="h6" style={{ height: '20px' }} className="mb-1 text-muted">
                                            <Dotdotdot clamp={2}>{observatory.description}</Dotdotdot>
                                        </CardSubtitle>
                                    </CardBody>
                                </Link>
                                <Link
                                    className="text-center mt-3 mb-3"
                                    to={reverse(ROUTES.OBSERVATORY, { id: observatory.id })}
                                    style={{ textDecoration: 'none', height: '80px', width: '100%', overflow: 'hidden' }}
                                >
                                    {observatory.orgs.map(o => (
                                        <img key={`imageLogo${o.id}`} className="orgLogo" height="60px" src={o.logo} alt={`${o.name} logo`} />
                                    ))}
                                </Link>
                                <CardFooter className="text-muted">
                                    <small>
                                        <Icon icon={faCubes} className="mr-1" /> {observatory.comparisons} Comparisons
                                        <Icon icon={faFile} className="mr-1 ml-2" />
                                        {observatory.resources} Papers
                                    </small>
                                    <div className="float-right" style={{ height: '25px' }}>
                                        {observatory.contributors.slice(0, 5).map(contributor => (
                                            <Tippy key={`contributor${contributor.id}`} content={contributor.display_name}>
                                                <Link className="ml-1" to={reverse(ROUTES.USER_PROFILE, { userId: contributor.id })}>
                                                    <StyledGravatar className="rounded-circle" md5={contributor.gravatar_id} size={24} />
                                                </Link>
                                            </Tippy>
                                        ))}
                                    </div>
                                </CardFooter>
                            </Card>
                        )}
                    </ObservatoryCardStyled>
                </CarouselItem>
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
                <Tippy content="Observatories organize research contributions in a particular research field and are curated by research organizations active in the respective field.">
                    <span>
                        <Icon icon={faStar} className="text-primary" /> Observatories
                    </span>
                </Tippy>
                <Link to={ROUTES.OBSERVATORIES}>
                    <span style={{ fontSize: '0.9rem', float: 'right', marginTop: 2, marginBottom: 15 }}>More observatories</span>
                </Link>
            </h2>
            <hr className="mx-3 mt-0" />
            <CarouselContainer>
                {!isLoading ? (
                    <Carousel activeIndex={activeIndex} next={next} previous={previous}>
                        {slides()}

                        <CarouselIndicatorsStyled items={observatories} activeIndex={activeIndex} onClickHandler={goToIndex} />
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
