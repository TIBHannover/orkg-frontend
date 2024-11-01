'use client';

import Link from 'next/link';
import { faCakeCandles } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import capitalize from 'capitalize';
import ComparisonPopup from 'components/ComparisonPopup/ComparisonPopup';
import HeaderSearchButton from 'components/HeaderSearchButton/HeaderSearchButton';
import UserProfileTabsContainer from 'components/UserProfile/UserProfileTabsContainer';
import UserStatistics from 'components/UserProfile/UserStatistics';
import { MISC } from 'constants/graphSettings';
import { ORGANIZATIONS_MISC } from 'constants/organizationsTypes';
import ROUTES from 'constants/routes';
import moment from 'moment';
import { reverse } from 'named-urls';
import NotFound from 'app/not-found';
import { useEffect, useState } from 'react';
import ContentLoader from 'components/ContentLoader/ContentLoader';
import Gravatar from 'react-gravatar';
import { useSelector } from 'react-redux';
import useParams from 'components/useParams/useParams';
import { Container, Row } from 'reactstrap';
import { getContributorInformationById } from 'services/backend/contributors';
import { getObservatoryById } from 'services/backend/observatories';
import { getOrganization, getOrganizationLogoUrl } from 'services/backend/organizations';
import styled from 'styled-components';

const StyledGravatar = styled(Gravatar)`
    border: 3px solid ${(props) => props.theme.dark};
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

const UserProfile = (props) => {
    const [userData, setUserData] = useState('');
    const [observatoryData, setObservatoryData] = useState(null);
    const [organizationData, setOrganizationData] = useState(null);
    const [isLoadingUserData, setIsLoadingUserData] = useState(false);
    const [notFound, setNotFound] = useState(false);
    const params = useParams();
    const { userId } = params;
    const currentUserId = useSelector((state) => state.auth.user?.id);
    useEffect(() => {
        const getUserInformation = async () => {
            setNotFound(false);
            setIsLoadingUserData(true);
            getContributorInformationById(userId)
                .then((userData) => {
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
                            .then((obsOrgData) => {
                                if (userData.organization_id) {
                                    setOrganizationData(obsOrgData[0]);
                                }
                                if (userData.observatory_id) {
                                    setObservatoryData(obsOrgData[1]);
                                }
                                setUserData(userData);
                                setIsLoadingUserData(false);
                            })
                            .catch((e) => {
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
                .catch((e) => {
                    document.title = 'User profile - ORKG';
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
                    <div className="box rounded p-4 row">
                        <div className="col-md-2 text-center d-flex justify-content-center mb-3 mb-md-0">
                            <StyledGravatar className="rounded-circle" md5={userData?.gravatar_id ?? 'example@example.com'} size={100} />
                        </div>
                        <div className="col-md-10 row">
                            <div className="col-md-8 d-flex" style={{ flexDirection: 'column' }}>
                                <div>
                                    <h2 className="h3 flex-grow-1 m-0">{userData.display_name}</h2>
                                    <div className="text-muted" title={userData.joined_at}>
                                        <FontAwesomeIcon icon={faCakeCandles} /> Member for {moment(userData.joined_at).fromNow(true)}
                                    </div>
                                </div>
                                {observatoryData && (
                                    <div className="mt-3 align-items-end">
                                        <b className="d-block">Member of the observatory</b>
                                        <Link href={reverse(ROUTES.OBSERVATORY, { id: observatoryData?.display_id })} className="text-center">
                                            {observatoryData?.name}
                                        </Link>
                                    </div>
                                )}
                                <UserStatistics userId={userId} />
                            </div>
                            <div className="col-md-4 mt-4 mt-md-0">
                                {organizationData && (
                                    <StyledOrganizationCard>
                                        <Link
                                            className="logoContainer"
                                            href={reverse(ROUTES.ORGANIZATION, {
                                                type: capitalize(ORGANIZATIONS_MISC.GENERAL),
                                                id: organizationData.display_id,
                                            })}
                                        >
                                            <img
                                                className="mx-auto p-2"
                                                src={getOrganizationLogoUrl(organizationData.id)}
                                                alt={`${organizationData.name} logo`}
                                            />
                                        </Link>
                                        <Link
                                            href={reverse(ROUTES.ORGANIZATION, {
                                                type: capitalize(ORGANIZATIONS_MISC.GENERAL),
                                                id: organizationData.display_id,
                                            })}
                                        >
                                            {organizationData?.name}
                                        </Link>
                                    </StyledOrganizationCard>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                {isLoadingUserData && (
                    <div className="mt-4 ms-3">
                        <ContentLoader speed={2} width={500} height={100} viewBox="0 0 500 100" style={{ width: '100% !important' }}>
                            <rect x="160" y="8" rx="3" ry="3" width="400" height="20" />
                            <rect x="160" y="50" rx="3" ry="3" width="300" height="20" />
                            <circle cx="50" cy="50" r="50" />
                        </ContentLoader>
                    </div>
                )}
            </Container>
            <Container className="mt-4 p-0">
                <UserProfileTabsContainer currentUserId={currentUserId} id={userId} />
            </Container>
            <ComparisonPopup />
        </>
    );
};

export default UserProfile;
