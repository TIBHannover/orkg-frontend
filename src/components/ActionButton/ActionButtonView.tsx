import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, cn } from '@heroui/react';
import { isString } from 'lodash';
import { ComponentProps, forwardRef, MouseEvent, ReactNode } from 'react';

const ACTION_BUTTON_SIZE_CLASSES = {
    '2xs': '!h-5 !w-5 !min-w-5',
    xs: '!h-6 !w-6 !min-w-6',
    sm: '!h-8 !w-8 !min-w-8',
    lg: '!h-10 !w-10 !min-w-10',
} as const;

const HERO_BUTTON_SIZE: Record<keyof typeof ACTION_BUTTON_SIZE_CLASSES, 'sm' | 'md' | 'lg'> = {
    '2xs': 'sm',
    xs: 'sm',
    sm: 'md',
    lg: 'lg',
};

export type ActionButtonViewProps = {
    title: ReactNode;
    icon: IconDefinition;
    iconSpin?: boolean;
    size?: '2xs' | 'xs' | 'sm' | 'lg';
    action?: (e: MouseEvent<HTMLButtonElement>) => void;
    isDisabled?: boolean;
    testId?: string;
};

const ActionButtonView = forwardRef<HTMLSpanElement, ActionButtonViewProps>(
    ({ size = 'xs', iconSpin = false, isDisabled, action, title, icon, testId }, ref) => (
        <span ref={ref} className="mr-2">
            <Button
                isIconOnly
                variant="ghost"
                size={HERO_BUTTON_SIZE[size]}
                isDisabled={isDisabled}
                aria-label={isString(title) ? title : title?.toString()}
                data-testid={testId}
                className={cn(
                    'inline-flex shrink-0 items-center justify-center rounded-full border-0 p-0',
                    '!bg-default !text-dark',
                    'hover:!bg-secondary-solid hover:!text-white',
                    'aria-[disabled=true]:!bg-default aria-[disabled=true]:opacity-100',
                    'focus-visible:ring-2 focus-visible:ring-[rgba(203,206,209,0.5)]',
                    ACTION_BUTTON_SIZE_CLASSES[size],
                )}
                render={(props: ComponentProps<'button'>) => (
                    <button
                        {...props}
                        type="button"
                        onClick={(e) => {
                            props.onClick?.(e);
                            action?.(e);
                        }}
                    />
                )}
            >
                <FontAwesomeIcon size={size} icon={icon} spin={iconSpin} />
            </Button>
        </span>
    ),
);

ActionButtonView.displayName = 'ActionButtonView';

export default ActionButtonView;
