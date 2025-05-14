import { SizeProp } from '@fortawesome/fontawesome-svg-core';
import { faEyeSlash as faEmptyEyeSlash } from '@fortawesome/free-regular-svg-icons';
import { faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import styled from 'styled-components';

import Tooltip from '@/components/FloatingUI/Tooltip';
import useAuthentication from '@/components/hooks/useAuthentication';
import { VISIBILITY } from '@/constants/contentTypes';
import { Visibility } from '@/services/backend/types';

const StyledIcon = styled(FontAwesomeIcon)<{ $isButton: boolean }>`
    cursor: ${(props) => (props.$isButton ? 'pointer' : 'initial')};
`;

type MarkUnlistedProps = {
    unlisted: boolean;
    size: SizeProp;
    handleChangeStatus: (flagName: Visibility) => void;
};

const MarkUnlisted = ({ unlisted = false, size = '1x', handleChangeStatus }: MarkUnlistedProps) => {
    const [over, setOver] = useState(false);

    const { isCurationAllowed } = useAuthentication();

    const buttonTooltip = unlisted ? 'Remove unlisted badge' : 'Mark as unlisted';

    if (!isCurationAllowed && !unlisted) {
        return null;
    }

    return (
        <Tooltip
            content={
                isCurationAllowed ? (
                    buttonTooltip
                ) : (
                    <>
                        This resource has been automatically unlisted by the system or by a curator as it does not meet the orkg quality standards.{' '}
                        <a href="https://orkg.org/help-center/article/49/Why_were_my_papers_unlisted" rel="noreferrer" target="_blank">
                            Learn more in the help center
                        </a>
                        .
                    </>
                )
            }
        >
            <span
                role="checkbox"
                tabIndex={0}
                aria-checked={unlisted}
                onClick={isCurationAllowed ? () => handleChangeStatus(VISIBILITY.UNLISTED) : undefined}
                onKeyDown={isCurationAllowed ? () => handleChangeStatus(VISIBILITY.UNLISTED) : undefined}
            >
                <StyledIcon
                    $isButton={isCurationAllowed}
                    onMouseOver={() => setOver(true)}
                    onMouseLeave={() => setOver(false)}
                    inverse
                    icon={unlisted || over ? faEyeSlash : faEmptyEyeSlash}
                    className={unlisted || over ? 'text-primary' : 'text-secondary'}
                    size={size}
                />
            </span>
        </Tooltip>
    );
};

export default MarkUnlisted;
