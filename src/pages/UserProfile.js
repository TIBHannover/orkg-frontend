import { useState, useEffect } from 'react';
import { Container, Row } from 'reactstrap';
import { getContributorInformationById } from 'services/backend/contributors';
import Items from 'components/UserProfile/Items';
import { getObservatoryById } from 'services/backend/observatories';
import { getOrganization } from 'services/backend/organizations';
import HeaderSearchButton from 'components/HeaderSearchButton/HeaderSearchButton';
import NotFound from 'pages/NotFound';
import ContentLoader from 'react-content-loader';
import { useSelector } from 'react-redux';
import Gravatar from 'react-gravatar';
import styled from 'styled-components';
import { CLASSES, MISC } from 'constants/graphSettings';
import ComparisonPopup from 'components/ComparisonPopup/ComparisonPopup';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import { Link, useParams } from 'react-router-dom';
import TitleBar from 'components/TitleBar/TitleBar';

const StyledGravatar = styled(Gravatar)`
    border: 3px solid ${props => props.theme.dark};
`;

const StyledOrganizationCard = styled.div`
    border: 0;
    text-align: center;
    .logoContainer {
        position: relative;
        display: block;

        &::before {
            // for aspect ratio
            content: '';
            display: block;
            padding-bottom: 100px;
        }
        img {
            position: absolute;
            max-width: 100%;
            max-height: 100px;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }
        &:active,
        &:focus {
            outline: 0;
            border: none;
            -moz-outline-style: none;
        }
    }
`;

