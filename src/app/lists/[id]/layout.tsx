import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';

// The page is a client component and cannot export metadata, so this pass-through layout carries
// the self-referencing canonical: ?history= (and other query) variants consolidate onto the clean path.
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    return {
        alternates: { canonical: reverse(ROUTES.LIST, { id }) },
    };
}

const ListLayout = ({ children }: { children: ReactNode }) => children;

export default ListLayout;
