import env from 'components/NextJsMigration/env';
import { submitGetRequest } from 'network';
import qs from 'qs';
import { SimilarPaper } from 'services/orkgSimpaper/types';

export const similarPaperURL = env('SIMILAR_PAPER_URL');

export const getSimilarPapers = ({
    contributionIds,
    mode,
}: {
    contributionIds: string[];
    mode?: 'STATIC' | 'DYNAMIC' | null;
}): Promise<SimilarPaper[]> => {
    const params: string = qs.stringify(
        {
            contribution_ids: contributionIds,
            mode,
        },
        {
            skipNulls: true,
            indices: false,
        },
    );

    return submitGetRequest(`${similarPaperURL}paper/similar?${params}`).then(response => response?.payload);
};
