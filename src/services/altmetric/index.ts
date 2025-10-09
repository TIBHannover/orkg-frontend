import ky from 'ky';
import { env } from 'next-runtime-env';

const altmetricApi = ky.create({ prefixUrl: env('NEXT_PUBLIC_ALTMETRIC_URL') });

type AltmetricResponse = {
    details_url: string;
    images: {
        small: string;
    };
};

export const getAltMetrics = async (doi: string) =>
    altmetricApi
        .get<AltmetricResponse>(`doi/${doi}`)
        .json()
        .catch(() => {});

export default getAltMetrics;
