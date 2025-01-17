import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import { redirect } from 'next/navigation';
import { getPaperByDoi, getPaperByTitle } from 'services/backend/papers';
import { Paper } from 'services/backend/types';

const ViewOrCreatePaper = async ({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) => {
    let paper: Paper | null = null;

    try {
        if (searchParams.doi && typeof searchParams.doi === 'string') {
            paper = await getPaperByDoi(searchParams.doi);
        }
        if (!paper && searchParams.title && typeof searchParams.title === 'string') {
            paper = await getPaperByTitle(searchParams.title);
        }
    } catch (e) {
        console.error(e);
    }

    if (!paper) {
        return redirect(`${ROUTES.ADD_PAPER}${searchParams.doi ? `?entry=${searchParams.doi}` : `?title=${searchParams.title}`}`);
    }

    return redirect(reverse(ROUTES.VIEW_PAPER, { resourceId: paper.id }));
};

export default ViewOrCreatePaper;
