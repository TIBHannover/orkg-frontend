import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import ROUTES from '@/constants/routes';
import { canonicalTabPath } from '@/lib/namedRoute';

// The page is a client component and cannot export metadata, so this pass-through layout carries
// the self-referencing canonical: ?history= (and other query) variants — and the default tab, which
// renders the same page — consolidate onto the clean path.
export async function generateMetadata({ params }: { params: Promise<{ id: string; activeTab?: string[] }> }): Promise<Metadata> {
    const { id, activeTab } = await params;
    return {
        alternates: {
            canonical: canonicalTabPath(ROUTES.RS_TEMPLATE, ROUTES.RS_TEMPLATE_TABS, { id }, activeTab, 'information'),
        },
    };
}

const RsTemplateLayout = ({ children }: { children: ReactNode }) => children;

export default RsTemplateLayout;
