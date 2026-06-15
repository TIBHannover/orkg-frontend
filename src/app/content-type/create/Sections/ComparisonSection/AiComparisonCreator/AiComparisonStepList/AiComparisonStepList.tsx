'use client';

import { faCheck, faCircle, faSpinner, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { cn } from '@heroui/react';
import type { SSEStepData } from '@orkg/agentic-loop-client';

const renderStepIcon = (status: SSEStepData['status']) => {
    if (status === 'completed') {
        return <FontAwesomeIcon icon={faCheck} className="size-3" />;
    }
    if (status === 'running') {
        return <FontAwesomeIcon icon={faSpinner} spin className="size-3" />;
    }
    if (status === 'failed') {
        return <FontAwesomeIcon icon={faXmark} className="size-3" />;
    }
    return <FontAwesomeIcon icon={faCircle} className="size-2" />;
};

const stepIconClass = (status: SSEStepData['status']) =>
    cn('z-1 flex size-6 shrink-0 items-center justify-center rounded-full', {
        'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400': status === 'completed',
        'bg-smart/15 text-smart': status === 'running',
        'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400': status === 'failed',
        'bg-default/40 text-muted': status !== 'completed' && status !== 'running' && status !== 'failed',
    });

type AiComparisonStepListProps = {
    steps: SSEStepData[];
};

const AiComparisonStepList = ({ steps }: AiComparisonStepListProps) => (
    <ol className="m-0 flex list-none flex-col p-0">
        {steps.map((step, index) => (
            <li key={step.stepNumber} className="relative flex items-start gap-3 pb-3 last:pb-0">
                {index < steps.length - 1 && <span aria-hidden className="absolute bottom-0 left-3 top-6 w-px -translate-x-1/2 bg-separator" />}
                <span className={stepIconClass(step.status)}>{renderStepIcon(step.status)}</span>
                <span className={cn('pt-0.5 text-sm', step.status === 'running' ? 'font-medium text-foreground' : 'text-muted')}>
                    {step.description}
                </span>
            </li>
        ))}
    </ol>
);

export default AiComparisonStepList;
