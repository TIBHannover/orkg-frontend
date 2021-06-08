import { useState } from 'react';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import { faStar as faEmptyStar } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { markAsFeatured, removeFeaturedFlag } from 'services/backend/resources';
import Tippy from '@tippyjs/react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

const StyledIcon = styled(Icon)`
    cursor: pointer;
`;

const FeaturedMark = ({ resourceId, featured, size }) => {
    const [over, setOver] = useState(false);
    const [isFeatured, setIsFeatured] = useState(featured);

    const handleChangeStatus = () => {
        setIsFeatured(v => !v);
        if (isFeatured) {
            markAsFeatured(resourceId).catch(e => console.log(e));
        } else {
            removeFeaturedFlag(resourceId).catch(e => console.log(e));
        }
    };

    return (
        <Tippy content={isFeatured ? 'Remove featured badge' : 'Mark as featured'}>
            <span role="checkbox" tabIndex="0" aria-checked={isFeatured} onClick={handleChangeStatus} onKeyDown={handleChangeStatus}>
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
    featured: PropTypes.bool.isRequired,
    size: PropTypes.string.isRequired
};

FeaturedMark.defaultProps = {
    featured: false,
    size: 'md'
};

export default FeaturedMark;
