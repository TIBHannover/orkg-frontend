import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, type ButtonProps as HeroUIButtonProps } from '@heroui/react';
import { type ElementType, forwardRef, type ReactNode } from 'react';

type HeroUIVariant = NonNullable<HeroUIButtonProps['variant']>;

const COLOR_TO_VARIANT: Record<string, HeroUIVariant> = {
    primary: 'primary',
    secondary: 'secondary',
    danger: 'danger',
    light: 'ghost',
    link: 'ghost',
    dark: 'secondary',
};

type DropdownToggleProps = {
    children?: ReactNode;
    caret?: boolean;
    color?: string;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    tag?: ElementType;
    disabled?: boolean;
    nav?: boolean;
    split?: boolean;
} & Omit<HeroUIButtonProps, 'variant' | 'size' | 'className' | 'isDisabled' | 'children' | 'color'>;

const DropdownToggle = forwardRef<HTMLButtonElement, DropdownToggleProps>(
    ({ children, caret, color, size, className, tag: _tag, disabled, nav: _nav, split: _split, ...rest }, ref) => {
        const variant: HeroUIVariant = COLOR_TO_VARIANT[color ?? ''] ?? 'secondary';

        return (
            <Button ref={ref} variant={variant} size={size} className={className} isDisabled={disabled} {...rest}>
                {children}
                {caret && <FontAwesomeIcon icon={faChevronDown} className="ms-1 text-xs" />}
            </Button>
        );
    },
);

DropdownToggle.displayName = 'DropdownToggle';

export default DropdownToggle;
