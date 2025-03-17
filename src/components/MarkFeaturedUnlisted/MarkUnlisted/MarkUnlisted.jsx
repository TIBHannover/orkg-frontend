import { faEyeSlash as faEmptyEyeSlash } from '@fortawesome/free-regular-svg-icons';
import { faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Tooltip from 'components/FloatingUI/Tooltip';
import useAuthentication from 'components/hooks/useAuthentication';
import PropTypes from 'prop-types';
import { useState } from 'react';
import styled from 'styled-components';

const StyledIcon = styled(FontAwesomeIcon)`
    cursor: ${(props) => (props.$isButton ? 'pointer' : 'initial')};
`;

const MarkUnlisted = ({ unlisted = false, size = '1x', handleChangeStatus }) => {
    const [over, setOver] = useState(false);

    const { isCurationAllowed } = useAuthentication();

    const buttonTooltip = unlisted ? 'Remove unlisted badge' : 'Mark as unlisted';

    if (!isCurationAllowed && !unlisted) {
        return null;
    }

    return (
        <Tooltip
            content={
                isCurationAllowed ? (
                    buttonTooltip
                ) : (
                    <>
                        This resource has been automatically unlisted by the system or by a curator as it does not meet the orkg quality standards.{' '}
                        <a href="https://orkg.org/help-center/article/49/Why_were_my_papers_unlisted" rel="noreferrer" target="_blank">
                            Learn more in the help center
                        </a>
                        .
                    </>
                )
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
                    $isButton={isCurationAllowed}
                    onMouseOver={() => setOver(true)}
                    onMouseLeave={() => setOver(false)}
                    inverse
                    icon={unlisted || over ? faEyeSlash : faEmptyEyeSlash}
                    className={unlisted || over ? 'text-primary' : 'text-secondary'}
                    size={size}
                />
            </span>
        </Tooltip>
    );
};

MarkUnlisted.propTypes = {
    unlisted: PropTypes.bool,
    size: PropTypes.string.isRequired,
    handleChangeStatus: PropTypes.func.isRequired,
};

export default MarkUnlisted;
