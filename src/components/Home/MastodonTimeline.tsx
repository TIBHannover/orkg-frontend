import { faMastodon } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { env } from 'next-runtime-env';
import { sanitize } from 'isomorphic-dompurify';
import moment from 'moment';
import { useCookies } from 'next-client-cookies';
import { useEffect, useState } from 'react';
import { Button, ListGroup, ListGroupItem } from 'reactstrap';
import { Message, loadMastodonTimeline } from 'services/mastodon';
import styled from 'styled-components';

const COOKIE_NAME = 'loadMastodonTimeline';

const MastodonContent = styled.p`
    // this class is used in Mastodon's content, used to hide URL prefixes
    .invisible {
        display: none;
    }
`;

const MastodonTimeline = () => {
    const cookies = useCookies();
    const [isLoading, setIsLoading] = useState(true);
    const [messages, setMessages] = useState<Message[]>([]);

    const handleLoadTimeline = () =>
        cookies.set(COOKIE_NAME, 'true', {
            path: env('NEXT_PUBLIC_PUBLIC_URL'),
            expires: 7,
        });

    const isVisible = cookies.get(COOKIE_NAME);

    useEffect(() => {
        const loadTimeline = async () => {
            setIsLoading(true);
            const _messages = await loadMastodonTimeline();
            setMessages(_messages);
            setIsLoading(false);
        };
        if (isVisible) {
            loadTimeline();
        }
    }, [isVisible]);

    if (!env('NEXT_PUBLIC_MASTODON_URL') || !env('NEXT_PUBLIC_MASTODON_ACCOUNT_ID')) {
        return null;
    }

    return !isVisible ? (
        <div className="mt-3 box rounded overflow-hidden p-3 d-flex align-items-center">
            <Button className="flex-shrink-0 px-2 border-0" onClick={handleLoadTimeline}>
                <FontAwesomeIcon icon={faMastodon} /> Load Toots
            </Button>
            <small className="ps-3">
                By loading the Mastodon widget, you agree with the{' '}
                <a
                    href="https://mastodon.social/privacy-policy"
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: 'inherit' }}
                    className="text-decoration-underline"
                >
                    cookie guidelines
                </a>
            </small>
        </div>
    ) : (
        <div className="mt-3 box rounded">
            {isLoading ? (
                <div className="text-center py-4">Loading...</div>
            ) : (
                <div>
                    <div className="px-3 pt-3">
                        <h2 className="h5 mb-0 mt-0">Latest Mastodon posts</h2>
                        <hr className="mt-2 mb-0" />
                    </div>
                    <ListGroup className="overflow-auto rounded" flush style={{ maxHeight: 400 }}>
                        {messages.map((activity: Message) => {
                            const message = activity.reblog ? activity.reblog : activity; // reblog is used for showing somebody else's toot

                            return (
                                <ListGroupItem key={message.id}>
                                    <div className="d-flex align-items-center">
                                        <img
                                            src={message.account?.avatar}
                                            alt="ORKG Mastodon avatar showing a knowledge graph icon"
                                            className="h-auto flex-grow-0 me-3"
                                            style={{ maxWidth: 40 }}
                                        />
                                        <div className="my-1">
                                            <a href={message.account?.url} className="text-body" target="_blank" rel="noopener noreferrer">
                                                {message.account?.display_name}
                                            </a>
                                            <br />
                                            <small className="text-muted">@{message.account?.username}@mastodon.social</small>
                                        </div>
                                    </div>
                                    <MastodonContent
                                        style={{ fontSize: '90%' }}
                                        className="pt-2"
                                        dangerouslySetInnerHTML={{ __html: sanitize(message.content) }}
                                    />
                                    <div className="d-flex justify-content-between align-items-center">
                                        <a href={message.url} target="_blank" rel="noopener noreferrer">
                                            <Button color="link" size="sm" className="p-0">
                                                <FontAwesomeIcon icon={faMastodon} className="text-primary me-2" />
                                                View on Mastodon
                                            </Button>
                                        </a>
                                        <small className="text-muted">{moment(message.created_at).fromNow()}</small>
                                    </div>
                                </ListGroupItem>
                            );
                        })}

                        <ListGroupItem className="text-center">
                            <a href={messages?.[0]?.account?.url} target="_blank" rel="noopener noreferrer">
                                <Button color="light" size="sm">
                                    View more on Mastodon
                                </Button>
                            </a>
                        </ListGroupItem>
                    </ListGroup>
                </div>
            )}
        </div>
    );
};

export default MastodonTimeline;
