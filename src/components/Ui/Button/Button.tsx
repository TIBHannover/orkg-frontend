import { Button as HeroUIButton, type ButtonProps as HeroUIButtonProps } from '@heroui/react';
import { isString } from 'lodash';
import { type ElementType, forwardRef } from 'react';

type HeroUIVariant = NonNullable<HeroUIButtonProps['variant']>;

const COLOR_TO_VARIANT: Record<string, HeroUIVariant> = {
    primary: 'primary',
    secondary: 'secondary',
    danger: 'danger',
    light: 'ghost',
    link: 'ghost',
    dark: 'secondary',
    success: 'primary',
    warning: 'secondary',
    info: 'secondary',
};

export type ButtonProps = Omit<HeroUIButtonProps, 'color'> & {
    color?: string;
    outline?: boolean;
    disabled?: boolean;
    tag?: ElementType;
    active?: boolean;
    block?: boolean;
    innerRef?: React.Ref<HTMLButtonElement>;
    href?: string;
    target?: string;
    rel?: string;
    title?: string;
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ color, outline, disabled, isDisabled, tag, active, block, fullWidth, innerRef, size, variant, href, target, rel, children, ...rest }, ref) => {
        const resolvedVariant: HeroUIVariant = variant ?? (outline ? 'outline' : (COLOR_TO_VARIANT[color ?? ''] ?? 'primary'));
        const resolvedSize = size === ('xs' as string) ? 'sm' : size;
        const resolvedRef = innerRef ?? ref;

        // HeroUI ButtonGroup injects this marker via cloneElement on direct children;
        // peel it off `rest` and forward it explicitly so HeroUI Button can consume it
        // without tripping React's unknown-DOM-attribute warning when `tag` is a DOM element.
        const { __button_group_child, ...domRest } = rest as typeof rest & { __button_group_child?: boolean };

        const commonProps = {
            variant: resolvedVariant,
            isDisabled: isDisabled ?? disabled,
            fullWidth: fullWidth ?? block,
            'aria-label': isString(domRest.title) ? domRest.title : domRest['aria-label'],
            size: resolvedSize as HeroUIButtonProps['size'],
            ...(active ? { 'data-active': 'true' } : {}),
            ...(color && !COLOR_TO_VARIANT[color] ? { 'data-color': color } : {}),
            ...(__button_group_child !== undefined ? { __button_group_child } : {}),
            ...domRest,
        };

        if (tag || href) {
            const Tag = tag || 'a';
            const linkProps: Record<string, string> = {};
            if (href) linkProps.href = href;
            if (target) linkProps.target = target;
            if (rel) linkProps.rel = rel;

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const renderFn = (props: any) => {
                const TagComponent = Tag as any; // eslint-disable-line @typescript-eslint/no-explicit-any
                return <TagComponent {...props} {...linkProps} />;
            };

            return (
                <HeroUIButton ref={resolvedRef} {...(commonProps as HeroUIButtonProps)} render={renderFn}>
                    {children}
                </HeroUIButton>
            );
        }

        return (
            <HeroUIButton ref={resolvedRef} {...(commonProps as HeroUIButtonProps)}>
                {children}
            </HeroUIButton>
        );
    },
);

Button.displayName = 'Button';

export default Button;
