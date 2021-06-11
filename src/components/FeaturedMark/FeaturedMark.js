import { useState, useEffect } from 'react';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import { faStar as faEmptyStar } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { markAsFeatured, removeFeaturedFlag } from 'services/backend/resources';
import { useSelector } from 'react-redux';
import Tippy from '@tippyjs/react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

const StyledIcon = styled(Icon)`
    cursor: pointer;
`;

const FeaturedMark = ({ resourceId, featured, size }) => {
    const [over, setOver] = useState(false);
    const [isFeatured, setIsFeatured] = useState(featured);
    const isCurationAllowed = useSelector(state => state.auth.user?.isCurationAllowed);

    const handleChangeStatus = () => {
        setIsFeatured(v => !v);
        if (!isFeatured) {
            markAsFeatured(resourceId).catch(e => console.log(e));
        } else {
            removeFeaturedFlag(resourceId).catch(e => console.log(e));
        }
    };

    useEffect(() => {
        setIsFeatured(featured);
    }, [featured]);

    if (!isCurationAllowed && !isFeatured) {
        return null;
    }
    return (
        <Tippy content={isCurationAllowed ? (isFeatured ? 'Remove featured badge' : 'Mark as featured') : 'Featured content'}>
            <span
                role="checkbox"
                tabIndex="0"
                aria-checked={isFeatured}
                onClick={isCurationAllowed ? handleChangeStatus : undefined}
                onKeyDown={isCurationAllowed ? handleChangeStatus : undefined}
            >
                <StyledIcon
                    onMouseOver={() => setOver(true)}
                    onMouseLeave={() => setOver(false)}
                    inverse={true}
                    icon={isFeatured || over ? faStar : faEmptyStar}
                    className="text-primary"
                    size={size}
                />
            </span>
        </Tippy>
    );
};

FeaturedMark.propTypes = {
    resourceId: PropTypes.string.isRequired,
    featured: PropTypes.bool,
    size: PropTypes.string.isRequired
};

FeaturedMark.defaultProps = {
    featured: false,
    size: '1x'
};

export default FeaturedMark;
