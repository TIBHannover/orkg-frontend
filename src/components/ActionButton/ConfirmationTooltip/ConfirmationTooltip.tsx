import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { MutableRefObject, ReactNode, RefObject, createRef, forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { Button, ButtonGroup } from 'reactstrap';
import styled from 'styled-components';
import type { Instance } from 'tippy.js';

const ConfirmationTooltipStyled = styled.div`
    color: #fff;
    font-size: 0.95rem;
    word-break: normal;
    .btn {
        padding-top: 2px;
        padding-bottom: 2px;
    }
`;

export type ConfirmationTooltipHandle = {
    focus: () => void;
};

type ConfirmationTooltipProps = {
    message: ReactNode;
    closeTippy: () => void;
    buttons: {
        title: string;
        color: string;
        icon: IconDefinition;
        action?: () => void;
    }[];
    tippy?: MutableRefObject<Instance | null>;
};

/**
 * This component is made to be a content for a tippy
 * Make sure to use ref props when you use this component
 */
const ConfirmationTooltip = forwardRef<ConfirmationTooltipHandle, ConfirmationTooltipProps>(({ message, closeTippy, buttons, tippy }, ref) => {
    const buttonsRef = useRef<RefObject<HTMLButtonElement>[]>([]);

    if (buttonsRef.current.length !== buttons.length) {
        buttonsRef.current = Array(buttons.length)
            .fill(undefined)
            .map((_, i) => buttonsRef.current[i] || createRef<HTMLButtonElement>());
    }

    useImperativeHandle(ref, () => ({
        focus: () => {
            buttonsRef.current[0].current?.focus();
        },
    }));

    useEffect(() => {
        const onKeyPressed = (e: KeyboardEvent) => {
            if (e.code === 'Escape') {
                closeTippy();
            }
            if (e.code === 'Tab' && tippy?.current?.state.isShown) {
                e.preventDefault();
                e.stopPropagation();
                // focus on next button
                for (const [index, button] of buttonsRef.current.entries()) {
                    const nextIndex = (index + 1) % buttons.length;
                    if (document.activeElement === button.current) {
                        buttonsRef.current[nextIndex]?.current?.focus();
                        break;
                    }
                }
            }
        };
        document.addEventListener('keydown', onKeyPressed);

        return () => {
            document.removeEventListener('keydown', onKeyPressed);
        };
    }, [closeTippy, buttons.length, tippy?.current?.state.isShown, tippy]);

    return (
        <ConfirmationTooltipStyled className="text-center p-1">
            <div className="mb-2">{message}</div>
            <ButtonGroup size="sm" className="my-1">
                {buttons.map((button, i) => (
                    <Button
                        onClick={() => {
                            button.action?.();
                            closeTippy();
                        }}
                        innerRef={buttonsRef.current[i]}
                        className="px-2"
                        key={i}
                        color={button.color}
                    >
                        <FontAwesomeIcon icon={button.icon} className="me-1" />
                        {button.title}
                    </Button>
                ))}
            </ButtonGroup>
        </ConfirmationTooltipStyled>
    );
});

ConfirmationTooltip.displayName = 'ConfirmationTooltip';

export default ConfirmationTooltip;
