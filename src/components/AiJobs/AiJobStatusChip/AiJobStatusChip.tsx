'use client';

import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { faBan, faCheck, faHourglassHalf, faSpinner, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Chip } from '@heroui/react';
import type { JobStatus } from '@orkg/agentic-loop-client';
import { ComponentProps } from 'react';

type ChipColor = ComponentProps<typeof Chip>['color'];

const STATUS_CONFIG: Record<JobStatus, { label: string; color: ChipColor; icon: IconDefinition; spin?: boolean }> = {
    pending: { label: 'Queued', color: 'default', icon: faSpinner, spin: true },
    parsing: { label: 'Reading papers', color: 'default', icon: faSpinner, spin: true },
    planning: { label: 'Planning', color: 'default', icon: faSpinner, spin: true },
    awaiting_approval: { label: 'Needs review', color: 'warning', icon: faHourglassHalf },
    executing: { label: 'Extracting', color: 'accent', icon: faSpinner, spin: true },
    completed: { label: 'Completed', color: 'success', icon: faCheck },
    failed: { label: 'Failed', color: 'danger', icon: faXmark },
    cancelled: { label: 'Cancelled', color: 'default', icon: faBan },
};

type AiJobStatusChipProps = {
    status: JobStatus;
    size?: ComponentProps<typeof Chip>['size'];
};

const AiJobStatusChip = ({ status, size = 'sm' }: AiJobStatusChipProps) => {
    const config = STATUS_CONFIG[status];
    return (
        <Chip color={config.color} variant="soft" size={size}>
            <FontAwesomeIcon icon={config.icon} spin={config.spin} className="size-3" />
            <Chip.Label>{config.label}</Chip.Label>
        </Chip>
    );
};

export default AiJobStatusChip;
