import { submitGetRequest } from 'network';
import env from 'components/NextJsMigration/env';

export const mastodonUrl = `${env('MASTODON_URL')}`;
const accountId = env('MASTODON_ACCOUNT_ID');

export type Message = {
    reblog?: Message;
    content: string;
    created_at: string;
    url?: string;
    id: string;
    account?: {
        avatar?: string;
        display_name?: string;
        username?: string;
        url?: string;
    };
};

export const loadMastodonTimeline = (): Promise<Message[]> => submitGetRequest(`${mastodonUrl}accounts/${accountId}/statuses?limit=10`);
