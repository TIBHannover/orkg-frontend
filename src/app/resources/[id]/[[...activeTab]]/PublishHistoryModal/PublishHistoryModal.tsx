import { Modal, Spinner } from '@heroui/react';
import dayjs from 'dayjs';
import Link from 'next/link';
import { FC } from 'react';
import useSWR from 'swr';

import UserAvatar from '@/components/UserAvatar/UserAvatar';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { getSnapshots, resourcesUrl } from '@/services/backend/resources';

type PublishHistoryModalProps = {
    id: string;
    snapshotId?: string;
    toggle: () => void;
    contentType: string;
};

const PublishHistoryModal: FC<PublishHistoryModalProps> = ({ id, snapshotId, toggle, contentType }) => {
    const { data: snapshots, isLoading } = useSWR(id ? [id, resourcesUrl, 'getSnapshots'] : null, ([resourceId]) => getSnapshots({ id: resourceId }));

    const versions = snapshots?.content ?? [];

    const getVersionLink = (snapshot: { id: string; resource_id: string }) =>
        contentType === 'Resource'
            ? reverse(ROUTES.RESOURCE_SNAPSHOT, { id: snapshot.resource_id, snapshotId: snapshot.id })
            : reverse(ROUTES.CONTENT_TYPE_SNAPSHOT, { type: contentType, id, snapshotId: snapshot.id });

    return (
        <Modal.Backdrop className="z-[1055]" isOpen onOpenChange={(open) => !open && toggle()}>
            <Modal.Container>
                <Modal.Dialog className="sm:max-w-lg">
                    <Modal.CloseTrigger />
                    <Modal.Header>
                        <Modal.Heading>Publish history</Modal.Heading>
                    </Modal.Header>
                    <Modal.Body>
                        {isLoading && (
                            <div className="flex justify-center py-8">
                                <Spinner />
                            </div>
                        )}
                        {!isLoading && versions.length === 0 && <p className="text-center text-muted py-6 m-0">No published versions yet.</p>}
                        {!isLoading && versions.length > 0 && (
                            <ol className="relative ms-2 ps-6 border-s-2 border-divider space-y-5 m-0">
                                {versions.map((snapshot, index) => {
                                    const isCurrent = snapshotId === snapshot.id;
                                    const versionNumber = versions.length - index;
                                    return (
                                        <li key={snapshot.id} className="relative">
                                            <span
                                                aria-hidden
                                                className={`absolute -start-[calc(0.5rem+1px)] top-1.5 size-3 rounded-full ring-4 ring-background ${
                                                    isCurrent ? 'bg-accent' : 'bg-default-400'
                                                }`}
                                            />
                                            <div className="flex items-center gap-2 text-sm text-muted">
                                                {dayjs(snapshot.created_at).format('DD MMMM YYYY - HH:mm')}
                                                <UserAvatar userId={snapshot.created_by} />
                                            </div>
                                            <div className="mt-0.5 flex items-baseline gap-2">
                                                <span className={`font-semibold ${isCurrent ? 'text-accent' : ''}`}>Version {versionNumber}</span>
                                                {isCurrent ? (
                                                    <span className="text-xs text-muted">(Current)</span>
                                                ) : (
                                                    <Link className="text-sm" onClick={toggle} href={getVersionLink(snapshot)}>
                                                        View this version
                                                    </Link>
                                                )}
                                            </div>
                                        </li>
                                    );
                                })}
                            </ol>
                        )}
                    </Modal.Body>
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
};

export default PublishHistoryModal;
