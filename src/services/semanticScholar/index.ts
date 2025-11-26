import ky from 'ky';
import { env } from 'next-runtime-env';

export const semanticScholarUrl = env('NEXT_PUBLIC_SEMANTIC_SCHOLAR_URL');
const semanticScholarApi = ky.create({ prefixUrl: semanticScholarUrl });

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

export const getPapersByTitle = async ({ title, limit = 10, offset = 0, fields = ['title', 'authors'] }: GetPapersByTitleProps) => {
    let paperSearchResult = null;
    try {
        paperSearchResult = await semanticScholarApi
            .get<SemanticScholarResponse>('graph/v1/paper/search', {
                searchParams: `query=${encodeURIComponent(title)}&limit=${limit}&offset=${offset}&fields=${fields.join(',')}`,
            })
            .json();
        return paperSearchResult;
    } catch (e) {
        return paperSearchResult;
    }
};

export const getAbstractByDoi = async (doi: string) => {
    const result = await semanticScholarApi
        .get(`v1/paper/${doi}`)
        .json()
        // @ts-expect-error TODO
        .then((data, reject) => {
            if (!data.abstract) {
                return reject;
            }
            return data.abstract;
        });
    return result;
};

export const getAbstractByTitle = async (title: string) =>
    // @ts-expect-error TODO
    getPapersByTitle({ title, limit: 1, fields: ['abstract', 'title'] }).then((data, reject) => data?.data?.[0] ?? reject);

export const getAuthorsByLabel = ({ label, limit }: { label: string; limit: number }) =>
    semanticScholarApi
        .get('graph/v1/author/search', {
            searchParams: `query=${encodeURIComponent(label)}&fields=name,url,citationCount,hIndex&limit=${limit}`,
        })
        .json();
