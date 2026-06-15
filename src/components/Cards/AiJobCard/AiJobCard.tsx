'use client';

import { faCalendar, faClock, faDownload, faFileCsv } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, ProgressBar } from '@heroui/react';
import type { JobRead } from '@orkg/agentic-loop-client';
import dayjs from 'dayjs';
import Link from 'next/link';
import { FC } from 'react';

import AiJobStatusChip from '@/components/AiJobs/AiJobStatusChip/AiJobStatusChip';
import useAiJobActions from '@/components/AiJobs/hooks/useAiJobActions';
import useAiJobPlan, { getAiJobLabel } from '@/components/AiJobs/hooks/useAiJobPlan';
import { isJobActive } from '@/components/AiJobs/hooks/useAiJobs';
import ButtonWithLoading from '@/components/ButtonWithLoading/ButtonWithLoading';
import Confirm from '@/components/Confirmation/Confirmation';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';

type AiJobCardProps = {
    job: JobRead;
};

// Row card for an agentic-loop job; rendered inside a boxed list with dividers
// (like the other Cards), so it draws no border of its own.
const AiJobCard: FC<AiJobCardProps> = ({ job }) => {
    const { plan } = useAiJobPlan(job.id, job.status);
    const { createComparisonFromJob, downloadCsv, openInCsvImport, cancelJob, isCreatingComparison, isCancelling } = useAiJobActions(job.id);

    const jobUrl = `${reverse(ROUTES.CONTENT_TYPE_NEW)}?aiJobId=${encodeURIComponent(job.id)}`;

    const handleCancel = async () => {
        const confirmed = await Confirm({
            title: 'Cancel comparison creation?',
            message: 'The running job will be stopped and cannot be resumed. You will have to start over from the beginning.',
            proceedLabel: 'Cancel creation',
            cancelLabel: 'Keep running',
        });
        if (confirmed) {
            await cancelJob();
        }
    };

    return (
        <li className="list-group-item px-6 py-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <Link href={jobUrl} className="font-medium">
                        {getAiJobLabel(job, plan)}
                    </Link>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted">
                        <AiJobStatusChip status={job.status} />
                        <span className="flex items-center gap-1">
                            <FontAwesomeIcon size="sm" icon={faCalendar} />
                            {dayjs(job.createdAt).format('DD MMMM YYYY')}
                        </span>
                        <span className="flex items-center gap-1">
                            <FontAwesomeIcon size="sm" icon={faClock} />
                            {dayjs(job.createdAt).format('H:mm')}
                        </span>
                    </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                    {job.status === 'completed' && (
                        <>
                            <Button
                                variant="ghost"
                                size="sm"
                                isIconOnly
                                aria-label="Download CSV"
                                isDisabled={isCreatingComparison}
                                onPress={downloadCsv}
                            >
                                <FontAwesomeIcon icon={faDownload} />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                isIconOnly
                                aria-label="Edit in CSV import tool"
                                isDisabled={isCreatingComparison}
                                onPress={openInCsvImport}
                            >
                                <FontAwesomeIcon icon={faFileCsv} />
                            </Button>
                            <ButtonWithLoading
                                variant="primary"
                                size="sm"
                                className="button--orkg-smart"
                                isLoading={isCreatingComparison}
                                loadingMessage="Creating..."
                                onPress={createComparisonFromJob}
                            >
                                Create comparison
                            </ButtonWithLoading>
                        </>
                    )}

                    {job.status === 'awaiting_approval' && (
                        <Link href={jobUrl} className="no-underline">
                            <Button variant="primary" size="sm" className="button--orkg-smart pointer-events-none">
                                Review plan
                            </Button>
                        </Link>
                    )}

                    {isJobActive(job) && (
                        <>
                            <Link href={jobUrl} className="no-underline">
                                <Button variant="secondary" size="sm" className="pointer-events-none">
                                    View progress
                                </Button>
                            </Link>
                            <ButtonWithLoading
                                variant="ghost"
                                size="sm"
                                isLoading={isCancelling}
                                loadingMessage="Cancelling..."
                                onPress={handleCancel}
                            >
                                Cancel
                            </ButtonWithLoading>
                        </>
                    )}
                </div>
            </div>

            {/* Progress stays fresh through the parent list's polling (useAiJobs
                refreshes every 10s while a job is active) — no stream is opened here. */}
            {isJobActive(job) && (
                <div className="mt-3">
                    <ProgressBar
                        aria-label="Job progress"
                        size="sm"
                        color="accent"
                        value={job.progressPct}
                        isIndeterminate={!job.progressPct}
                        className="w-full"
                    >
                        <ProgressBar.Track>
                            <ProgressBar.Fill />
                        </ProgressBar.Track>
                    </ProgressBar>
                    {job.progressMessage && <span className="mt-1 block text-xs text-muted">{job.progressMessage}</span>}
                </div>
            )}

            {job.status === 'failed' && job.error && (
                <p className="mb-0 mt-2 line-clamp-2 text-sm text-red-600" title={job.error}>
                    {job.error}
                </p>
            )}
        </li>
    );
};

export default AiJobCard;
