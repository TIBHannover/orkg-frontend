import { useState } from 'react';
import { faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { faEyeSlash as faEmptyEyeSlash } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { useSelector } from 'react-redux';
import Tippy from '@tippyjs/react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

const StyledIcon = styled(Icon)`
    cursor: pointer;
`;

const MarkUnlisted = ({ unlisted, size, handleChangeStatus }) => {
    const [over, setOver] = useState(false);

    const isCurationAllowed = useSelector(state => state.auth.user?.isCurationAllowed);

    if (!isCurationAllowed) {
        return null;
    }
    return (
        <Tippy content={isCurationAllowed ? (unlisted ? 'Remove unlisted badge' : 'Mark as unlisted') : 'Unlisted content'}>
            <span
                role="checkbox"
                tabIndex="0"
                aria-checked={unlisted}
                onClick={isCurationAllowed ? handleChangeStatus : undefined}
                onKeyDown={isCurationAllowed ? handleChangeStatus : undefined}
            >
                <StyledIcon
                    onMouseOver={() => setOver(true)}
                    onMouseLeave={() => setOver(false)}
                    inverse={true}
                    icon={unlisted || over ? faEyeSlash : faEmptyEyeSlash}
                    className={unlisted || over ? 'text-primary' : 'text-secondary'}
                    size={size}
                />
            </span>
        </Tippy>
    );
};

MarkUnlisted.propTypes = {
    unlisted: PropTypes.bool,
    size: PropTypes.string.isRequired,
    handleChangeStatus: PropTypes.func.isRequired,
};

MarkUnlisted.defaultProps = {
    unlisted: false,
    size: '1x',
};

export default MarkUnlisted;
