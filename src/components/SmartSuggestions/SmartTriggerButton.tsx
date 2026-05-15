import { faLightbulb } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from '@heroui/react';
import { forwardRef } from 'react';

type SmartTriggerButtonProps = {
    onPress: () => void;
    ariaLabel?: string;
    absolute?: boolean;
    className?: string;
};

const SmartTriggerButton = forwardRef<HTMLButtonElement, SmartTriggerButtonProps>(
    ({ onPress, ariaLabel = 'Smart suggestions', absolute = false, className = '' }, ref) => (
        <Button
            ref={ref}
            isIconOnly
            size="sm"
            aria-label={ariaLabel}
            onPress={onPress}
            style={absolute ? { right: 5, top: 5 } : undefined}
            className={`bg-smart text-white hover:bg-smart-darker border-0 ${absolute ? 'absolute' : ''} ${className}`}
        >
            <FontAwesomeIcon icon={faLightbulb} style={{ fontSize: '120%' }} />
        </Button>
    ),
);

SmartTriggerButton.displayName = 'SmartTriggerButton';

export default SmartTriggerButton;
