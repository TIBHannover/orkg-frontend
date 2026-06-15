'use client';

import { cn } from '@heroui/react';
import type { JobRead } from '@orkg/agentic-loop-client';
import dayjs from 'dayjs';
import Link from 'next/link';

import AiJobStatusChip from '@/components/AiJobs/AiJobStatusChip/AiJobStatusChip';
import useAiJobPlan, { getAiJobLabel } from '@/components/AiJobs/hooks/useAiJobPlan';
import { isJobActive } from '@/components/AiJobs/hooks/useAiJobs';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';

type NotificationsBellItemProps = {
    job: JobRead;
    isHighlighted: boolean;
    onNavigate: () => void;
};

const NotificationsBellItem = ({ job, isHighlighted, onNavigate }: NotificationsBellItemProps) => {
    // The title comes from the job's plan, fetched lazily per row (rows only
    // mount while the popover is open); the SWR cache shares the result with
    // the drafts tab and the progress card.
    const { plan } = useAiJobPlan(job.id, job.status);

    return (
        <Link
            href={`${reverse(ROUTES.CONTENT_TYPE_NEW)}?aiJobId=${encodeURIComponent(job.id)}`}
            onClick={onNavigate}
            className={cn(
                'flex flex-col gap-1 border-b border-default p-3 no-underline transition-colors last:border-b-0',
                'hover:bg-default/40',
                isHighlighted && 'bg-accent/5',
            )}
        >
            <div className="flex items-center justify-between gap-2">
                <span className="truncate text-sm font-medium text-foreground">{getAiJobLabel(job, plan)}</span>
                {isHighlighted && <span aria-hidden className="size-2 shrink-0 rounded-full bg-accent" />}
            </div>
            {isJobActive(job) && job.progressMessage && <span className="truncate text-xs text-muted">{job.progressMessage}</span>}
            <div className="flex items-center justify-between gap-2">
                <AiJobStatusChip status={job.status} />
                <span className="text-xs text-muted">{dayjs(job.updatedAt).fromNow()}</span>
            </div>
        </Link>
    );
};

export default NotificationsBellItem;