/*
const StyledActivity = styled.div`
    border-left: 3px solid #e9ebf2;
    color: ${props => props.theme.bodyColor};
    .time {
        color: rgba(100, 100, 100, 0.57);
        margin-top: -0.2rem;
        margin-bottom: 0.2rem;
        font-size: 15px;
    }
    .time::before {
        width: 1rem;
        height: 1rem;
        margin-left: -1.6rem;
        margin-right: 0.5rem;
        border-radius: 15px;
        content: '';
        background-color: #c2c6d6;
        display: inline-block;
    }
    a {
        color: ${props => props.theme.primary};
    }

    &:last-child {
        border-left: none;
        padding-left: 1.2rem !important;
    }
`;
*/
const UserProfile = props => {
    const [userData, setUserData] = useState('');
    const [observatoryData, setObservatoryData] = useState(null);
    const [organizationData, setOrganizationData] = useState(null);
    const [isLoadingUserData, setIsLoadingUserData] = useState(false);
    const [notFound, setNotFound] = useState(false);
    const params = useParams();
    const userId = params.userId;
    const currentUserId = useSelector(state => state.auth.user?.id);

    useEffect(() => {
        const getUserInformation = async () => {
            setNotFound(false);
            setIsLoadingUserData(true);
            getContributorInformationById(userId)
                .then(userData => {
                    if (userData.observatory_id || userData.organization_id) {
                        const promises = [];
                        if (userData.organization_id !== MISC.UNKNOWN_ID) {
                            const promise1 = getOrganization(userData.organization_id);
                            promises.push(promise1);
                        } else {
                            promises.push(Promise.resolve());
                        }
                        if (userData.observatory_id !== MISC.UNKNOWN_ID) {
                            const promise2 = getObservatoryById(userData.observatory_id);
                            promises.push(promise2);
                        } else {
                            promises.push(Promise.resolve());
                        }

                        Promise.all(promises)
                            .then(obsOrgData => {
                                if (userData.organization_id) {
                                    setOrganizationData(obsOrgData[0]);
                                }
                                if (userData.observatory_id) {
                                    setObservatoryData(obsOrgData[1]);
                                }
                                setUserData(userData);
                                setIsLoadingUserData(false);
                            })
                            .catch(e => {
                                if (userData.organization_id) {
                                    setOrganizationData(null);
                                }
                                if (userData.observatory_id) {
                                    setObservatoryData(null);
                                }
                                setUserData(userData);
                                setIsLoadingUserData(false);
                            });
                    } else {
                        setUserData(userData);
                        setIsLoadingUserData(false);
                    }
                    document.title = `${userData.display_name} - ORKG`;
                })
                .catch(e => {
                    document.title = `User profile - ORKG`;
                    setNotFound(true);
                });
        };

        getUserInformation();
    }, [userId]);

    if (notFound) {
        return <NotFound />;
    }

    return (
        <>
            <Container>
                <Row className="justify-content-end">
                    <div className="col-md-3 d-flex justify-content-end mb-3">
                        <HeaderSearchButton placeholder="Search in this user content..." type={null} userId={userId} />
                    </div>
                </Row>

                {!isLoadingUserData && (
                    <Row>
                        <div className="col-md-2 text-center d-flex align-items-center justify-content-center mb-3 mb-md-0">
                            <StyledGravatar className="rounded-circle" md5={userData?.gravatar_id ?? 'example@example.com'} size={100} />
                        </div>
                        <div className="col-md-10 box rounded p-4">
                            <div className="row">
                                <div className="col-md-8 d-flex" style={{ flexDirection: 'column' }}>
                                    <h2 className="h3 flex-grow-1">{userData.display_name}</h2>
                                    {observatoryData && (
                                        <div className="mt-3 align-items-end">
                                            <b className="d-block">Member of the observatory</b>
                                            <Link to={reverse(ROUTES.OBSERVATORY, { id: observatoryData?.display_id })} className="text-center">
                                                {observatoryData?.name}
                                            </Link>
                                        </div>
                                    )}
                                </div>
                                <div className="col-md-4 mt-4 mt-md-0">
                                    {organizationData && (
                                        <StyledOrganizationCard>
                                            <Link className="logoContainer" to={reverse(ROUTES.ORGANIZATION, { id: organizationData.display_id })}>
                                                <img className="mx-auto p-2" src={organizationData.logo} alt={`${organizationData.name} logo`} />
                                            </Link>
                                            <Link to={reverse(ROUTES.ORGANIZATION, { id: organizationData.display_id })}>
                                                {organizationData?.name}
                                            </Link>
                                        </StyledOrganizationCard>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Row>
                )}
                {isLoadingUserData && (
                    <div className="mt-4 ms-3">
                        <ContentLoader
                            speed={2}
                            width={500}
                            height={100}
                            viewBox="0 0 500 100"
                            style={{ width: '100% !important' }}
                            backgroundColor="#f3f3f3"
                            foregroundColor="#ecebeb"
                        >
                            <rect x="160" y="8" rx="3" ry="3" width="400" height="20" />
                            <rect x="160" y="50" rx="3" ry="3" width="300" height="20" />
                            <circle cx="50" cy="50" r="50" />
                        </ContentLoader>
                    </div>
                )}
            </Container>

            <TitleBar>Published comparisons</TitleBar>
            <Container className="p-0">
                <Items filterLabel="comparisons" filterClass={CLASSES.COMPARISON} userId={userId} />
            </Container>

            <TitleBar>Added papers</TitleBar>
            <Container className="p-0">
                <Items filterLabel="papers" filterClass={CLASSES.PAPER} userId={userId} showDelete={userId === currentUserId} />
            </Container>
            <ComparisonPopup />
            {/*
            TODO: support for activity feed
            <Container className="box mt-4 pt-4 pb-3 ps-5 pe-5">
            <h5 className="mb-4">Activity feed</h5>
            <StyledActivity className="ps-3 pb-3">
                <div className={'time'}>16 JULY 2019</div>
                <div>
                    John Doe updated resource <Link to={'/'}>IoT research directions</Link>
                </div>
            </StyledActivity>
            <StyledActivity className="ps-3 pb-3">
                <div className={'time'}>10 JULY 2019</div>
                <div>
                    John Doe updated resource <Link to={'/'}>IoT research directions</Link>
                </div>
                <div>
                    John Doe commented on predicate <Link to={'/'}>Has Problem</Link>
                </div>
            </StyledActivity>
            <StyledActivity className="ps-3 pb-3">
                <div className={'time'}>5 JULY 2019</div>
                <div>John Doe joined ORKG, welcome!</div>
            </StyledActivity>
            </Container>*/}
        </>
    );
};

export default UserProfile;
