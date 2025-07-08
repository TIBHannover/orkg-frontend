import {
    arrow,
    autoUpdate,
    flip,
    FloatingArrow,
    FloatingFocusManager,
    FloatingPortal,
    inline,
    offset,
    shift,
    useClick,
    useDismiss,
    useFloating,
    useInteractions,
    useMergeRefs,
    useRole,
    useTransitionStatus,
} from '@floating-ui/react';
import { cloneElement, createContext, forwardRef, isValidElement, useContext, useMemo, useRef, useState } from 'react';

import { FloatingContentStyled } from '@/components/FloatingUI/styled';
import { BaseFloatingOptions, FloatingComponentProps, FloatingContentProps, FloatingTriggerProps } from '@/components/FloatingUI/types';

type PopoverOptions = BaseFloatingOptions & {
    modal?: boolean;
};

export function usePopover({
    initialOpen = false,
    disabled = false,
    placement = 'top',
    open: controlledOpen,
    onOpenChange: setControlledOpen,
    onTrigger,
    showArrow = true,
    arrowFill = '#444',
    modal,
}: PopoverOptions = {}) {
    const [uncontrolledOpen, setUncontrolledOpen] = useState(initialOpen);
    const arrowRef = useRef(null);

    const open = controlledOpen ?? uncontrolledOpen;
    const setOpen = setControlledOpen ?? setUncontrolledOpen;

    const data = useFloating({
        placement,
        open,
        onOpenChange: (_open) => {
            if (disabled) return;
            setOpen(_open);
            onTrigger?.(_open);
        },
        whileElementsMounted: autoUpdate,
        middleware: [
            inline(),
            offset(5),
            flip({
                crossAxis: placement.includes('-'),
                fallbackAxisSideDirection: 'start',
                padding: 5,
            }),
            shift({ padding: 5 }),
            ...(showArrow ? [arrow({ element: arrowRef })] : []),
        ],
    });

    const { context } = data;

    const click = useClick(context, {
        enabled: controlledOpen == null,
    });
    const dismiss = useDismiss(context);
    const role = useRole(context);

    const interactions = useInteractions([click, dismiss, role]);

    return useMemo(
        () => ({
            open,
            setOpen,
            ...interactions,
            ...data,
            modal,
            arrowRef,
            showArrow,
            arrowFill,
        }),
        [open, setOpen, interactions, data, modal, arrowRef, showArrow, arrowFill],
    );
}

type ContextType = ReturnType<typeof usePopover> | null;

const PopoverContext = createContext<ContextType>(null);

export const usePopoverContext = () => {
    const context = useContext(PopoverContext);

    if (context == null) {
        throw new Error('Popover components must be wrapped in <Popover />');
    }

    return context;
};

export const PopoverTrigger = forwardRef<HTMLElement, React.HTMLProps<HTMLElement> & FloatingTriggerProps>(function PopoverTrigger(
    { children, asChild = true, ...props },
    propRef,
) {
    const context = usePopoverContext();
    const childrenRef = (children as any).ref;
    const ref = useMergeRefs([context.refs.setReference, propRef, childrenRef]);

    // `asChild` allows the user to pass any element as the anchor
    if (asChild && isValidElement(children)) {
        return cloneElement(
            children,
            context.getReferenceProps({
                ref,
                ...props,
                ...(children.props as any),
                'data-state': context.open ? 'open' : 'closed',
            }),
        );
    }

    return (
        <button
            ref={ref}
            type="button"
            // The user can style the trigger based on the state
            data-state={context.open ? 'open' : 'closed'}
            {...context.getReferenceProps(props)}
        >
            {children}
        </button>
    );
});

export const PopoverContent = forwardRef<HTMLDivElement, FloatingContentProps>(function PopoverContent({ style, ...props }, propRef) {
    const { context: floatingContext, ...context } = usePopoverContext();
    const { isMounted, status } = useTransitionStatus(floatingContext, {
        duration: {
            open: 300,
            close: 250,
        },
    });
    const ref = useMergeRefs([context.refs.setFloating, propRef]);

    if (!floatingContext.open) return null;

    return (
        isMounted && (
            <FloatingPortal>
                <FloatingFocusManager context={floatingContext} modal={context.modal}>
                    <FloatingContentStyled
                        data-status={status}
                        ref={ref}
                        style={{ ...context.floatingStyles, ...style }}
                        {...context.getFloatingProps(props)}
                    >
                        {props.children}
                        {context.showArrow && <FloatingArrow ref={context.arrowRef} context={floatingContext} fill={context.arrowFill ?? '#444'} />}
                    </FloatingContentStyled>
                </FloatingFocusManager>
            </FloatingPortal>
        )
    );
});

// ForwardRef is used to make popover can be used as a child of tooltip
const Popover = forwardRef<HTMLDivElement, FloatingComponentProps & PopoverOptions>(
    ({ children, content, contentStyle, ...restOptions }, propRef) => {
        const popover = usePopover({ ...restOptions });
        const childrenRef = (children as any).ref;
        const ref = useMergeRefs([popover.refs.setReference, propRef, childrenRef]);
        return (
            <PopoverContext.Provider value={popover}>
                <PopoverTrigger ref={ref}>{children}</PopoverTrigger>
                {content && <PopoverContent {...(contentStyle && { style: contentStyle })}>{content}</PopoverContent>}
            </PopoverContext.Provider>
        );
    },
);

Popover.displayName = 'Popover';

export default Popover;
