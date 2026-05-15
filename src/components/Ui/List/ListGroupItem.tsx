import { cn } from '@heroui/react';
import { createElement, forwardRef, type HTMLAttributes, type MouseEvent } from 'react';

export type ListGroupItemProps = HTMLAttributes<HTMLElement> & {
    tag?: React.ElementType;
    active?: boolean;
    disabled?: boolean;
    action?: boolean;
    /** @deprecated Ignored; reactstrap compatibility */
    color?: string;
    /** @deprecated Ignored; reactstrap compatibility */
    cssModule?: unknown;
};

const ListGroupItem = forwardRef<HTMLElement, ListGroupItemProps>(function ListGroupItem(
    { tag: Tag = 'li', active, disabled, action, color, className, cssModule, onClick, ...rest },
    ref,
) {
    void color;
    void cssModule;
    const handleClick = (e: MouseEvent<HTMLElement>) => {
        if (disabled) {
            e.preventDefault();
            return;
        }
        onClick?.(e);
    };

    return createElement(Tag, {
        ...rest,
        ref,
        className: cn(
            'block w-full min-w-0 border-0 bg-surface px-4 py-2 text-foreground',
            active && 'bg-default/25',
            disabled && 'pointer-events-none opacity-50',
            action && !disabled && 'cursor-pointer transition-colors hover:bg-default/40',
            className,
        ),
        'aria-disabled': disabled || undefined,
        onClick: handleClick,
    });
});

ListGroupItem.displayName = 'ListGroupItem';

export default ListGroupItem;
