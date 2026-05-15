import { Dropdown, Separator } from '@heroui/react';
import { type CSSProperties, forwardRef, type ReactNode } from 'react';

type DropdownItemProps = {
    children?: ReactNode;
    onClick?: (e?: unknown) => void;
    divider?: boolean;
    header?: boolean;
    disabled?: boolean;
    active?: boolean;
    className?: string;
    tag?: unknown;
    href?: string;
    target?: string;
    rel?: string;
    toggle?: boolean;
    style?: CSSProperties;
};

const DropdownItem = forwardRef<HTMLDivElement, DropdownItemProps>(
    ({ children, onClick, divider, header, disabled, className, tag: _tag, href, target, rel, toggle: _toggle, active: _active, ...rest }, ref) => {
        if (divider) return <Separator />;

        const textValue = typeof children === 'string' ? children : undefined;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const itemProps: any = {
            ref,
            className,
            isDisabled: disabled,
            ...(textValue ? { textValue } : {}),
            ...(onClick ? { onAction: () => onClick() } : {}),
            ...(href ? { href, target, rel } : {}),
            ...rest,
        };

        if (header) {
            return (
                <Dropdown.Item {...itemProps} className={`font-semibold text-sm ${className ?? ''}`}>
                    {children}
                </Dropdown.Item>
            );
        }

        return <Dropdown.Item {...itemProps}>{children}</Dropdown.Item>;
    },
);

DropdownItem.displayName = 'DropdownItem';

export default DropdownItem;
