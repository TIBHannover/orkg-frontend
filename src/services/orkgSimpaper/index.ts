import ky from 'ky';
import { env } from 'next-runtime-env';
import qs from 'qs';
import { SimilarPaper } from 'services/orkgSimpaper/types';

export const similarPaperURL = env('NEXT_PUBLIC_SIMILAR_PAPER_URL');
const similarPaperApi = ky.create({
    timeout: 1000 * 60 * 10, // 10 minutes
    prefixUrl: similarPaperURL,
});

export type GetSimilarPapersParams = { contributionIds: string[]; mode?: 'STATIC' | 'DYNAMIC' | null };

export const getSimilarPapers = ({ contributionIds, mode }: GetSimilarPapersParams) => {
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

    return similarPaperApi
        .get<{
            payload: SimilarPaper[];
        }>('paper/similar', {
            searchParams: params,
        })
        .json()
        .then((response) => response?.payload);
};
