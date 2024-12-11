import ky from 'ky';
import { env } from 'next-runtime-env';

type CitationResponse = { count: number }[];

export const openCitationsUrl = env('NEXT_PUBLIC_OPEN_CITATIONS_URL');
const openCitationsApi = ky.create({ prefixUrl: openCitationsUrl });

export const getCitationCount = async (doi: string) => {
    try {
        return (await openCitationsApi.get(`index/api/v1/citation-count/${doi}`).json<CitationResponse>())?.[0]?.count;
    } catch (e) {
        console.error('No citation count available', e);
        return null;
    }
};
