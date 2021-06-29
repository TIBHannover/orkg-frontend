import { useState } from 'react';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import { faStar as faEmptyStar } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { useSelector } from 'react-redux';
import Tippy from '@tippyjs/react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

const StyledIcon = styled(Icon)`
    cursor: pointer;
`;

const FeaturedMark = ({ featured, size, handleChangeStatus }) => {
    const [over, setOver] = useState(false);
    const isCurationAllowed = useSelector(state => state.auth.user?.isCurationAllowed);

    if (!isCurationAllowed && !featured) {
        return null;
    }
    return (
        <Tippy content={isCurationAllowed ? (featured ? 'Remove featured badge' : 'Mark as featured') : 'Featured content'}>
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
                    inverse={true}
                    icon={featured || over ? faStar : faEmptyStar}
                    className="text-primary"
                    size={size}
                />
            </span>
        </Tippy>
    );
};

FeaturedMark.propTypes = {
    featured: PropTypes.bool,
    size: PropTypes.string.isRequired,
    handleChangeStatus: PropTypes.func.isRequired
};

FeaturedMark.defaultProps = {
    featured: false,
    size: '1x'
};

export default FeaturedMark;
