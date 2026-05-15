import { faMastodon } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, ScrollShadow } from '@heroui/react';
import dayjs from 'dayjs';
import DOMPurify from 'isomorphic-dompurify';
import { useCookies } from 'next-client-cookies';
import { env } from 'next-runtime-env';
import useSWR from 'swr';

import { loadMastodonTimeline, Message } from '@/services/mastodon';

const COOKIE_NAME = 'loadMastodonTimeline';

const MastodonTimeline = () => {
    const cookies = useCookies();
    const isVisible = cookies.get(COOKIE_NAME);

    const { data: messages, isLoading } = useSWR(isVisible ? 'mastodonTimeline' : null, loadMastodonTimeline);

    const handleLoadTimeline = () =>
        cookies.set(COOKIE_NAME, 'true', {
            path: env('NEXT_PUBLIC_PUBLIC_URL'),
            expires: 7,
        });

    if (!env('NEXT_PUBLIC_MASTODON_URL') || !env('NEXT_PUBLIC_MASTODON_ACCOUNT_ID')) {
        return null;
    }

    return !isVisible ? (
        <div className="box rounded overflow-hidden p-4 flex items-center">
            <Button className="shrink-0 px-2 border-0" onPress={handleLoadTimeline}>
                <FontAwesomeIcon icon={faMastodon} /> Load Toots
            </Button>
            <small className="pl-4">
                By loading the Mastodon widget, you agree with the{' '}
                <a href="https://mastodon.social/privacy-policy" target="_blank" rel="noreferrer" className="text-inherit underline">
                    cookie guidelines
                </a>
            </small>
        </div>
    ) : (
        <div className="box rounded">
            {isLoading ? (
                <div className="text-center py-6">Loading...</div>
            ) : (
                <div>
                    <div className="px-4 pt-4">
                        <h2 className="text-xl mb-0 mt-0">Latest Mastodon posts</h2>
                        <hr className="mt-2 mb-0" />
                    </div>
                    <ScrollShadow className="max-h-[400px]" orientation="vertical">
                        <ul className="m-0 flex w-full flex-col divide-y divide-border list-none rounded-none border-0 bg-surface p-0">
                            {messages?.map((activity: Message) => {
                                const message = activity.reblog ? activity.reblog : activity;

                                return (
                                    <li key={message.id} className="block w-full min-w-0 bg-surface px-4 py-2 text-foreground">
                                        <div className="flex items-center">
                                            <img
                                                src={message.account?.avatar}
                                                alt="ORKG Mastodon avatar showing a knowledge graph icon"
                                                className="h-auto grow-0 mr-4 max-w-10"
                                            />
                                            <div className="my-1">
                                                <a href={message.account?.url} className="text-foreground" target="_blank" rel="noopener noreferrer">
                                                    {message.account?.display_name}
                                                </a>
                                                <br />
                                                <small className="text-muted">@{message.account?.username}@mastodon.social</small>
                                            </div>
                                        </div>
                                        <p
                                            style={{ fontSize: '90%' }}
                                            className="pt-2 [&_.invisible]:hidden"
                                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(message.content) }}
                                        />
                                        <div className="flex justify-between items-center">
                                            <a
                                                href={message.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 text-sm text-accent hover:text-accent-darker transition-colors no-underline"
                                            >
                                                <FontAwesomeIcon icon={faMastodon} />
                                                View on Mastodon
                                            </a>
                                            <small className="text-muted">{dayjs(message.created_at)?.fromNow()}</small>
                                        </div>
                                    </li>
                                );
                            })}

                            <li className="block w-full min-w-0 border-0 bg-surface px-4 py-2 text-foreground text-center">
                                <a href={messages?.[0]?.account?.url} target="_blank" rel="noopener noreferrer">
                                    <Button variant="ghost" size="sm">
                                        View more on Mastodon
                                    </Button>
                                </a>
                            </li>
                        </ul>
                    </ScrollShadow>
                </div>
            )}
        </div>
    );
};

export default MastodonTimeline;
