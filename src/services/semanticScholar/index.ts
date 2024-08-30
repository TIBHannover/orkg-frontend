import { env } from 'next-runtime-env';
import { submitGetRequest } from 'network';

export const semanticScholarUrl = env('NEXT_PUBLIC_SEMANTIC_SCHOLAR_URL');

type GetPapersByTitleProps = {
    title: string;
    limit?: number;
    offset?: number;
    fields?: string[];
};

export type SemanticScholarResult = {
    authors: {
        authorId: string;
        name: string;
    }[];
    externalIds: {
        CorpusId: number;
        DOI: string;
    };
    id: string;
    label: string;
    paperId: string;
    title: string;
    venue: string;
    year: number;
};

type SemanticScholarResponse = {
    data: SemanticScholarResult[];
    next: number;
    offset: number;
    total: number;
};

export const getPapersByTitle = async ({
    title,
    limit = 10,
    offset = 0,
    fields = ['title', 'authors'],
}: GetPapersByTitleProps): Promise<SemanticScholarResponse> => {
    let paperSearchResult = null;
    try {
        paperSearchResult = await submitGetRequest(
            `${semanticScholarUrl}graph/v1/paper/search?query=${encodeURIComponent(title)}&limit=${limit}&offset=${offset}&fields=${fields.join(
                ',',
            )}`,
        );
        return paperSearchResult;
    } catch (e) {
        return paperSearchResult;
    }
};

// @ts-expect-error TODO
export const getAbstractByDoi = async (doi) => {
    // @ts-expect-error TODO
    const result = await submitGetRequest(`${semanticScholarUrl}v1/paper/${doi}`).then((data, reject) => {
        if (!data.abstract) {
            return reject;
        }
        return data.abstract;
    });
    return result;
};

// @ts-expect-error TODO
export const getAbstractByTitle = async (title) =>
    // @ts-expect-error TODO
    getPapersByTitle({ title, limit: 1, fields: ['abstract', 'title'] }).then((data, reject) => data?.data?.[0] ?? reject);

// @ts-expect-error TODO
export const getAuthorsByLabel = ({ label, limit }) =>
    submitGetRequest(
        `${semanticScholarUrl}graph/v1/author/search?query=${encodeURIComponent(label)}&fields=name,aliases,url,citationCount,hIndex&limit=${limit}`,
    );
