import { useState, useEffect } from 'react';
import { faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { faEyeSlash as faEmptyEyeSlash } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { markAsUnlisted, removeUnlistedFlag } from 'services/backend/resources';
import { useSelector } from 'react-redux';
import Tippy from '@tippyjs/react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

const StyledIcon = styled(Icon)`
    cursor: pointer;
`;

const MarkUnlisted = ({ resourceId, unlisted, size }) => {
    const [over, setOver] = useState(false);
    const [isUnlisted, setIsUnlisted] = useState(unlisted);
    const isCurationAllowed = useSelector(state => state.auth.user?.isCurationAllowed);

    const handleChangeStatus = () => {
        setIsUnlisted(v => !v);
        if (!isUnlisted) {
            markAsUnlisted(resourceId).catch(e => console.log(e));
        } else {
            removeUnlistedFlag(resourceId).catch(e => console.log(e));
        }
    };

    useEffect(() => {
        setIsUnlisted(unlisted);
    }, [unlisted]);

    if (!isCurationAllowed) {
        return null;
    }
    return (
        <Tippy content={isCurationAllowed ? (isUnlisted ? 'Remove unlisted badge' : 'Mark as unlisted') : 'Unlisted content'}>
            <span
                role="checkbox"
                tabIndex="0"
                aria-checked={isUnlisted}
                onClick={isCurationAllowed ? handleChangeStatus : undefined}
                onKeyDown={isCurationAllowed ? handleChangeStatus : undefined}
            >
                <StyledIcon
                    onMouseOver={() => setOver(true)}
                    onMouseLeave={() => setOver(false)}
                    inverse={true}
                    icon={isUnlisted || over ? faEyeSlash : faEmptyEyeSlash}
                    className="text-primary"
                    size={size}
                />
            </span>
        </Tippy>
    );
};

MarkUnlisted.propTypes = {
    resourceId: PropTypes.string.isRequired,
    unlisted: PropTypes.bool,
    size: PropTypes.string.isRequired
};

MarkUnlisted.defaultProps = {
    unlisted: false,
    size: '1x'
};

export default MarkUnlisted;
