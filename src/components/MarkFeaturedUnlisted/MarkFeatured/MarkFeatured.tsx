import { SizeProp } from '@fortawesome/fontawesome-svg-core';
import { faStar as faEmptyStar } from '@fortawesome/free-regular-svg-icons';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Tooltip } from '@heroui/react';
import { useState } from 'react';

import useAuthentication from '@/components/hooks/useAuthentication';
import { VISIBILITY } from '@/constants/contentTypes';
import { Visibility } from '@/services/backend/types';

type MarkFeaturedProps = {
    featured: boolean;
    size: SizeProp;
    handleChangeStatus: (flagName: Visibility) => void;
};

const FeaturedMark = ({ featured = false, size = '1x', handleChangeStatus }: MarkFeaturedProps) => {
    const [over, setOver] = useState(false);
    const { isCurationAllowed } = useAuthentication();

    if (!isCurationAllowed && !featured) {
        return null;
    }

    const tooltipContent = !isCurationAllowed ? 'Featured content' : featured ? 'Remove featured badge' : 'Mark as featured';

    return (
        <Tooltip>
            <Tooltip.Trigger className="inline-flex">
                <span
                    role="checkbox"
                    tabIndex={0}
                    aria-checked={featured}
                    aria-label="Featured"
                    className={isCurationAllowed ? 'cursor-pointer' : undefined}
                    onClick={isCurationAllowed ? () => handleChangeStatus(VISIBILITY.FEATURED) : undefined}
                    onKeyDown={isCurationAllowed ? () => handleChangeStatus(VISIBILITY.FEATURED) : undefined}
                >
                    <FontAwesomeIcon
                        onMouseOver={() => setOver(true)}
                        onMouseLeave={() => setOver(false)}
                        icon={featured || over ? faStar : faEmptyStar}
                        className={featured || over ? 'text-accent' : 'text-foreground-400'}
                        size={size}
                    />
                </span>
            </Tooltip.Trigger>
            <Tooltip.Content>{tooltipContent}</Tooltip.Content>
        </Tooltip>
    );
};

export default FeaturedMark;
