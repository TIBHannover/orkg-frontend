import { Skeleton } from '@heroui/react';
import { times } from 'lodash';
import { Metadata } from 'next';
import { Suspense } from 'react';

import HelpCenterContent from '@/app/help-center/HelpCenterContent';
import HelpCenterSearchInput from '@/components/HelpCenterSearchInput/HelpCenterSearchInput';
import TitleBar from '@/components/TitleBar/TitleBar';

export const metadata: Metadata = {
    title: 'Help center - ORKG',
    description: 'Browse help articles and search the ORKG help center.',
};

const HelpCenterFallback = () => (
    <div>
        <TitleBar>Help center</TitleBar>
        <div className="max-w-container mx-auto px-3">
            <div className="box rounded p-8 md:p-12">
                <div className="max-w-2xl mx-auto text-center mb-10">
                    <h1 className="text-3xl md:text-4xl font-semibold mb-3">How can we help?</h1>
                    <p className="text-muted mb-6">Search help articles or browse the categories below.</p>
                    <HelpCenterSearchInput />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                    {times(4, (i) => (
                        <div key={i} className="flex flex-col gap-3">
                            <Skeleton className="w-2/3 h-7 rounded" />
                            <Skeleton className="w-full h-4 rounded" />
                            <Skeleton className="w-5/6 h-4 rounded" />
                            <Skeleton className="w-3/4 h-4 rounded" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);

export default function HelpCenterPage() {
    return (
        <Suspense fallback={<HelpCenterFallback />}>
            <HelpCenterContent />
        </Suspense>
    );
}
