import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { isString } from 'lodash';
import { forwardRef, MouseEvent, ReactNode } from 'react';
import styled from 'styled-components';

import Button from '@/components/Ui/Button/Button';

const handleIconWrapperSize = (wrapperSize: string) => {
    switch (wrapperSize) {
        case '2xs':
            return '1.25rem';
        case 'xs':
            return '1.5rem';
        case 'lg':
            return '2.5rem';
        case 'sm':
            return '2rem';
        default:
            return '1.5rem';
    }
};

type OptionButtonStyledProps = {
    wrappersize: string;
    theme: {
        dark: string;
        lightDarker: string;
        secondary: string;
    };
};

export const OptionButtonStyled = styled(Button)<OptionButtonStyledProps>`
    border-radius: 100%;
    background-color: ${(props) => props.theme.lightDarker};
    color: ${(props) => props.theme.dark};
    border-width: 0;

    /* to override bootstrap button styles because var(--bs-btn-disabled-bg) is not defined */
    &.disabled {
        background-color: ${(props) => props.theme.lightDarker};
    }

    & .icon-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        height: ${({ wrappersize }) => handleIconWrapperSize(wrappersize)};
        width: ${({ wrappersize }) => handleIconWrapperSize(wrappersize)};
    }

    &:hover {
        background-color: ${(props) => props.theme.secondary};
        color: #fff;
    }

    &:focus {
        box-shadow: 0 0 0 0.2rem rgba(203, 206, 209, 0.5);
    }
`;

export type ActionButtonViewProps = {
    title: ReactNode;
    icon: IconDefinition;
    iconSpin?: boolean;
    size?: '2xs' | 'xs' | 'sm' | 'lg';
    action?: (e: MouseEvent) => void;
    isDisabled?: boolean;
    testId?: string;
};

const ActionButtonView = forwardRef<HTMLSpanElement, ActionButtonViewProps>(
    ({ size = 'xs', iconSpin = false, isDisabled, action, title, icon, testId }, ref) => (
        <span ref={ref} className="me-2">
            <OptionButtonStyled
                className="d-inline-block p-0"
                wrappersize={size}
                disabled={isDisabled}
                color="link"
                onClick={action}
                aria-label={isString(title) ? title : title?.toString()}
                data-testid={testId}
            >
                <span className="icon-wrapper">
                    <FontAwesomeIcon size={size} icon={icon} spin={iconSpin} />
                </span>
            </OptionButtonStyled>
        </span>
    ),
);

ActionButtonView.displayName = 'ActionButtonView';

export default ActionButtonView;
