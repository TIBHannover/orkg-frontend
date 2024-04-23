import { submitGetRequest } from 'network';
import env from 'components/NextJsMigration/env';

export const getAltMetrics = doi => submitGetRequest(`${env('NEXT_PUBLIC_ALTMETRIC_URL')}doi/${doi}`).catch(e => {});
