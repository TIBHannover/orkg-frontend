import { Placement } from '@floating-ui/react';
import { ReactNode } from 'react';

export interface BaseFloatingOptions {
    initialOpen?: boolean;
    disabled?: boolean;
    placement?: Placement;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    onTrigger?: (open: boolean) => void;
    showArrow?: boolean;
    arrowFill?: string;
}

export interface FloatingComponentProps {
    children: ReactNode;
    content?: ReactNode;
    contentStyle?: React.CSSProperties;
}

export interface FloatingTriggerProps {
    children: ReactNode;
    asChild?: boolean;
}

export interface FloatingContentProps extends React.HTMLProps<HTMLDivElement> {
    style?: React.CSSProperties;
}
