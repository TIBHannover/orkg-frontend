'use client';

import { faBug } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Card, Disclosure } from '@heroui/react';
import { BotInfo, BrowserInfo, detect, NodeInfo, ReactNativeInfo, SearchBotDeviceInfo } from 'detect-browser';
import Link from 'next/link';
import { AnchorHTMLAttributes, FC, useEffect, useState } from 'react';

import Logo from '@/assets/img/logo.svg';
import ROUTES from '@/constants/routes';

type ErrorFallbackProps = {
    error: Error;
};

const ErrorFallback: FC<ErrorFallbackProps> = ({ error }) => {
    const [isExpanded, setIsExpanded] = useState<boolean>(false);
    const browser: BrowserInfo | SearchBotDeviceInfo | BotInfo | NodeInfo | ReactNativeInfo | null = detect();

    useEffect(() => {
        document.title = 'Something went wrong - ORKG';
    }, []);

    const issueHref = `https://gitlab.com/TIBHannover/orkg/orkg-frontend/-/issues/new?issue[title]=${error}&issue[description]=%0A%0A%0A%23%23%23 Error details%0AError: ${error}%0A%0ALocation: ${
        typeof window !== 'undefined' ? window.location.href : ''
    }%0A%0ABrowser: ${JSON.stringify(browser)}`;

    return (
        <div>
            <div className="mx-auto max-w-container px-3 py-6">
                <Link href={ROUTES.HOME} className="mr-4 mb-1 inline-block">
                    <Logo />
                </Link>
            </div>
            <div className="mx-auto max-w-container px-3">
                <div className="box rounded-lg px-12 py-6">
                    <div className="mx-auto flex flex-col items-center text-center">
                        <h1 className="text-3xl font-light">Something went wrong!</h1>
                        <FontAwesomeIcon icon={faBug} className="text-accent mt-4 mb-4" style={{ fontSize: 30 }} />
                        <p className="mb-6 text-lg text-muted">
                            We&apos;re sorry about this! Please try again or report an issue to help fix this problem
                        </p>
                        <div className="flex flex-wrap justify-center gap-3">
                            <Button render={(props) => <Link {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)} href={ROUTES.HOME} />}>
                                Back to home
                            </Button>
                            <Button
                                variant="outline"
                                render={(props) => (
                                    <a
                                        {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}
                                        href={issueHref}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    />
                                )}
                            >
                                Report an issue in Gitlab
                            </Button>
                        </div>
                        <Disclosure className="mt-4 w-full" isExpanded={isExpanded} onExpandedChange={setIsExpanded}>
                            <Disclosure.Heading className="flex justify-center">
                                <Button slot="trigger" size="sm" variant="ghost" className="text-muted">
                                    {isExpanded ? 'Hide' : 'Show'} error details
                                    <Disclosure.Indicator />
                                </Button>
                            </Disclosure.Heading>
                            <Disclosure.Content>
                                <Disclosure.Body>
                                    <Card variant="secondary" className="mt-3 text-left">
                                        <Card.Content>
                                            <b>Error:</b> {error?.message}
                                            <br />
                                            <b>Location:</b> {typeof window !== 'undefined' ? window.location.href : ''}
                                            <br />
                                            <b>Browser:</b> {JSON.stringify(browser)}
                                        </Card.Content>
                                    </Card>
                                </Disclosure.Body>
                            </Disclosure.Content>
                        </Disclosure>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ErrorFallback;
