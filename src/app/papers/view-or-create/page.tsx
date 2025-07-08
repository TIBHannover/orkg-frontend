import { reverse } from 'named-urls';
import { redirect } from 'next/navigation';

import ROUTES from '@/constants/routes';
import { getPaperByDoi, getPaperByTitle } from '@/services/backend/papers';
import { Paper } from '@/services/backend/types';

const ViewOrCreatePaper = async ({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) => {
    const searchParamsResolved = await searchParams;
    let paper: Paper | null = null;

    try {
        if (searchParamsResolved.doi && typeof searchParamsResolved.doi === 'string') {
            paper = await getPaperByDoi(searchParamsResolved.doi as string);
        }
        if (!paper && searchParamsResolved.title && typeof searchParamsResolved.title === 'string') {
            paper = await getPaperByTitle(searchParamsResolved.title as string);
        }
    } catch (e) {
        console.error(e);
    }

    if (!paper) {
        return redirect(
            `${ROUTES.CREATE_PAPER}${
                searchParamsResolved.doi
                    ? `?entry=${searchParamsResolved.doi}`
                    : `?title=${encodeURIComponent(searchParamsResolved.title?.toString() ?? '')}`
            }`,
        );
    }

    return redirect(reverse(ROUTES.VIEW_PAPER, { resourceId: paper.id }));
};

export default ViewOrCreatePaper;
