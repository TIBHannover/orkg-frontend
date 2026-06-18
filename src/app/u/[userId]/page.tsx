'use client';

import { faCakeCandles } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Skeleton } from '@heroui/react';
import capitalize from 'capitalize';
import dayjs from 'dayjs';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import useSWR from 'swr';

import NotFound from '@/app/not-found';
import Gravatar from '@/components/Gravatar/Gravatar';
import HeaderSearchButton from '@/components/HeaderSearchButton/HeaderSearchButton';
import useAuthentication from '@/components/hooks/useAuthentication';
import TitleBar from '@/components/TitleBar/TitleBar';
import Container from '@/components/Ui/Structure/Container';
import useParams from '@/components/useParams/useParams';
import UserProfileTabsContainer from '@/components/UserProfile/UserProfileTabsContainer';
import UserStatistics from '@/components/UserProfile/UserStatistics';
import { MISC } from '@/constants/graphSettings';
import { ORGANIZATIONS_MISC } from '@/constants/organizationsTypes';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { contributorsUrl, getContributorById } from '@/services/backend/contributors';
import { getObservatoryById, observatoriesUrl } from '@/services/backend/observatories';
import { getOrganization, getOrganizationLogoUrl, organizationsUrl } from '@/services/backend/organizations';

const UserProfile = () => {
    const { userId } = useParams();
    const { user } = useAuthentication();
    const currentUserId = user?.id;
    const [optimizedLogo, setOptimizedLogo] = useState(true);

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
            <TitleBar buttonGroup={<HeaderSearchButton placeholder="Search in this user content..." userId={userId} />} />
            <Container className="mb-4">
                <div className="box rounded p-6">
                    {isLoadingUserData ? (
                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="flex flex-col items-center gap-3 md:w-1/4 md:border-r md:border-divider md:pr-6">
                                <Skeleton className="size-[120px] rounded-full" />
                                <Skeleton className="w-32 h-5 rounded" />
                                <Skeleton className="w-40 h-4 rounded" />
                            </div>
                            <div className="flex-1 flex flex-col gap-4">
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <Skeleton className="flex-1 h-[72px] rounded-md" />
                                    <Skeleton className="flex-1 h-[72px] rounded-md" />
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                                    {Array.from({ length: 7 }).map((_, i) => (
                                        // eslint-disable-next-line react/no-array-index-key
                                        <Skeleton key={i} className="h-16 rounded-md" />
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="flex flex-col items-center gap-3 md:w-1/4 md:border-r md:border-divider md:pr-6">
                                <Gravatar
                                    className="rounded-full border-3 border-primary/20 shadow-sm"
                                    hashedEmail={userData?.gravatarId ?? 'example@example.com'}
                                    size={120}
                                />
                                <div className="text-center">
                                    <h2 className="text-xl font-semibold leading-tight">{userData?.displayName}</h2>
                                    <div className="text-sm text-default-500 mt-1" title={userData?.joinedAt}>
                                        <FontAwesomeIcon icon={faCakeCandles} className="mr-1" />
                                        Member for {dayjs().from(dayjs(userData?.joinedAt), true)}
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 flex flex-col gap-4">
                                {(observatoryData || organizationData) && (
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        {observatoryData && (
                                            <div className="flex-1 rounded-md bg-default-100 p-4">
                                                <div className="text-xs uppercase tracking-wide text-default-500 font-medium mb-1">Observatory</div>
                                                <Link
                                                    href={reverse(ROUTES.OBSERVATORY, { id: observatoryData.display_id })}
                                                    className="text-base font-medium text-primary hover:underline"
                                                >
                                                    {observatoryData.name}
                                                </Link>
                                            </div>
                                        )}
                                        {organizationData && (
                                            <div className="flex items-center gap-3 flex-1 rounded-md bg-default-100 p-4">
                                                <Link
                                                    href={reverse(ROUTES.ORGANIZATION, {
                                                        type: capitalize(ORGANIZATIONS_MISC.GENERAL),
                                                        id: organizationData.displayId,
                                                    })}
                                                    className="relative size-16 shrink-0 bg-white rounded-md p-1"
                                                >
                                                    <Image
                                                        className="object-contain p-1"
                                                        src={getOrganizationLogoUrl(organizationData.id)}
                                                        alt={`${organizationData.name} logo`}
                                                        fill
                                                        unoptimized={!optimizedLogo}
                                                        onError={() => optimizedLogo && setOptimizedLogo(false)}
                                                    />
                                                </Link>
                                                <div className="flex flex-col min-w-0">
                                                    <div className="text-xs uppercase tracking-wide text-default-500 font-medium mb-1">
                                                        Organization
                                                    </div>
                                                    <Link
                                                        href={reverse(ROUTES.ORGANIZATION, {
                                                            type: capitalize(ORGANIZATIONS_MISC.GENERAL),
                                                            id: organizationData.displayId,
                                                        })}
                                                        className="text-base font-medium text-primary hover:underline truncate"
                                                    >
                                                        {organizationData.name}
                                                    </Link>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                                <UserStatistics userId={userId} />
                            </div>
                        </div>
                    )}
                </div>
            </Container>
            <Container className="mt-6">
                <UserProfileTabsContainer currentUserId={currentUserId} id={userId} />
            </Container>
        </>
    );
};

export default UserProfile;
