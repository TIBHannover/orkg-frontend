import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';

import Tooltip from '@/components/FloatingUI/Tooltip';

const TooltipQuestion = ({ children, message }) => (
    <Tooltip contentStyle={{ maxWidth: '300px' }} content={message}>
        <span>
            {children ?? ''} <FontAwesomeIcon icon={faQuestionCircle} className="text-primary" />
        </span>
    </Tooltip>
);

TooltipQuestion.propTypes = {
    children: PropTypes.node,
    message: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
};

export default TooltipQuestion;
