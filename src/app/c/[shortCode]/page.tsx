import { reverse } from 'named-urls';
import { notFound, redirect } from 'next/navigation';

import SHORT_CODE_TO_COMPARISON_ID from '@/app/c/[shortCode]/shortCodeMapping';
import ROUTES from '@/constants/routes';

const RedirectShortLinks = async ({ params }: { params: Promise<{ shortCode: string }> }) => {
    const { shortCode } = await params;
    let comparisonId: string | undefined;
    try {
        comparisonId = SHORT_CODE_TO_COMPARISON_ID[shortCode];
    } catch (error) {
        notFound();
    }
    redirect(reverse(ROUTES.COMPARISON, { comparisonId }));
};

export default RedirectShortLinks;
