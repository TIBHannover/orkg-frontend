import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import ROUTES from '@/constants/routes';
import { canonicalTabPath } from '@/lib/namedRoute';

// The page is a client component and cannot export metadata, so this pass-through layout carries
// the self-referencing canonical: ?history= (and other query) variants — and the default tab, which
// renders the same page — consolidate onto the clean path.
export async function generateMetadata({ params }: { params: Promise<{ id: string; activeTab?: string[] }> }): Promise<Metadata> {
    const { id: rawId, activeTab } = await params;
    // Route params are not URL-decoded; decode once so reverse() re-encodes prefixed ids exactly once.
    const id = decodeURIComponent(rawId);
    return {
        alternates: {
            canonical: canonicalTabPath(ROUTES.PROPERTY, ROUTES.PROPERTY_TABS, { id }, activeTab, 'information'),
        },
    };
}

const PropertyLayout = ({ children }: { children: ReactNode }) => children;

export default PropertyLayout;
