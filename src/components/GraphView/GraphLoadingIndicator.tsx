'use client';

import { Spinner } from '@heroui/react';

type GraphLoadingIndicatorProps = {
    message?: string;
    /** Render on a translucent sheet over an already-drawn graph instead of on an empty canvas. */
    isOverlay?: boolean;
};

const GraphLoadingIndicator = ({ message = 'Loading graph...', isOverlay = false }: GraphLoadingIndicatorProps) => (
    <div
        className={`absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 ${isOverlay ? 'bg-overlay/70 backdrop-blur-[1px]' : ''}`}
        role="status"
        aria-live="polite"
    >
        {/* the wrapper is the live region; the spinner's own role="status" would announce twice */}
        <Spinner size="lg" role="presentation" aria-label={undefined} />
        <span className="text-sm text-muted">{message}</span>
    </div>
);

export default GraphLoadingIndicator;
