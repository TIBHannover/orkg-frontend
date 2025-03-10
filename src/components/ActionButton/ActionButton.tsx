import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faCheck, faSpinner, faTimes } from '@fortawesome/free-solid-svg-icons';
import ActionButtonView from 'components/ActionButton/ActionButtonView';
import ConfirmationTooltip from 'components/FloatingUI/ConfirmationTooltip/ConfirmationTooltip';
import Popover from 'components/FloatingUI/Popover';
import Tooltip from 'components/FloatingUI/Tooltip';
import { FC, ReactNode, useState } from 'react';

export type ActionButtonProps = {
    title: ReactNode;
    icon: IconDefinition;
    iconSpin?: boolean;
    testId?: string;
    iconSize?: 'xs' | 'sm' | 'lg';
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
        {
            title: 'Delete',
            color: 'danger',
            icon: faCheck,
            action,
        },
        {
            title: 'Cancel',
            color: 'secondary',
            icon: faTimes,
        },
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

    const handleClick = () => {
        if (!requireConfirmation) {
            action();
        } else {
            setOpen(true);
        }
    };

    const tippyChildren = (
        <ActionButtonView
            title={title}
            icon={!isLoading ? icon : faSpinner}
            iconSpin={!isLoading ? iconSpin : true}
            action={handleClick}
            isDisabled={!isLoading ? isDisabled : true}
            size={iconSize}
            testId={testId}
        />
    );

    return requireConfirmation && confirmationButtons?.length && !isDisabled ? (
        <Tooltip content={title}>
            <Popover
                open={open}
                onOpenChange={setOpen}
                content={<ConfirmationTooltip message={confirmationMessage} buttons={confirmationButtons} />}
                modal
            >
                {tippyChildren}
            </Popover>
        </Tooltip>
    ) : (
        <Tooltip content={title}>{tippyChildren}</Tooltip>
    );
};

export default ActionButton;
