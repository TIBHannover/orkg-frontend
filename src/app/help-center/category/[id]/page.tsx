import { Skeleton } from '@heroui/react';
import { times } from 'lodash';
import { Metadata } from 'next';
import { Suspense } from 'react';

import { loadHelpCategory } from '@/app/help-center/category/[id]/help-category-data';
import HelpCenterCategoryContent from '@/app/help-center/category/[id]/HelpCenterCategoryContent';
import TitleBar from '@/components/TitleBar/TitleBar';

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    if (!id) {
        return {};
    }
    const category = await loadHelpCategory(id);
    if (!category) {
        return { title: 'Help category not found - ORKG' };
    }
    return { title: `${category.attributes?.title ?? 'Help category'} - Help center - ORKG` };
}

const HelpCenterCategoryFallback = () => (
    <div>
        <TitleBar>Help center</TitleBar>
        <div className="max-w-container mx-auto px-3">
            <div className="box rounded p-8 md:p-12">
                <div className="flex flex-col gap-4">
                    <Skeleton className="w-1/3 h-4 rounded" />
                    <Skeleton className="w-2/3 h-9 rounded" />
                    <div className="flex flex-col gap-2 mt-4">
                        {times(5, (i) => (
                            <Skeleton key={i} className="w-1/2 h-5 rounded" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export default function HelpCenterCategoryPage({ params }: PageProps) {
    return (
        <Suspense fallback={<HelpCenterCategoryFallback />}>
            <HelpCenterCategoryContent params={params} />
        </Suspense>
    );
}
