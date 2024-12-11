import ky from 'ky';
import { env } from 'next-runtime-env';

const altmetricApi = ky.create({ prefixUrl: env('NEXT_PUBLIC_ALTMETRIC_URL') });

export const getAltMetrics = (doi: string) =>
    altmetricApi
        .get(`doi/${doi}`)
        .json()
        .catch(() => {});

export default getAltMetrics;
