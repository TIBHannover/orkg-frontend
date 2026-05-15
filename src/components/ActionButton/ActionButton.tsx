import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faCheck, faSpinner, faTimes } from '@fortawesome/free-solid-svg-icons';
import { Popover, Tooltip } from '@heroui/react';
import { FC, ReactNode, useState } from 'react';

import ActionButtonView from '@/components/ActionButton/ActionButtonView';
import ConfirmationTooltip from '@/components/FloatingUI/ConfirmationTooltip/ConfirmationTooltip';

export type ActionButtonProps = {
    title: ReactNode;
    icon: IconDefinition;
    iconSpin?: boolean;
    testId?: string;
    iconSize?: '2xs' | 'xs' | 'sm' | 'lg';
    action?: () => void;
    isDisabled?: boolean;
    open?: boolean;
    setOpen?: (isOpen: boolean) => void;
    requireConfirmation?: boolean;
    confirmationMessage?: string;
    confirmationButtons?: {
        title: string;
        color: string;
        icon: IconDefinition;
        action?: () => void;
    }[];
    isLoading?: boolean;
};

const ActionButton: FC<ActionButtonProps> = ({
    iconSpin = false,
    requireConfirmation = false,
    action = () => {},
    title,
    testId,
    icon,
    isDisabled,
    confirmationButtons = [
        { title: 'Delete', color: 'danger', icon: faCheck, action },
        { title: 'Cancel', color: 'secondary', icon: faTimes },
    ],
    confirmationMessage = 'Are you sure?',
    iconSize,
    isLoading = false,
    setOpen: setControlledOpen,
    open: controlledOpen,
}) => {
    const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
    const open = controlledOpen ?? uncontrolledOpen;
    const setOpen = setControlledOpen ?? setUncontrolledOpen;

    const showConfirmation = requireConfirmation && confirmationButtons?.length && !isDisabled;

    const trigger = (
        <ActionButtonView
            title={title}
            icon={!isLoading ? icon : faSpinner}
            iconSpin={!isLoading ? iconSpin : true}
            action={showConfirmation ? undefined : action}
            isDisabled={!isLoading ? isDisabled : true}
            size={iconSize}
            testId={testId}
        />
    );

    const wrappedTrigger = showConfirmation ? (
        <Popover isOpen={open} onOpenChange={setOpen}>
            {trigger}
            <Popover.Content>
                <Popover.Dialog>
                    <Popover.Arrow />
                    <ConfirmationTooltip onClose={() => setOpen(false)} message={confirmationMessage} buttons={confirmationButtons} />
                </Popover.Dialog>
            </Popover.Content>
        </Popover>
    ) : (
        trigger
    );

    return (
        <Tooltip delay={0} isDisabled={open}>
            <Tooltip.Trigger>{wrappedTrigger}</Tooltip.Trigger>
            <Tooltip.Content showArrow>
                <Tooltip.Arrow />
                {title}
            </Tooltip.Content>
        </Tooltip>
    );
};

export default ActionButton;
