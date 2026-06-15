'use client';

import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { cn } from '@heroui/react';
import { ReactNode } from 'react';

type AiComparisonSectionProps = {
    icon: IconDefinition;
    title: string;
    description?: string;
    status?: 'smart' | 'danger';
    children?: ReactNode;
};

// The framed panel used for every stage of the AI comparison creator (running,
// plan review, completed, failed) so the active step is visually distinct.
const AiComparisonSection = ({ icon, title, description, status = 'smart', children }: AiComparisonSectionProps) => (
    <section
        className={cn(
            'rounded-lg border border-s-4 p-4',
            status === 'smart' ? 'border-smart/30 border-s-smart bg-smart/10' : 'border-danger/30 border-s-danger bg-danger/10',
        )}
    >
        <h3 className="mb-1 flex items-center gap-2 text-base font-semibold">
            <FontAwesomeIcon icon={icon} className={status === 'smart' ? 'text-smart' : 'text-danger'} />
            {title}
        </h3>
        {description && <p className={cn('text-sm text-muted', children ? 'mb-4' : 'mb-0')}>{description}</p>}
        {children && <div className="flex flex-col gap-4">{children}</div>}
    </section>
);

export default AiComparisonSection;
