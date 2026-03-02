'use client';

import { faCakeCandles } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import capitalize from 'capitalize';
import dayjs from 'dayjs';
import { reverse } from 'named-urls';
import Link from 'next/link';
import { useEffect } from 'react';
import styled from 'styled-components';
import useSWR from 'swr';

import NotFound from '@/app/not-found';
import ContentLoader from '@/components/ContentLoader/ContentLoader';
import Gravatar from '@/components/Gravatar/Gravatar';
import HeaderSearchButton from '@/components/HeaderSearchButton/HeaderSearchButton';
import useAuthentication from '@/components/hooks/useAuthentication';
import Container from '@/components/Ui/Structure/Container';
import Row from '@/components/Ui/Structure/Row';
import useParams from '@/components/useParams/useParams';
import UserProfileTabsContainer from '@/components/UserProfile/UserProfileTabsContainer';
import UserStatistics from '@/components/UserProfile/UserStatistics';
import { MISC } from '@/constants/graphSettings';
import { ORGANIZATIONS_MISC } from '@/constants/organizationsTypes';
import ROUTES from '@/constants/routes';
import { contributorsUrl, getContributorById } from '@/services/backend/contributors';
import { getObservatoryById, observatoriesUrl } from '@/services/backend/observatories';
import { getOrganization, getOrganizationLogoUrl, organizationsUrl } from '@/services/backend/organizations';

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

const UserProfile = () => {
    const { userId } = useParams();
    const { user } = useAuthentication();
    const currentUserId = user?.id;

    const {
        data: userData,
        isLoading: isLoadingUserData,
        error,
    } = useSWR(userId ? [userId, contributorsUrl, 'getContributorById'] : null, ([params]) => getContributorById(params), {
        shouldRetryOnError: false,
    });

    const { data: observatoryData } = useSWR(
        userData?.observatoryId && userData?.observatoryId !== MISC.UNKNOWN_ID
            ? [userData.observatoryId, observatoriesUrl, 'getObservatoryById']
            : null,
        ([params]) => getObservatoryById(params),
    );

    const { data: organizationData } = useSWR(
        userData?.organizationId && userData?.organizationId !== MISC.UNKNOWN_ID
            ? [userData.organizationId, organizationsUrl, 'getOrganization']
            : null,
        ([params]) => getOrganization(params),
    );

    useEffect(() => {
        if (userData) {
            document.title = `${userData?.displayName} - ORKG`;
        } else {
            document.title = 'User profile - ORKG';
        }
    }, [userData]);

    if (error || !userId) {
        return <NotFound />;
    }

    return (
        <>
            <Container>
                <Row className="justify-content-end">
                    <div className="col-md-3 d-flex justify-content-end mb-3">
                        <HeaderSearchButton placeholder="Search in this user content..." userId={userId} />
                    </div>
                </Row>

                {!isLoadingUserData && (
                    <div className="box rounded p-4 row">
                        <div className="col-md-2 text-center d-flex justify-content-center mb-3 mb-md-0">
                            <StyledGravatar className="rounded-circle" hashedEmail={userData?.gravatarId ?? 'example@example.com'} size={100} />
                        </div>
                        <div className="col-md-10 row">
                            <div className="col-md-8 d-flex" style={{ flexDirection: 'column' }}>
                                <div>
                                    <h2 className="h3 flex-grow-1 m-0">{userData?.displayName}</h2>
                                    <div className="text-muted" title={userData?.joinedAt}>
                                        <FontAwesomeIcon icon={faCakeCandles} /> Member for {dayjs().from(dayjs(userData?.joinedAt), true)}
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
        </>
    );
};

export default UserProfile;
