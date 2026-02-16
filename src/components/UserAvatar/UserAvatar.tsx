import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { reverse } from 'named-urls';
import Link from 'next/link';
import { FC, ReactNode } from 'react';
import styled from 'styled-components';

import Tooltip from '@/components/FloatingUI/Tooltip';
import Gravatar from '@/components/Gravatar/Gravatar';
import useContributor from '@/components/hooks/useContributor';
import { MISC } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';

export const StyledGravatar = styled(Gravatar)`
    border: 2px solid ${(props) => props.theme.lightDarker};
    cursor: pointer;
    &:hover {
        border: 2px solid ${(props) => props.theme.primary};
    }
`;

type StyledSpinnerGravatarProps = {
    size?: number;
};

const StyledSpinnerGravatar = styled.div<StyledSpinnerGravatarProps>`
    width: ${(props) => props.size}px;
    height: ${(props) => props.size}px;
    display: inline-block;
    text-align: center;
    line-height: ${(props) => props.size}px;
    color: ${(props) => props.theme.secondary};
    border: 2px solid ${(props) => props.theme.lightDarker};
    cursor: pointer;
    vertical-align: sub;
    &:hover {
        border: 2px solid ${(props) => props.theme.primary};
    }

    background-color: ${(props) => props.theme.lightDarker};
`;

type UserAvatarProps = {
    userId?: string;
    size?: number;
    appendToTooltip?: ReactNode;
    showDisplayName?: boolean;
    linkTarget?: string;
};

const UserAvatar: FC<UserAvatarProps> = ({ userId, size = 28, appendToTooltip = '', showDisplayName = false, linkTarget = '_self' }) => {
    const { contributor, isLoadingContributor } = useContributor({ userId });

    if (userId && userId !== MISC.UNKNOWN_ID) {
        return (
            <Tooltip
                placement="bottom"
                content={
                    <>
                        {contributor?.display_name}
                        {appendToTooltip}
                    </>
                }
                disabled={showDisplayName || !userId || !contributor || isLoadingContributor}
            >
                <span tabIndex={0}>
                    <Link href={reverse(ROUTES.USER_PROFILE, { userId })} target={linkTarget}>
                        {!isLoadingContributor && (
                            <>
                                <StyledGravatar
                                    className="rounded-circle"
                                    hashedEmail={contributor?.gravatar_id ?? 'example@example.com'}
                                    size={size}
                                />
                                {showDisplayName && !isLoadingContributor && <> {contributor?.display_name}</>}
                            </>
                        )}
                        {userId && isLoadingContributor && (
                            <StyledSpinnerGravatar className="rounded-circle" size={size}>
                                <FontAwesomeIcon icon={faSpinner} spin />
                            </StyledSpinnerGravatar>
                        )}
                    </Link>
                </span>
            </Tooltip>
        );
    }
    if (userId === MISC.UNKNOWN_ID) {
        return (
            <Tooltip placement="bottom" content={`Unknown users ${appendToTooltip}`}>
                <span>
                    <StyledGravatar className="rounded-circle" hashedEmail={userId} size={size} />
                    {showDisplayName && !isLoadingContributor && <> Anonymous user</>}
                </span>
            </Tooltip>
        );
    }
    return (
        <StyledSpinnerGravatar className="rounded-circle" size={size}>
            <FontAwesomeIcon icon={faSpinner} spin />
        </StyledSpinnerGravatar>
    );
};

export default UserAvatar;
