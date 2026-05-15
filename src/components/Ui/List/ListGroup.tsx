import { cn } from '@heroui/react';
import { createElement, forwardRef, type HTMLAttributes } from 'react';

export type ListGroupProps = HTMLAttributes<HTMLElement> & {
    tag?: React.ElementType;
    flush?: boolean;
    horizontal?: boolean | string;
    numbered?: boolean;
    /** @deprecated Ignored; reactstrap compatibility */
    cssModule?: unknown;
};

const ListGroup = forwardRef<HTMLElement, ListGroupProps>(function ListGroup(
    { tag: Tag = 'ul', flush, horizontal = false, numbered = false, className, cssModule, ...rest },
    ref,
) {
    void cssModule;
    const useHorizontal = Boolean(horizontal) && !flush;

    return createElement(Tag, {
        ref,
        className: cn(
            'm-0 flex w-full bg-surface p-0',
            useHorizontal ? 'flex-row flex-wrap divide-x divide-border' : cn('flex-col divide-y divide-border', !numbered && 'list-none'),
            flush ? 'rounded-none border-0' : 'overflow-hidden rounded-[var(--radius)] border border-border',
            numbered && 'list-decimal ps-8',
            className,
        ),
        ...rest,
    });
});

ListGroup.displayName = 'ListGroup';

export default ListGroup;
