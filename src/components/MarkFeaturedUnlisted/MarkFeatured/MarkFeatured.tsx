import { SizeProp } from '@fortawesome/fontawesome-svg-core';
import { faStar as faEmptyStar } from '@fortawesome/free-regular-svg-icons';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import styled from 'styled-components';

import Tooltip from '@/components/FloatingUI/Tooltip';
import useAuthentication from '@/components/hooks/useAuthentication';
import { VISIBILITY } from '@/constants/contentTypes';
import { Visibility } from '@/services/backend/types';

const StyledIcon = styled(FontAwesomeIcon)`
    cursor: pointer;
`;

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

    const getTooltipContent = () => {
        if (!isCurationAllowed) return 'Featured content';
        return featured ? 'Remove featured badge' : 'Mark as featured';
    };

    return (
        <Tooltip content={getTooltipContent()}>
            <span
                role="checkbox"
                tabIndex={0}
                aria-checked={featured}
                onClick={isCurationAllowed ? () => handleChangeStatus(VISIBILITY.FEATURED) : undefined}
                onKeyDown={isCurationAllowed ? () => handleChangeStatus(VISIBILITY.FEATURED) : undefined}
            >
                <StyledIcon
                    onMouseOver={() => setOver(true)}
                    onMouseLeave={() => setOver(false)}
                    inverse
                    icon={featured || over ? faStar : faEmptyStar}
                    className={featured || over ? 'text-primary' : 'text-secondary'}
                    size={size}
                />
            </span>
        </Tooltip>
    );
};

export default FeaturedMark;
