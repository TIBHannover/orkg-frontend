import { submitGetRequest } from 'network';
import { env } from 'next-runtime-env';

export const getAltMetrics = (doi) => submitGetRequest(`${env('NEXT_PUBLIC_ALTMETRIC_URL')}doi/${doi}`).catch((e) => {});
