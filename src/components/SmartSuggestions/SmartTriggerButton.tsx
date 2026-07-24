import { faLightbulb } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from '@heroui/react';
import { forwardRef } from 'react';

type SmartTriggerButtonProps = {
    ariaLabel?: string;
    absolute?: boolean;
    className?: string;
};

/**
 * Opens the smart suggestions panel. It is always rendered as the child of a `SmartSuggestions`
 * popover, which supplies the press behaviour through react-aria's press context — the button must
 * not handle the press itself, or the panel would be toggled twice per click and never open.
 */
const SmartTriggerButton = forwardRef<HTMLButtonElement, SmartTriggerButtonProps>(
    ({ ariaLabel = 'Smart suggestions', absolute = false, className = '' }, ref) => (
        <Button
            ref={ref}
            isIconOnly
            size="sm"
            aria-label={ariaLabel}
            style={absolute ? { right: 5, top: 5 } : undefined}
            className={`bg-smart text-white hover:bg-smart-darker border-0 ${absolute ? 'absolute' : ''} ${className}`}
        >
            <FontAwesomeIcon icon={faLightbulb} style={{ fontSize: '120%' }} />
        </Button>
    ),
);

SmartTriggerButton.displayName = 'SmartTriggerButton';

export default SmartTriggerButton;
