import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import SnapshotPage from '@/app/resources/[id]/snapshots/[[...snapshotId]]/SnapshotPage';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { getSnapshot } from '@/services/backend/resources';

type Props = {
    params: Promise<{ id: string; type: string; snapshotId: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: { params: Promise<{ id: string; type: string; snapshotId?: string[] }> }): Promise<Metadata> {
    const { id, type, snapshotId } = await params;
    // Self-referencing canonical so ?history= (and other query) variants consolidate onto the clean path.
    if (!snapshotId?.[0]) return {};
    return {
        alternates: { canonical: reverse(ROUTES.CONTENT_TYPE_SNAPSHOT, { type, id, snapshotId: snapshotId[0] }) },
    };
}

const PublishedContentType = async ({ params }: Props) => {
    const { id, type, snapshotId } = await params;
    const snapshot = await getSnapshot({ id, snapshotId });
    if (!snapshot) {
        return notFound();
    }
    return <SnapshotPage contentType={type} id={id} snapshotId={snapshotId} />;
};

export default PublishedContentType;
