'use client';

import { cn, Modal } from '@heroui/react';
import { CSSProperties, FC, ReactNode, useEffect, useRef } from 'react';

import LoadingOverlay from '@/components/LoadingOverlay/LoadingOverlay';

type Size = 'sm' | 'md' | 'lg' | 'xl';

const SIZE_TO_HEROUI: Record<Size, 'sm' | 'md' | 'lg'> = {
    sm: 'sm',
    md: 'md',
    lg: 'lg',
    xl: 'lg',
};

const DIALOG_CLASS_OVERRIDES: Partial<Record<Size, string>> = {
    xl: 'sm:max-w-6xl',
};

type ModalWithLoadingProps = {
    children: ReactNode;
    isOpen: boolean;
    toggle?: () => void;
    size?: Size;
    backdrop?: boolean | 'static';
    isLoading?: boolean;
    fullscreen?: boolean;
    className?: string;
    backdropClassName?: string;
    style?: CSSProperties;
    onOpened?: () => void;
    onClosed?: () => void;
};

const ModalWithLoading: FC<ModalWithLoadingProps> = ({
    children,
    isOpen,
    toggle,
    size = 'md',
    backdrop = true,
    isLoading = false,
    fullscreen = false,
    className,
    backdropClassName,
    style,
    onOpened,
    onClosed,
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
    }, [isOpen, onOpened, onClosed]);

    const isStatic = backdrop === 'static' || backdrop === false || isLoading;
    const dialogClass = cn(DIALOG_CLASS_OVERRIDES[size], className);

    return (
        <Modal.Backdrop
            isOpen={isOpen}
            isDismissable={!isStatic}
            isKeyboardDismissDisabled={isStatic}
            className={backdropClassName}
            onOpenChange={(open) => {
                if (!open) toggle?.();
            }}
        >
            <Modal.Container
                size={fullscreen ? 'full' : SIZE_TO_HEROUI[size]}
                className={fullscreen ? undefined : 'max-h-[calc(100vh-73px)] mt-[73px]'}
            >
                <Modal.Dialog className={dialogClass || undefined} style={style}>
                    <LoadingOverlay isLoading={isLoading} className="rounded" />
                    {children}
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
};

export default ModalWithLoading;
