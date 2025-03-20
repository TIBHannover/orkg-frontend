import { faStar as faEmptyStar } from '@fortawesome/free-regular-svg-icons';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Tooltip from 'components/FloatingUI/Tooltip';
import useAuthentication from 'components/hooks/useAuthentication';
import PropTypes from 'prop-types';
import { useState } from 'react';
import styled from 'styled-components';

const StyledIcon = styled(FontAwesomeIcon)`
    cursor: pointer;
`;

const FeaturedMark = ({ featured = false, size = '1x', handleChangeStatus }) => {
    const [over, setOver] = useState(false);
    const { isCurationAllowed } = useAuthentication();

    if (!isCurationAllowed && !featured) {
        return null;
    }
    return (
        <Tooltip content={isCurationAllowed ? (featured ? 'Remove featured badge' : 'Mark as featured') : 'Featured content'}>
            <span
                role="checkbox"
                tabIndex="0"
                aria-checked={featured}
                onClick={isCurationAllowed ? () => handleChangeStatus('featured') : undefined}
                onKeyDown={isCurationAllowed ? () => handleChangeStatus('featured') : undefined}
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

FeaturedMark.propTypes = {
    featured: PropTypes.bool,
    size: PropTypes.string.isRequired,
    handleChangeStatus: PropTypes.func.isRequired,
};

export default FeaturedMark;
