import { useState } from 'react';
import { faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { faEyeSlash as faEmptyEyeSlash } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { useSelector } from 'react-redux';
import Tippy from '@tippyjs/react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

const StyledIcon = styled(Icon)`
    cursor: ${props => (props.isButton ? 'pointer' : 'initial')};
`;

const MarkUnlisted = ({ unlisted, size, handleChangeStatus }) => {
    const [over, setOver] = useState(false);

    const isCurationAllowed = useSelector(state => state.auth.user?.isCurationAllowed);

    const buttonTooltip = unlisted ? 'Remove unlisted badge' : 'Mark as unlisted';

    if (!isCurationAllowed && !unlisted) {
        return null;
    }

    return (
        <Tippy
            content={
                isCurationAllowed ? buttonTooltip : 'This resource has been unlisted by a curator as it does not meet the orkg quality standards'
            }
        >
            <span
                role="checkbox"
                tabIndex="0"
                aria-checked={unlisted}
                onClick={isCurationAllowed ? handleChangeStatus : undefined}
                onKeyDown={isCurationAllowed ? handleChangeStatus : undefined}
            >
                <StyledIcon
                    isButton={isCurationAllowed}
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
