import { Alert, Button } from '@heroui/react';
import dayjs from 'dayjs';
import Link from 'next/link';
import { env } from 'next-runtime-env';

import ActivityItem from '@/components/ActivityItem/ActivityItem';
import { MISC } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { Contributor, Paper, Resource } from '@/services/backend/types';

type TimelineProps = {
    versions: { created_at: string; created_by: Contributor; publishedResource?: Resource }[];
    paperResource: Paper;
    createdBy?: Contributor;
    isLoadingContributors: boolean;
    hasNextPageContributors: boolean;
    handleLoadMoreContributors: () => void;
};

const Timeline = ({
    versions,
    createdBy,
    paperResource,
    isLoadingContributors,
    hasNextPageContributors,
    handleLoadMoreContributors,
}: TimelineProps) => (
    <div>
        <Alert status="accent" className="rounded-none mb-1">
            <Alert.Indicator />
            <Alert.Content>
                <Alert.Title>How the timeline is built</Alert.Title>
                <Alert.Description>
                    The timeline is built based on the creation time of each resource and statement linked to the paper.
                </Alert.Description>
            </Alert.Content>
        </Alert>
        <div className="p-4">
            {versions?.length > 0 &&
                versions.map((version, index) => {
                    const isLast = index === versions.length - 1 && !isLoadingContributors && !hasNextPageContributors;

                    return (
                        <ActivityItem key={`prov-${index}`} isLast={isLast}>
                            <div className="mb-1 text-muted text-[15px]">{dayjs(version.created_at).format('DD MMM YYYY HH:mm')}</div>
                            <div className="text-sm text-foreground">
                                {paperResource.created_by && (
                                    <>
                                        {version.publishedResource && 'Published by '}
                                        {!version.publishedResource &&
                                        !isLoadingContributors &&
                                        !hasNextPageContributors &&
                                        dayjs(version.created_at).format('DD MMM YYYY HH:mm') ===
                                            dayjs(paperResource.created_at).format('DD MMM YYYY HH:mm') &&
                                        version.created_by.id === (createdBy?.id ?? MISC.UNKNOWN_ID)
                                            ? 'Added by '
                                            : 'Updated by '}
                                        {version.created_by?.id !== MISC.UNKNOWN_ID ? (
                                            <>
                                                <Link
                                                    href={reverse(ROUTES.USER_PROFILE, {
                                                        userId: version.created_by.id,
                                                    })}
                                                    className="text-foreground"
                                                >
                                                    <b>{version.created_by.displayName}</b>
                                                </Link>
                                                {version.publishedResource && (
                                                    <>
                                                        <br />
                                                        <small>
                                                            DOI:{' '}
                                                            <a
                                                                href={`https://doi.org/${env('NEXT_PUBLIC_DATACITE_DOI_PREFIX')}/${
                                                                    version.publishedResource.id
                                                                }`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-accent hover:text-accent-darker"
                                                            >
                                                                https://doi.org/{env('NEXT_PUBLIC_DATACITE_DOI_PREFIX')}/
                                                                {version.publishedResource.id}
                                                            </a>
                                                        </small>
                                                    </>
                                                )}
                                            </>
                                        ) : (
                                            <b>{version.created_by?.displayName}</b>
                                        )}
                                    </>
                                )}
                            </div>
                        </ActivityItem>
                    );
                })}
            {!isLoadingContributors && hasNextPageContributors && (
                <ActivityItem>
                    <div className="mb-1">
                        <Button variant="ghost" size="sm" onPress={handleLoadMoreContributors}>
                            Load more
                        </Button>
                    </div>
                </ActivityItem>
            )}

            {!isLoadingContributors && hasNextPageContributors && (
                <ActivityItem isLast>
                    <div className="mb-1 text-muted text-[15px]">{dayjs(paperResource.created_at).format('DD MMM YYYY HH:mm')}</div>
                    <div className="text-sm text-foreground">
                        Added by{' '}
                        {createdBy ? (
                            <Link
                                href={reverse(ROUTES.USER_PROFILE, {
                                    userId: createdBy.id,
                                })}
                                className="text-foreground"
                            >
                                <b>{createdBy.displayName}</b>
                            </Link>
                        ) : (
                            'Unknown'
                        )}
                    </div>
                </ActivityItem>
            )}

            {isLoadingContributors && (
                <ActivityItem isLast>
                    <div className="-mt-0.5 text-muted text-[15px]">Loading ...</div>
                </ActivityItem>
            )}
        </div>
    </div>
);

export default Timeline;
