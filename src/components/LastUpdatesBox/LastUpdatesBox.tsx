import { Button, Skeleton } from '@heroui/react';
import dayjs from 'dayjs';
import { truncate } from 'lodash';
import Link from 'next/link';
import { FC, useState } from 'react';

import ActivityItem from '@/components/ActivityItem/ActivityItem';
import LastUpdatesModal from '@/components/LastUpdatesBox/LastUpdatesModal';
import usePaginate from '@/components/PaginatedContent/hooks/usePaginate';
import UserAvatar from '@/components/UserAvatar/UserAvatar';
import { RESOURCES } from '@/constants/graphSettings';
import { contentTypesUrl, getGenericContentTypes } from '@/services/backend/contentTypes';
import { getResourceLink } from '@/utils';

type LastUpdatesBoxProps = {
    researchFieldId: string;
};

const LastUpdatesBox: FC<LastUpdatesBoxProps> = ({ researchFieldId }) => {
    const { data: activities, isLoading } = usePaginate({
        defaultPageSize: 4,
        fetchFunction: getGenericContentTypes,
        fetchUrl: contentTypesUrl,
        fetchFunctionName: 'getGenericContentTypes',
        fetchExtraParams: {
            research_field: researchFieldId === RESOURCES.RESEARCH_FIELD_MAIN ? undefined : researchFieldId,
            include_subfields: researchFieldId === RESOURCES.RESEARCH_FIELD_MAIN ? undefined : true,
        },
    });

    const [openModal, setOpenModal] = useState(false);

    return (
        <div className="box rounded-lg p-4 flex flex-col w-full">
            <h2 className="text-xl mb-0">Latest updates</h2>
            <hr className="mt-2" />
            <div className="mt-4 grow">
                <div>
                    <div>
                        {!isLoading &&
                            activities &&
                            activities.length > 0 &&
                            activities.slice(0, 2).map((activity, index) => (
                                <ActivityItem key={`log${activity.id}`} isLast={index === Math.min(activities.length, 2) - 1}>
                                    <div className="mb-1 text-[95%] text-muted">{dayjs(activity.created_at).fromNow()}</div>
                                    <div className="flex items-center flex-wrap gap-x-1 text-[15px] text-foreground">
                                        <UserAvatar userId={activity.created_by} showDisplayName />
                                        <span>
                                            {`added a ${activity._class} `}
                                            <Link
                                                href={getResourceLink(activity._class, activity.id)}
                                                className="text-accent hover:text-accent-darker"
                                            >
                                                {truncate('title' in activity ? activity.title : 'label' in activity ? activity.label : '', {
                                                    length: 50,
                                                })}
                                            </Link>
                                        </span>
                                    </div>
                                </ActivityItem>
                            ))}
                    </div>
                    {!isLoading && activities && activities.length > 2 && (
                        <div className="text-center">
                            <Button size="sm" onPress={() => setOpenModal((v) => !v)} variant="tertiary">
                                View more
                            </Button>
                        </div>
                    )}
                    {!isLoading && activities?.length === 0 && (
                        <div className="mt-6 mb-6">
                            No updates in this research field yet.
                            <br />
                            <i> Be the first to start building the knowledge!</i>
                        </div>
                    )}
                    {isLoading && (
                        <div className="mt-6 mb-6 flex">
                            <div className="w-0.5 bg-border mr-4 shrink-0" />
                            <div className="flex flex-col gap-4 grow">
                                <div className="flex flex-col gap-1">
                                    <Skeleton className="w-3/4 h-2 rounded" />
                                    <Skeleton className="w-1/2 h-1.5 rounded" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <Skeleton className="w-3/4 h-2 rounded" />
                                    <Skeleton className="w-3/4 h-1.5 rounded" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <Skeleton className="w-1/2 h-2 rounded" />
                                    <Skeleton className="w-3/4 h-1.5 rounded" />
                                </div>
                            </div>
                        </div>
                    )}
                    {activities && activities.length > 2 && openModal && (
                        <LastUpdatesModal openModal={openModal} setOpenModal={setOpenModal} researchFieldId={researchFieldId} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default LastUpdatesBox;
