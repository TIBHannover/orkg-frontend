import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ReactNode } from 'react';
import styled from 'styled-components';

import { usePopoverContext } from '@/components/FloatingUI/Popover';
import Button from '@/components/Ui/Button/Button';
import ButtonGroup from '@/components/Ui/Button/ButtonGroup';

const ConfirmationTooltipStyled = styled.div`
    color: #fff;
    font-size: 0.95rem;
    word-break: normal;
    .btn {
        padding-top: 2px;
        padding-bottom: 2px;
    }
`;

type ConfirmationTooltipProps = {
    message: ReactNode;
    buttons: {
        title: string;
        color: string;
        icon: IconDefinition;
        action?: () => void;
    }[];
};

/**
 * This component is made to be a content for a tippy
 * Make sure to use ref props when you use this component
 */
const ConfirmationTooltip = ({ message, buttons }: ConfirmationTooltipProps) => {
    const { setOpen } = usePopoverContext();

    return (
        <ConfirmationTooltipStyled className="text-center p-1">
            <div className="mb-2">{message}</div>
            <ButtonGroup size="sm" className="my-1">
                {buttons.map((button, i) => (
                    <Button
                        onClick={() => {
                            button.action?.();
                            setOpen(false);
                        }}
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
};

export default ConfirmationTooltip;
