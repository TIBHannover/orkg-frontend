import { getPaperByDoi, getPaperByTitle } from '@/services/backend/papers';
import { Paper } from '@/services/backend/types';

const getExistingPaper = async ({ doi, title }: { doi?: string; title?: string }): Promise<Paper | null> => {
    // check if DOI exists
    let paper: Paper | null = null;
    if (doi && doi.includes('10.') && doi.startsWith('10.')) {
        try {
            paper = await getPaperByDoi(doi);
        } catch (e) {}
    }
    if (!paper && title) {
        // check if title exists
        try {
            paper = await getPaperByTitle(title);
        } catch (e) {}
    }
    return paper;
};

export default getExistingPaper;
