import dayjs from 'dayjs';
import { truncate } from 'lodash';
import Link from 'next/link';
import { FC, useState } from 'react';
import { Button } from 'reactstrap';

import ContentLoader from '@/components/ContentLoader/ContentLoader';
import LastUpdatesModal from '@/components/LastUpdatesBox/LastUpdatesModal';
import { StyledActivity } from '@/components/LastUpdatesBox/styled';
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
        <div className="box rounded-3 p-3 flex-grow-1 d-flex flex-column">
            <h2 className="h5 mb-0">Latest updates</h2>
            <hr className="mt-2" />
            <div className="mt-3 flex-grow-1">
                <div>
                    <div>
                        {!isLoading &&
                            activities &&
                            activities.length > 0 &&
                            activities.slice(0, 3).map((activity) => (
                                <StyledActivity key={`log${activity.id}`} className="ps-3 pb-3">
                                    <div className="time">{dayjs(activity.created_at).fromNow()}</div>
                                    <div className="action">
                                        <UserAvatar userId={activity.created_by} showDisplayName />
                                        {` added a ${activity._class} `}
                                        <Link href={getResourceLink(activity._class, activity.id)}>
                                            {truncate('title' in activity ? activity.title : 'label' in activity ? activity.label : '', {
                                                length: 50,
                                            })}
                                        </Link>
                                    </div>
                                </StyledActivity>
                            ))}
                    </div>
                    {!isLoading && activities && activities.length > 3 && (
                        <div className="text-center">
                            <Button size="sm" onClick={() => setOpenModal((v) => !v)} color="light">
                                View more
                            </Button>
                        </div>
                    )}
                    {!isLoading && activities?.length === 0 && (
                        <div className="mt-4 mb-4">
                            No updates in this research field yet.
                            <br />
                            <i> Be the first to start building the knowledge!</i>
                        </div>
                    )}
                    {isLoading && (
                        <div className="mt-4 mb-4">
                            <ContentLoader height={130} width={200} foregroundColor="#d9d9d9" backgroundColor="#ecebeb">
                                <rect x="30" y="5" rx="3" ry="3" width="150" height="6" />
                                <rect x="30" y="15" rx="3" ry="3" width="100" height="5" />
                                <rect x="30" y="35" rx="3" ry="3" width="150" height="6" />
                                <rect x="30" y="45" rx="3" ry="3" width="150" height="5" />
                                <rect x="30" y="65" rx="3" ry="3" width="100" height="6" />
                                <rect x="30" y="75" rx="3" ry="3" width="150" height="5" />
                                <rect x="14" y="0" rx="3" ry="3" width="3" height="100" />
                            </ContentLoader>
                        </div>
                    )}
                    {activities && activities.length > 3 && openModal && (
                        <LastUpdatesModal openModal={openModal} setOpenModal={setOpenModal} researchFieldId={researchFieldId} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default LastUpdatesBox;
