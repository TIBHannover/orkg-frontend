import { reverse } from 'named-urls';
import { FC } from 'react';
import useSWR from 'swr';

import HistoryModalComponent from '@/components/HistoryModal/HistoryModal';
import ROUTES from '@/constants/routes';
import { getSnapshots, resourcesUrl } from '@/services/backend/resources';

type PublishHistoryModalProps = {
    id: string;
    snapshotId?: string;
    toggle: () => void;
    contentType: string;
};

const PublishHistoryModal: FC<PublishHistoryModalProps> = ({ id, snapshotId, toggle, contentType }) => {
    const { data: snapshots, isLoading } = useSWR(id ? [id, resourcesUrl, 'getSnapshots'] : null, ([resourceId]) =>
        getSnapshots({
            id: resourceId,
        }),
    );

    const versions =
        snapshots?.content?.map((snapshot) => ({
            id: snapshot.id,
            link:
                contentType === 'Resource'
                    ? reverse(ROUTES.RESOURCE_SNAPSHOT, {
                          id: snapshot.resource_id,
                          snapshotId: snapshot.id,
                      })
                    : reverse(ROUTES.CONTENT_TYPE_SNAPSHOT, {
                          type: contentType,
                          id,
                          snapshotId: snapshot.id,
                      }),
            created_at: snapshot.created_at,
            created_by: snapshot.created_by,
        })) ?? [];

    return (
        <HistoryModalComponent
            id={snapshotId}
            isLoading={isLoading}
            show
            showFeaturedButtons={false}
            toggle={toggle}
            title="Publish history"
            versions={versions}
        />
    );
};

export default PublishHistoryModal;
