import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Tippy from '@tippyjs/react';
import PropTypes from 'prop-types';

const Tooltip = ({ children, message, tippyProps = {} }) => {
    return (
        <Tippy content={message} {...tippyProps}>
            <span>
                {children} <FontAwesomeIcon icon={faQuestionCircle} className="text-primary" />
            </span>
        </Tippy>
    );
};

Tooltip.propTypes = {
    children: PropTypes.node,
    message: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
    tippyProps: PropTypes.object
};

export default Tooltip;
