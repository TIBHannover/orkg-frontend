import {
    arrow,
    autoUpdate,
    flip,
    FloatingArrow,
    FloatingPortal,
    offset,
    safePolygon,
    shift,
    useDismiss,
    useFloating,
    useFocus,
    useHover,
    useInteractions,
    useMergeRefs,
    useRole,
    useTransitionStatus,
} from '@floating-ui/react';
import {
    cloneElement,
    createContext,
    forwardRef,
    isValidElement,
    type ReactElement,
    type Ref,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';

import { FloatingContentStyled } from '@/components/FloatingUI/styled';
import { BaseFloatingOptions, FloatingComponentProps, FloatingContentProps, FloatingTriggerProps } from '@/components/FloatingUI/types';

export function useTooltip({
    initialOpen = false,
    disabled = false,
    placement = 'top',
    open: controlledOpen,
    onOpenChange: setControlledOpen,
    onTrigger,
    showArrow = true,
    arrowFill = '#444',
}: BaseFloatingOptions = {}) {
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

    const hover = useHover(context, {
        move: false,
        enabled: controlledOpen == null && !disabled,
        handleClose: safePolygon(),
    });
    const focus = useFocus(context, {
        enabled: controlledOpen == null && !disabled,
    });
    const dismiss = useDismiss(context);
    const role = useRole(context, { role: 'tooltip' });

    const interactions = useInteractions([hover, focus, dismiss, role]);

    // Ensure tooltip closes immediately when it becomes disabled
    useEffect(() => {
        if (disabled && open) {
            setOpen(false);
        }
    }, [disabled, open, setOpen]);

    return useMemo(
        () => ({
            open,
            setOpen,
            ...interactions,
            ...data,
            arrowRef,
            disabled,
            showArrow,
            arrowFill,
        }),
        [open, setOpen, interactions, data, arrowRef, disabled, showArrow, arrowFill],
    );
}

type ContextType = ReturnType<typeof useTooltip> | null;

const TooltipContext = createContext<ContextType>(null);

export const useTooltipContext = () => {
    const context = useContext(TooltipContext);

    if (context == null) {
        throw new Error('Tooltip components must be wrapped in <Tooltip />');
    }

    return context;
};

export const TooltipTrigger = forwardRef<HTMLElement, React.HTMLProps<HTMLElement> & FloatingTriggerProps>(function TooltipTrigger(
    { children, asChild = true, ...props },
    propRef,
) {
    const context = useTooltipContext();
    const childrenRef = isValidElement(children) ? (children as ReactElement & { ref?: Ref<HTMLElement> }).ref : undefined;
    const ref = useMergeRefs([context.refs.setReference, propRef, childrenRef]);

    // `asChild` allows the user to pass any element as the anchor
    if (asChild && isValidElement(children)) {
        return cloneElement(children, context.getReferenceProps({ ref, ...props }));
    }

    return (
        <button
            ref={ref}
            type="button" // The user can style the trigger based on the state
            data-state={context.open ? 'open' : 'closed'}
            {...context.getReferenceProps(props)}
        >
            {children}
        </button>
    );
});

export const TooltipContent = forwardRef<HTMLDivElement, FloatingContentProps>(function TooltipContent({ style, ...props }, propRef) {
    const context = useTooltipContext();
    const { isMounted, status } = useTransitionStatus(context.context, {
        duration: {
            open: 300,
            close: 250,
        },
    });
    const ref = useMergeRefs([context.refs.setFloating, propRef]);

    if (!context.open) return null;

    return (
        isMounted && (
            <FloatingPortal>
                <FloatingContentStyled
                    ref={ref}
                    style={{
                        ...context.floatingStyles,
                        ...style,
                    }}
                    data-status={status}
                    {...context.getFloatingProps(props)}
                >
                    {props.children}
                    {context.showArrow && <FloatingArrow ref={context.arrowRef} context={context.context} fill={context.arrowFill ?? '#444'} />}
                </FloatingContentStyled>
            </FloatingPortal>
        )
    );
});

export default function Tooltip({ children, content, contentStyle, ...options }: FloatingComponentProps & BaseFloatingOptions) {
    // This can accept any props as options, e.g. `placement`,
    // or other positioning options.
    const tooltip = useTooltip(options);

    return (
        <TooltipContext.Provider value={tooltip}>
            <TooltipTrigger>{children}</TooltipTrigger>
            {content && !tooltip.disabled && <TooltipContent {...(contentStyle && { style: contentStyle })}>{content}</TooltipContent>}
        </TooltipContext.Provider>
    );
}
