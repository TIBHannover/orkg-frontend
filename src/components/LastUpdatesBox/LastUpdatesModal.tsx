import dayjs from 'dayjs';
import { truncate } from 'lodash';
import Link from 'next/link';
import { Dispatch, FC, SetStateAction } from 'react';
import { Modal, ModalBody, ModalHeader } from 'reactstrap';

import ContentLoader from '@/components/ContentLoader/ContentLoader';
import { StyledActivity } from '@/components/LastUpdatesBox/styled';
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
        <Modal isOpen={openModal} toggle={() => setOpenModal((v) => !v)} size="lg">
            <ModalHeader toggle={() => setOpenModal((v) => !v)}>Last 30 updates</ModalHeader>
            <ModalBody>
                <div className="ps-3 pe-3">
                    {!isLoading &&
                        activities &&
                        activities.map((activity) => (
                            <StyledActivity key={`sss${activity.id}`} className="ps-3 pb-3">
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
                    {isLoading && (
                        <div className="mt-4 mb-4">
                            <ContentLoader speed={2} width={400} height={120} viewBox="0 0 400 120" style={{ width: '100% !important' }}>
                                <rect x="30" y="5" rx="3" ry="3" width="350" height="6" />
                                <rect x="30" y="15" rx="3" ry="3" width="100" height="5" />
                                <rect x="30" y="35" rx="3" ry="3" width="350" height="6" />
                                <rect x="30" y="45" rx="3" ry="3" width="350" height="5" />
                                <rect x="30" y="65" rx="3" ry="3" width="100" height="6" />
                                <rect x="30" y="75" rx="3" ry="3" width="350" height="5" />
                                <rect x="14" y="0" rx="3" ry="3" width="3" height="100" />
                            </ContentLoader>
                        </div>
                    )}
                </div>
            </ModalBody>
        </Modal>
    );
};

export default LastUpdatesBox;
