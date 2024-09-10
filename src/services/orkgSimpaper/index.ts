import { env } from 'next-runtime-env';
import { submitGetRequest } from 'network';
import qs from 'qs';
import { SimilarPaper } from 'services/orkgSimpaper/types';

export const similarPaperURL = env('NEXT_PUBLIC_SIMILAR_PAPER_URL');

export type GetSimilarPapersParams = { contributionIds: string[]; mode?: 'STATIC' | 'DYNAMIC' | null };

export const getSimilarPapers = ({ contributionIds, mode }: GetSimilarPapersParams): Promise<SimilarPaper[]> => {
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

    return submitGetRequest(`${similarPaperURL}paper/similar?${params}`).then((response) => response?.payload);
};
