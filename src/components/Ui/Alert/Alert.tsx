'use client';

import { useMergeRefs } from '@floating-ui/react';
import { Alert as HeroAlert, CloseButton, cn } from '@heroui/react';
import { forwardRef, type ReactNode } from 'react';

type HeroAlertStatus = 'default' | 'accent' | 'success' | 'warning' | 'danger';

export type AlertProps = Omit<React.ComponentPropsWithoutRef<'div'>, 'color'> & {
    children?: ReactNode;
    /** Bootstrap / reactstrap color token; mapped to HeroUI `status` and optional tone classes */
    color?: string;
    /** Ignored; reactstrap fade animation is not replicated */
    fade?: boolean;
    /** When `false`, the alert is not rendered (reactstrap controlled + Fade unmount) */
    isOpen?: boolean;
    /** Renders a dismiss control; calls this handler when pressed */
    toggle?: () => void;
    closeAriaLabel?: string;
    closeClassName?: string;
    cssModule?: unknown;
    innerRef?: React.Ref<HTMLDivElement>;
    transition?: unknown;
    tag?: React.ElementType;
};

function mapColorToStatus(color?: string): HeroAlertStatus {
    const c = color?.toLowerCase();
    switch (c) {
        case 'success':
            return 'success';
        case 'danger':
        case 'error':
            return 'danger';
        case 'warning':
            return 'warning';
        case 'info':
        case 'primary':
            return 'accent';
        case 'smart':
        case 'secondary':
        case 'light':
        case 'light-darker':
        case 'dark':
        default:
            return 'default';
    }
}

function colorToneClassName(color?: string): string | undefined {
    switch (color?.toLowerCase()) {
        case 'smart':
            return '!bg-smart !text-white';
        case 'light':
            return '!bg-secondary-100 dark:bg-secondary-800/40';
        case 'light-darker':
            return '!bg-secondary-200 dark:bg-secondary-700/50';
        default:
            return undefined;
    }
}

const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(
    {
        children,
        className,
        color = 'success',
        fade: _fade,
        isOpen = true,
        toggle,
        closeAriaLabel = 'Close',
        closeClassName,
        cssModule: _cssModule,
        innerRef,
        transition: _transition,
        tag: _tag,
        style,
        ...rest
    },
    ref,
) {
    const mergedRef = useMergeRefs([ref, innerRef]);

    if (isOpen === false) {
        return null;
    }

    const status = mapColorToStatus(color);
    const tone = colorToneClassName(color);

    return (
        <HeroAlert
            ref={mergedRef}
            role="alert"
            status={status}
            className={cn('show', toggle && 'relative pe-10', tone, className)}
            style={style}
            {...rest}
        >
            <HeroAlert.Indicator />
            <HeroAlert.Content className="min-w-0 flex-1">{children}</HeroAlert.Content>
            {toggle ? (
                <CloseButton aria-label={closeAriaLabel} className={cn('absolute end-2 top-2 shrink-0', closeClassName)} onPress={toggle} />
            ) : null}
        </HeroAlert>
    );
});

export default Alert;
