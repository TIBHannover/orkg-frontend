'use client';

import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { cn, Label, ListBox, Popover, Separator, toast } from '@heroui/react';
import Link from 'next/link';
import { useState } from 'react';
import useSWR from 'swr';

import Gravatar from '@/components/Gravatar/Gravatar';
import useAuthentication from '@/components/hooks/useAuthentication';
import ROUTES from '@/constants/routes';
import greetingTime from '@/lib/greetingTime';
import sha256Hex from '@/lib/hash';
import { reverse } from '@/lib/namedRoute';
import { getUserInformation, userUrl } from '@/services/backend/users';
import { federatedLogout, visitAccountUrl } from '@/services/keycloak';

const UserTooltip = () => {
    const { user: _user } = useAuthentication();

    const { data: user, isLoading } = useSWR(_user ? [null, userUrl, 'getUserInformation'] : null, () => getUserInformation());

    const email = user?.email ? user?.email : 'example@example.com';

    const { data: hashedEmail, isLoading: isHashedEmailLoading } = useSWR(user && email ? [email, 'sha256Hex'] : null, ([params]) =>
        sha256Hex(params),
    );

    const [isOpen, setIsOpen] = useState(false);
    const greeting = greetingTime(new Date());

    const handleSignOut = async () => {
        try {
            setIsOpen(false);
            await federatedLogout({ redirectUri: window.location.href });
            toast.success('Signed out successfully');
        } catch (error) {
            console.error(error);
        }
    };

    if (isLoading || isHashedEmailLoading) {
        return (
            <div className="relative ml-2 flex items-center">
                <FontAwesomeIcon size="xl" icon={faSpinner} spin />
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="relative ml-2 flex items-center">
            <Popover isOpen={isOpen} onOpenChange={setIsOpen}>
                <Popover.Trigger
                    aria-label="User menu"
                    className={cn(
                        'inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full outline-none',
                        'ring-1 ring-dark transition-shadow hover:ring-accent focus-visible:ring-accent',
                    )}
                >
                    <Gravatar className="rounded-full" hashedEmail={hashedEmail ?? ''} size={32} />
                </Popover.Trigger>
                <Popover.Content placement="bottom end" className="w-max max-w-[550px] overflow-hidden p-0">
                    <Popover.Dialog className="p-0">
                        <div className="flex items-center gap-4 bg-secondary-solid p-4 text-white">
                            <Link
                                onClick={() => setIsOpen(false)}
                                href={reverse(ROUTES.USER_PROFILE, { userId: user.id })}
                                className="hidden shrink-0 sm:block"
                            >
                                <Gravatar
                                    className="rounded-full border-3 border-white transition-colors hover:border-accent"
                                    hashedEmail={hashedEmail ?? ''}
                                    size={76}
                                />
                            </Link>
                            <span>
                                {greeting} {user.display_name}
                            </span>
                        </div>
                        <ListBox
                            aria-label="User actions"
                            selectionMode="none"
                            className="p-1 [&_a]:no-underline"
                            onAction={(key) => {
                                switch (key) {
                                    case 'settings':
                                        setIsOpen(false);
                                        visitAccountUrl(window.location.href);
                                        break;
                                    case 'sign-out':
                                        handleSignOut();
                                        break;
                                    default:
                                        setIsOpen(false);
                                        break;
                                }
                            }}
                        >
                            <ListBox.Item textValue="Profile" href={reverse(ROUTES.USER_PROFILE, { userId: user.id })}>
                                <Label>Profile</Label>
                            </ListBox.Item>
                            <ListBox.Item id="settings" textValue="Settings">
                                <Label>Settings</Label>
                            </ListBox.Item>
                            <ListBox.Item textValue="My drafts" href={reverse(ROUTES.USER_SETTINGS_DEFAULT)}>
                                <Label>My drafts</Label>
                            </ListBox.Item>
                            <Separator />
                            <ListBox.Item id="sign-out" textValue="Sign out" variant="danger">
                                <Label>Sign out</Label>
                            </ListBox.Item>
                        </ListBox>
                    </Popover.Dialog>
                </Popover.Content>
            </Popover>
        </div>
    );
};

export default UserTooltip;
