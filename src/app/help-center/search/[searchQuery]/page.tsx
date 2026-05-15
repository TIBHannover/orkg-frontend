import { Skeleton } from '@heroui/react';
import { times } from 'lodash';
import { Metadata } from 'next';
import { Suspense } from 'react';

import HelpCenterSearchContent from '@/app/help-center/search/[searchQuery]/HelpCenterSearchContent';
import HelpCenterSearchInput from '@/components/HelpCenterSearchInput/HelpCenterSearchInput';
import TitleBar from '@/components/TitleBar/TitleBar';
import ROUTES from '@/constants/routes';

type PageProps = { params: Promise<{ searchQuery: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { searchQuery } = await params;
    const query = decodeURIComponent(searchQuery ?? '');
    return { title: `${query || 'Search'} - Help center - ORKG` };
}

const HelpCenterSearchFallback = () => (
    <div>
        <TitleBar>Help center</TitleBar>
        <div className="max-w-container mx-auto px-3">
            <div className="box rounded p-8 md:p-12">
                <div className="max-w-2xl mx-auto mb-8">
                    <HelpCenterSearchInput />
                </div>
                <div className="text-sm text-muted mb-4">
                    <a href={ROUTES.HELP_CENTER} className="hover:underline">
                        Help center
                    </a>{' '}
                    / Search results
                </div>
                <Skeleton className="w-1/2 h-8 rounded mb-6" />
                <ul className="flex flex-col gap-3">
                    {times(5, (i) => (
                        <li key={i}>
                            <Skeleton className="w-2/3 h-5 rounded" />
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    </div>
);

export default async function HelpCenterSearchPage({ params }: PageProps) {
    const { searchQuery } = await params;
    return (
        <Suspense key={searchQuery} fallback={<HelpCenterSearchFallback />}>
            <HelpCenterSearchContent params={params} />
        </Suspense>
    );
}
