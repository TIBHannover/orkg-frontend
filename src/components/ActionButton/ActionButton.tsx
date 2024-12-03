import Tippy from '@tippyjs/react';
import ConfirmationTooltip from 'components/ActionButton/ConfirmationTooltip/ConfirmationTooltip';
import ActionButtonView from 'components/ActionButton/ActionButtonView';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FC, MouseEvent, ReactNode, useRef } from 'react';
import type { Instance } from 'tippy.js';

type ActionButtonProps = {
    title: ReactNode;
    icon: IconDefinition;
    iconSpin?: boolean;
    testId?: string;
    iconSize?: 'xs' | 'sm' | 'lg';
    action?: () => void;
    isDisabled?: boolean;
    appendTo?: 'parent' | Element | ((ref: Element) => Element);
    onVisibilityChange?: (visibility: boolean) => void;
    requireConfirmation?: boolean;
    confirmationMessage?: string;
    interactive?: boolean;
    confirmationButtons?: {
        title: string;
        color: string;
        icon: IconDefinition;
        action?: () => void;
    }[];
};

const ActionButton: FC<ActionButtonProps> = ({
    iconSpin = false,
    requireConfirmation = false,
    interactive = false,
    appendTo = 'parent',
    action = () => {},
    onVisibilityChange,
    title,
    testId,
    icon,
    isDisabled,
    confirmationButtons,
    confirmationMessage,
    iconSize,
}) => {
    const tippy = useRef<Instance | null>(null);
    const confirmButtonRef = useRef<HTMLInputElement>(null);

    const onShown = () => {
        confirmButtonRef.current?.focus();
    };

    const onShow = () => {
        if (onVisibilityChange) {
            onVisibilityChange(true);
        }
    };

    const onHide = () => {
        if (onVisibilityChange) {
            onVisibilityChange(false);
        }
    };

    const closeTippy = () => {
        tippy.current?.hide();
    };

    const handleClick = (e: MouseEvent) => {
        e.stopPropagation();
        if (!requireConfirmation) {
            action();
        }
    };

    const tippyChildren = (
        <ActionButtonView
            title={title}
            icon={icon}
            iconSpin={iconSpin}
            action={handleClick}
            isDisabled={isDisabled}
            size={iconSize}
            testId={testId}
        />
    );

    return requireConfirmation && confirmationButtons?.length && !isDisabled ? (
        <Tippy trigger="mouseenter" content={title}>
            <Tippy
                onShown={onShown}
                onShow={onShow}
                onHide={onHide}
                onCreate={(tippyInst) => {
                    tippy.current = tippyInst;
                }}
                interactive
                trigger="click"
                appendTo={appendTo}
                content={
                    <ConfirmationTooltip
                        tippy={tippy}
                        message={confirmationMessage}
                        closeTippy={closeTippy}
                        ref={confirmButtonRef}
                        buttons={confirmationButtons}
                    />
                }
            >
                {tippyChildren}
            </Tippy>
        </Tippy>
    ) : (
        <Tippy appendTo={appendTo} hideOnClick={false} interactive={interactive} trigger="mouseenter" content={title}>
            {tippyChildren}
        </Tippy>
    );
};

export default ActionButton;
