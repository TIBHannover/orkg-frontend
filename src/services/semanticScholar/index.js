import env from '@beam-australia/react-env';
import { submitGetRequest } from 'network';

export const semanticScholarUrl = env('SEMANTIC_SCHOLAR_URL');

export const getPapersByTitle = async ({ title, limit = 10, offset = 0, fields = ['title', 'authors'] }) => {
    let paperSearchResult = [];
    try {
        paperSearchResult = await submitGetRequest(
            `${semanticScholarUrl}graph/v1/paper/search?query=${encodeURIComponent(title)}&limit=${limit}&offset=${offset}&fields=${fields.join(
                ',',
            )}`,
        );
        return paperSearchResult;
    } catch (e) {}
};

export const getAbstractByDoi = async doi => {
    const result = await submitGetRequest(`${semanticScholarUrl}v1/paper/${doi}`).then((data, reject) => {
        if (!data.abstract) {
            return reject;
        }
        return data.abstract;
    });
    return result;
};

export const getAuthorsByLabel = ({ label, limit }) =>
    submitGetRequest(
        `${semanticScholarUrl}graph/v1/author/search?query=${encodeURIComponent(label)}&fields=name,aliases,url,citationCount,hIndex&limit=${limit}`,
    );
