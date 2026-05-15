import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, ButtonGroup,type ButtonProps } from '@heroui/react';
import { ReactNode } from 'react';

type ConfirmationButtonVariant = NonNullable<ButtonProps['variant']>;

const COLOR_TO_VARIANT: Record<string, ConfirmationButtonVariant> = {
    primary: 'primary',
    secondary: 'secondary',
    tertiary: 'tertiary',
    danger: 'danger',
    success: 'primary',
    warning: 'secondary',
    info: 'secondary',
    light: 'ghost',
};

type ConfirmationTooltipProps = {
    message: ReactNode;
    buttons: {
        title: string;
        color: string;
        icon: IconDefinition;
        action?: () => void;
    }[];
    onClose: () => void;
};

const ConfirmationTooltip = ({ message, buttons, onClose }: ConfirmationTooltipProps) => (
    <div role="alertdialog" aria-label="Confirm action" className="text-center p-1 text-[0.95rem] break-normal">
        <div className="mb-2">{message}</div>
        <ButtonGroup size="sm" className="my-1">
            {buttons.map((button) => (
                <Button
                    key={button.title}
                    variant={COLOR_TO_VARIANT[button.color] ?? 'primary'}
                    className="px-2"
                    onPress={() => {
                        button.action?.();
                        onClose();
                    }}
                >
                    <FontAwesomeIcon icon={button.icon} className="mr-1" />
                    {button.title}
                </Button>
            ))}
        </ButtonGroup>
    </div>
);

export default ConfirmationTooltip;
