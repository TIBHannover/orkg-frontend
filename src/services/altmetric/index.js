import { submitGetRequest } from 'network';
import env from '@beam-australia/react-env';

export const getAltMetrics = doi => {
    return submitGetRequest(`${env('ALTMETRIC_URL')}doi/${doi}`).catch(e => {});
};
