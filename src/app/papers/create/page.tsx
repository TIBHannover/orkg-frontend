import { Metadata } from 'next';

import CreatePaperPage from '@/app/papers/create/CreatePaperPage';

export async function generateMetadata({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
    const searchParamsResolved = await searchParams;
    const entry = searchParamsResolved.entry as string;
    if (entry) {
        return {
            title: 'Add paper - ORKG',
            ...(entry && {
                alternates: {
                    canonical: '/papers/create',
                },
            }),
        };
    }
    return {
        title: 'Add paper - ORKG',
    };
}

export default function Page() {
    return <CreatePaperPage />;
}
