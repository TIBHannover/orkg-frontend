import { submitGetRequest } from 'network';
import env from 'components/NextJsMigration/env';

export const getAltMetrics = doi => submitGetRequest(`${env('ALTMETRIC_URL')}doi/${doi}`).catch(e => {});
