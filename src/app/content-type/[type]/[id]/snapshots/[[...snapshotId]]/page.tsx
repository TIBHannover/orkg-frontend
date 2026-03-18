import { notFound } from 'next/navigation';

import SnapshotPage from '@/app/resources/[id]/snapshots/[[...snapshotId]]/SnapshotPage';
import { getSnapshot } from '@/services/backend/resources';

type Props = {
    params: Promise<{ id: string; type: string; snapshotId: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const PublishedContentType = async ({ params }: Props) => {
    const { id, type, snapshotId } = await params;
    const snapshot = await getSnapshot({ id, snapshotId });
    if (!snapshot) {
        return notFound();
    }
    return <SnapshotPage contentType={type} id={id} snapshotId={snapshotId} />;
};

export default PublishedContentType;
