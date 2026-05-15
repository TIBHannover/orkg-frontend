import { SizeProp } from '@fortawesome/fontawesome-svg-core';
import { faEyeSlash as faEmptyEyeSlash } from '@fortawesome/free-regular-svg-icons';
import { faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Tooltip } from '@heroui/react';
import { useState } from 'react';

import FloatingTooltip from '@/components/FloatingUI/Tooltip';
import useAuthentication from '@/components/hooks/useAuthentication';
import { VISIBILITY } from '@/constants/contentTypes';
import { Visibility } from '@/services/backend/types';

type MarkUnlistedProps = {
    unlisted: boolean;
    size: SizeProp;
    handleChangeStatus: (flagName: Visibility) => void;
};

const MarkUnlisted = ({ unlisted = false, size = '1x', handleChangeStatus }: MarkUnlistedProps) => {
    const [over, setOver] = useState(false);

    const { isCurationAllowed } = useAuthentication();

    if (!isCurationAllowed && !unlisted) {
        return null;
    }

    const icon = (
        <span
            role="checkbox"
            tabIndex={0}
            aria-checked={unlisted}
            aria-label="Unlisted"
            className={isCurationAllowed ? 'cursor-pointer' : undefined}
            onClick={isCurationAllowed ? () => handleChangeStatus(VISIBILITY.UNLISTED) : undefined}
            onKeyDown={isCurationAllowed ? () => handleChangeStatus(VISIBILITY.UNLISTED) : undefined}
        >
            <FontAwesomeIcon
                onMouseOver={() => setOver(true)}
                onMouseLeave={() => setOver(false)}
                icon={unlisted || over ? faEyeSlash : faEmptyEyeSlash}
                className={unlisted || over ? 'text-accent' : 'text-foreground-400'}
                size={size}
            />
        </span>
    );

    // Non-curator tooltip has an interactive link, so use FloatingUI Tooltip
    if (!isCurationAllowed) {
        return (
            <FloatingTooltip
                content={
                    <>
                        This resource has been automatically unlisted by the system or by a curator as it does not meet the orkg quality standards.{' '}
                        <a href="https://orkg.org/help-center/article/49/Why_were_my_papers_unlisted" rel="noreferrer" target="_blank">
                            Learn more in the help center
                        </a>
                        .
                    </>
                }
            >
                {icon}
            </FloatingTooltip>
        );
    }

    const buttonTooltip = unlisted ? 'Remove unlisted badge' : 'Mark as unlisted';

    return (
        <Tooltip>
            <Tooltip.Trigger className="inline-flex">{icon}</Tooltip.Trigger>
            <Tooltip.Content>{buttonTooltip}</Tooltip.Content>
        </Tooltip>
    );
};

export default MarkUnlisted;
