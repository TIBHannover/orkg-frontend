import { Avatar, Spinner, Tooltip } from '@heroui/react';
import Link from 'next/link';
import { FC, ReactNode } from 'react';

import useContributor from '@/components/hooks/useContributor';
import { MISC } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';

type UserAvatarProps = {
    userId?: string;
    size?: number;
    appendToTooltip?: ReactNode;
    showDisplayName?: boolean;
    linkTarget?: string;
};

const getGravatarUrl = (hashedEmail: string, size: number) => `https://gravatar.com/avatar/${hashedEmail}?s=${size}&d=retro&r=g`;

const UserAvatar: FC<UserAvatarProps> = ({ userId, size = 28, appendToTooltip = '', showDisplayName = false, linkTarget = '_self' }) => {
    const { contributor, isLoadingContributor } = useContributor({ userId });

    const loadingFallback = (
        <Avatar style={{ width: size, height: size }} className="cursor-pointer border-2 border-default hover:border-primary">
            <Avatar.Fallback>
                <Spinner size="sm" />
            </Avatar.Fallback>
        </Avatar>
    );

    if (userId && userId !== MISC.UNKNOWN_ID) {
        const showTooltip = !showDisplayName && !!userId && !!contributor && !isLoadingContributor;

        const avatarContent = (
            <Link
                href={reverse(ROUTES.USER_PROFILE, { userId })}
                target={linkTarget}
                className="group inline-flex items-center gap-1.5 align-middle"
                aria-label={!showDisplayName ? contributor?.displayName : undefined}
            >
                {!isLoadingContributor ? (
                    <>
                        <Avatar
                            style={{ width: size, height: size }}
                            className="cursor-pointer border-2 border-default transition-colors group-hover:border-accent"
                        >
                            <Avatar.Image alt="" src={getGravatarUrl(contributor?.gravatarId ?? 'example@example.com', size)} />
                            <Avatar.Fallback>??</Avatar.Fallback>
                        </Avatar>
                        {showDisplayName && <span>{contributor?.displayName}</span>}
                    </>
                ) : (
                    loadingFallback
                )}
            </Link>
        );

        if (!showTooltip) {
            return avatarContent;
        }

        return (
            <Tooltip>
                <Tooltip.Trigger>{avatarContent}</Tooltip.Trigger>
                <Tooltip.Content>
                    {contributor?.displayName}
                    {appendToTooltip}
                </Tooltip.Content>
            </Tooltip>
        );
    }

    if (userId === MISC.UNKNOWN_ID) {
        const content = (
            <span className="group inline-flex items-center gap-1.5 align-middle">
                <Avatar
                    style={{ width: size, height: size }}
                    className="cursor-pointer border-2 border-default transition-colors group-hover:border-accent"
                >
                    <Avatar.Image alt="" src={getGravatarUrl(userId, size)} />
                    <Avatar.Fallback>??</Avatar.Fallback>
                </Avatar>
                {showDisplayName && <span>Anonymous user</span>}
            </span>
        );

        return (
            <Tooltip>
                <Tooltip.Trigger>{content}</Tooltip.Trigger>
                <Tooltip.Content>Unknown users {appendToTooltip}</Tooltip.Content>
            </Tooltip>
        );
    }

    return loadingFallback;
};

export default UserAvatar;
