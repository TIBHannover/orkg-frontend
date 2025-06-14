import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { reverse } from 'named-urls';
import Link from 'next/link';
import { FC } from 'react';
import Gravatar from 'react-gravatar';
import styled from 'styled-components';

import Tooltip from '@/components/FloatingUI/Tooltip';
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

const StyledUserAvatar = styled.span`
    &:hover .react-gravatar {
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
    appendToTooltip?: string;
    showDisplayName?: boolean;
    linkTarget?: string;
};

const UserAvatar: FC<UserAvatarProps> = ({ userId, size = 28, appendToTooltip = '', showDisplayName = false, linkTarget = '_self' }) => {
    const { contributor, isLoadingContributor } = useContributor({ userId });

    if (userId && userId !== MISC.UNKNOWN_ID) {
        return (
            <Tooltip
                placement="bottom"
                content={`${contributor?.display_name}${appendToTooltip}`}
                disabled={showDisplayName || !userId || !contributor || isLoadingContributor}
            >
                <StyledUserAvatar tabIndex={0}>
                    <Link href={reverse(ROUTES.USER_PROFILE, { userId })} target={linkTarget}>
                        {!isLoadingContributor && (
                            <>
                                <StyledGravatar className="rounded-circle" md5={contributor?.gravatar_id ?? 'example@example.com'} size={size} />
                                {showDisplayName && !isLoadingContributor && <> {contributor?.display_name}</>}
                            </>
                        )}
                        {userId && isLoadingContributor && (
                            <StyledSpinnerGravatar className="rounded-circle" size={size}>
                                <FontAwesomeIcon icon={faSpinner} spin />
                            </StyledSpinnerGravatar>
                        )}
                    </Link>
                </StyledUserAvatar>
            </Tooltip>
        );
    }
    if (userId === MISC.UNKNOWN_ID) {
        return (
            <Tooltip placement="bottom" content={`Unknown users ${appendToTooltip}`}>
                <span>
                    <StyledGravatar className="rounded-circle" md5={userId} size={size} />
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
