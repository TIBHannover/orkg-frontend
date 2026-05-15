'use client';

import { cn, Modal as HeroUIModal } from '@heroui/react';
import { CSSProperties, FC, ReactNode, useCallback, useEffect, useRef } from 'react';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

const SIZE_CLASS_MAP: Record<ModalSize, string> = {
    sm: 'max-w-xs',
    md: 'max-w-lg',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
};

type ModalProps = {
    isOpen?: boolean;
    toggle?: (value?: boolean | unknown) => void;
    size?: ModalSize;
    backdrop?: boolean | 'static';
    className?: string;
    style?: CSSProperties;
    fullscreen?: boolean;
    onClosed?: () => void;
    onOpened?: () => void;
    children?: ReactNode;
    [key: string]: unknown;
};

const Modal: FC<ModalProps> = ({
    isOpen = false,
    toggle,
    size = 'md',
    backdrop = true,
    className,
    style,
    fullscreen = false,
    onClosed,
    onOpened,
    children,
}) => {
    const prevIsOpenRef = useRef(isOpen);

    useEffect(() => {
        if (isOpen && !prevIsOpenRef.current) {
            onOpened?.();
        }
        if (!isOpen && prevIsOpenRef.current) {
            onClosed?.();
        }
        prevIsOpenRef.current = isOpen;
    }, [isOpen, onClosed, onOpened]);

    const isDismissable = backdrop !== 'static' && backdrop !== false;
    const sizeClass = fullscreen ? undefined : SIZE_CLASS_MAP[size];

    const handleOpenChange = useCallback(
        (open: boolean) => {
            if (!open) {
                toggle?.();
            }
        },
        [toggle],
    );

    return (
        <HeroUIModal.Backdrop className="z-[1055]" isOpen={isOpen} onOpenChange={handleOpenChange} isDismissable={isDismissable}>
            <HeroUIModal.Container size={fullscreen ? 'full' : undefined}>
                <HeroUIModal.Dialog className={cn(sizeClass, className)} style={style}>
                    {children}
                </HeroUIModal.Dialog>
            </HeroUIModal.Container>
        </HeroUIModal.Backdrop>
    );
};

export default Modal;
