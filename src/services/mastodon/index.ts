import ky from 'ky';
import { env } from 'next-runtime-env';

export const mastodonUrl = `${env('NEXT_PUBLIC_MASTODON_URL')}`;
const accountId = env('NEXT_PUBLIC_MASTODON_ACCOUNT_ID');
const mastodonApi = ky.create({ prefixUrl: mastodonUrl });

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

export const loadMastodonTimeline = (): Promise<Message[]> =>
    mastodonApi
        .get<Message[]>(`accounts/${accountId}/statuses`, {
            searchParams: 'limit=10',
        })
        .json();
