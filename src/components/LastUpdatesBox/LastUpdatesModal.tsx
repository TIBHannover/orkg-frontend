import { Modal, Skeleton } from '@heroui/react';
import dayjs from 'dayjs';
import { truncate } from 'lodash';
import Link from 'next/link';
import { Dispatch, FC, SetStateAction } from 'react';

import ActivityItem from '@/components/ActivityItem/ActivityItem';
import usePaginate from '@/components/PaginatedContent/hooks/usePaginate';
import UserAvatar from '@/components/UserAvatar/UserAvatar';
import { RESOURCES } from '@/constants/graphSettings';
import { contentTypesUrl, getGenericContentTypes } from '@/services/backend/contentTypes';
import { getResourceLink } from '@/utils';

type LastUpdatesBoxProps = {
    researchFieldId: string;
    openModal: boolean;
    setOpenModal: Dispatch<SetStateAction<boolean>>;
};

const LastUpdatesBox: FC<LastUpdatesBoxProps> = ({ researchFieldId, openModal, setOpenModal }) => {
    const { data: activities, isLoading } = usePaginate({
        defaultPageSize: 30,
        fetchFunction: getGenericContentTypes,
        fetchUrl: contentTypesUrl,
        fetchFunctionName: 'getGenericContentTypes',
        fetchExtraParams: {
            research_field: researchFieldId === RESOURCES.RESEARCH_FIELD_MAIN ? undefined : researchFieldId,
            include_subfields: researchFieldId === RESOURCES.RESEARCH_FIELD_MAIN ? undefined : true,
        },
    });

    return (
        <Modal.Backdrop className="z-[1055]" isOpen={openModal} onOpenChange={setOpenModal} isDismissable>
            <Modal.Container>
                <Modal.Dialog className="max-w-4xl">
                    <Modal.CloseTrigger />
                    <Modal.Header>
                        <Modal.Heading>Last 30 updates</Modal.Heading>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="px-4">
                            {!isLoading &&
                                activities &&
                                activities.map((activity, index) => (
                                    <ActivityItem key={`sss${activity.id}`} isLast={index === activities.length - 1}>
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
                            {isLoading && (
                                <div className="mt-6 mb-6 flex">
                                    <div className="w-0.5 bg-border mr-4 shrink-0" />
                                    <div className="flex flex-col gap-4 grow">
                                        <div className="flex flex-col gap-1">
                                            <Skeleton className="w-full h-2 rounded" />
                                            <Skeleton className="w-1/4 h-1.5 rounded" />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <Skeleton className="w-full h-2 rounded" />
                                            <Skeleton className="w-full h-1.5 rounded" />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <Skeleton className="w-1/4 h-2 rounded" />
                                            <Skeleton className="w-full h-1.5 rounded" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Modal.Body>
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
};

export default LastUpdatesBox;
