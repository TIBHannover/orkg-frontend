import { env } from 'next-runtime-env';
import { submitGetRequest } from 'network';

export const openCitationsUrl = env('NEXT_PUBLIC_OPEN_CITATIONS_URL');

export const getCitationCount = async (doi) => {
    try {
        return (await submitGetRequest(`${openCitationsUrl}index/api/v1/citation-count/${doi}`))?.[0]?.count;
    } catch (e) {
        console.log('No citation count available', e);
        return null;
    }
};
