import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ReactNode } from 'react';

import Tooltip from '@/components/FloatingUI/Tooltip';

interface TooltipQuestionProps {
    children?: ReactNode;
    message: ReactNode;
}

const TooltipQuestion = ({ children, message }: TooltipQuestionProps) => (
    <Tooltip contentStyle={{ maxWidth: '300px' }} content={message}>
        <span>
            {children ?? ''} <FontAwesomeIcon icon={faQuestionCircle} className="text-primary" />
        </span>
    </Tooltip>
);

export default TooltipQuestion;
