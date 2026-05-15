import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Tooltip } from '@heroui/react';
import { FC } from 'react';

type HelpIconProps = {
    content: string;
};

const HelpIcon: FC<HelpIconProps> = ({ content }) => (
    <Tooltip delay={150}>
        <Tooltip.Trigger className="inline-flex" aria-label="Show help">
            <FontAwesomeIcon size="sm" icon={faQuestionCircle} className="text-muted" />
        </Tooltip.Trigger>
        <Tooltip.Content showArrow className="max-w-xs text-sm">
            <Tooltip.Arrow />
            {content}
        </Tooltip.Content>
    </Tooltip>
);

export default HelpIcon;
