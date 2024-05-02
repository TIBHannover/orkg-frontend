import Tippy from '@tippyjs/react';
import ConfirmationTooltip from 'components/StatementBrowser/ConfirmationTooltip/ConfirmationTooltip';
import ActionButtonView from 'components/StatementBrowser/StatementActionButton/ActionButtonView';
import { FC, MouseEvent, ReactNode, useRef } from 'react';

type StatementActionButtonProps = {
    title: ReactNode;
    icon: object;
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
        icon: object;
        action?: () => void;
    }[];
};

const StatementActionButton: FC<StatementActionButtonProps> = ({
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
    const tippy = useRef<typeof Tippy>(null);
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
        // @ts-expect-error
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
            // @ts-expect-error
            title={title}
            icon={icon}
            iconSpin={iconSpin}
            action={handleClick}
            isDisabled={isDisabled}
            size={iconSize}
            testId={testId}
        />
    );

    return requireConfirmation && !isDisabled ? (
        <Tippy trigger="mouseenter" content={title}>
            <Tippy
                onShown={onShown}
                onShow={onShow}
                onHide={onHide}
                // @ts-expect-error
                onCreate={(tippyInst) => (tippy.current = tippyInst)}
                interactive
                trigger="click"
                appendTo={appendTo}
                content={
                    // @ts-expect-error
                    <ConfirmationTooltip message={confirmationMessage} closeTippy={closeTippy} ref={confirmButtonRef} buttons={confirmationButtons} />
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

export default StatementActionButton;
