'use client';

import { cn, Spinner } from '@heroui/react';
import { AnimatePresence, motion } from 'motion/react';
import { FC, ReactNode } from 'react';

type LoadingOverlayProps = {
    isLoading?: boolean;
    className?: string;
    loadingText?: ReactNode;
};

const LoadingOverlay: FC<LoadingOverlayProps> = ({ isLoading = false, className, loadingText = <span className="text-2xl">Loading</span> }) => (
    <AnimatePresence>
        {isLoading && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                aria-live="polite"
                aria-busy="true"
                className={cn('pointer-events-auto absolute inset-0 z-50 flex items-center justify-center gap-3 bg-white/65', className)}
            >
                <Spinner size="lg" />
                {loadingText}
            </motion.div>
        )}
    </AnimatePresence>
);

export default LoadingOverlay;
