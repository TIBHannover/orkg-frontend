import { submitGetRequest } from 'network';
import env from 'components/NextJsMigration/env';

export const mastodonUrl = `${env('MASTODON_URL')}`;
const accountId = env('MASTODON_ACCOUNT_ID');

export const loadMastodonTimeline = () => submitGetRequest(`${mastodonUrl}accounts/${accountId}/statuses?limit=10`);
