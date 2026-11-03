'use client';

import { faWandMagicSparkles } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Alert, Button, Disclosure, Skeleton } from '@heroui/react';
import type { JobRead, JobStatus } from '@orkg/agentic-loop-client';
import Link from 'next/link';
import { useEffect } from 'react';

import { AI_JOBS_POLL_INTERVAL, isJobActive, NON_CANCELLED_STATUSES } from '@/components/AiJobs/hooks/useAiJobs';
import AiJobCard from '@/components/Cards/AiJobCard/AiJobCard';
import useAuthentication from '@/components/hooks/useAuthentication';
import usePaginate from '@/components/PaginatedContent/hooks/usePaginate';
import PaginationControl from '@/components/PaginatedContent/PaginationControl';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { aiJobsUrl, listAiJobsPaged } from '@/services/agenticLoop/api';
import type { Pagination } from '@/services/backend/types';

// ListGroup look without the deprecated Ui wrapper, matching the other draft lists.
const listBoxClass = 'box m-0 flex w-full list-none flex-col divide-y divide-border overflow-hidden border border-border p-0';

const CANCELLED_STATUSES: JobStatus[] = ['cancelled'];

const DEFAULT_PAGE_SIZE = 15;

// AiJobCard shows live progress for running jobs, so keep the page fresh while it lists one.
const pollWhileActive = {
    refreshInterval: (latest?: Pagination<JobRead>) => (latest?.content.some(isJobActive) ? AI_JOBS_POLL_INTERVAL : 0),
};

// Doesn't use ListPage: the empty state, the error alert and the collapsed
// cancelled list don't fit its layout.
const DraftAiComparisons = () => {
    const { user } = useAuthentication();

    // The service has no delete endpoint, so cancelled jobs accumulate forever;
    // they are listed separately behind a disclosure instead of cluttering the list.
    const jobs = usePaginate({
        fetchFunction: listAiJobsPaged,
        fetchUrl: aiJobsUrl,
        fetchFunctionName: 'listAiJobsPaged',
        fetchExtraParams: { status: NON_CANCELLED_STATUSES },
        defaultPageSize: DEFAULT_PAGE_SIZE,
        isReadyToLoad: !!user,
        swrOptions: pollWhileActive,
    });
    const cancelledJobs = usePaginate({
        fetchFunction: listAiJobsPaged,
        fetchUrl: aiJobsUrl,
        fetchFunctionName: 'listAiJobsPaged',
        fetchExtraParams: { status: CANCELLED_STATUSES },
        defaultPageSize: DEFAULT_PAGE_SIZE,
        prefixParams: 'cancelled',
        isReadyToLoad: !!user,
        // the disclosure is gated on the total, so it must not collapse while another page loads
        swrOptions: { keepPreviousData: true },
    });

    useEffect(() => {
        document.title = 'Draft AI comparisons - ORKG';
    });

    const error = jobs.error as Error | undefined;
    const isLoading = jobs.isLoading || !user;
    const visibleJobs = jobs.data ?? [];

    return (
        <div>
            <div className="mb-5 px-3">
                <h2 className="text-xl mb-2">View draft AI comparisons</h2>
                <p className="leading-relaxed rounded bg-surface-tertiary p-4">
                    The <em>AI comparison creator</em> builds comparisons from your uploaded papers. Your jobs are listed below with their current
                    status: review generated plans, follow running jobs, and turn completed results into comparisons.
                </p>
            </div>

            <div className="px-3">
                {isLoading && (
                    <div className={listBoxClass}>
                        {[0, 1, 2].map((index) => (
                            <div key={index} className="flex flex-col gap-2 px-6 py-4">
                                <Skeleton className="h-4 w-3/5 rounded" />
                                <Skeleton className="h-3 w-2/5 rounded" />
                            </div>
                        ))}
                    </div>
                )}

                {error && (
                    <Alert status="danger">
                        <Alert.Indicator />
                        <Alert.Content>
                            <Alert.Title>Failed to load your AI comparison jobs</Alert.Title>
                            <Alert.Description>{error.message}</Alert.Description>
                        </Alert.Content>
                    </Alert>
                )}

                {!isLoading && !error && visibleJobs.length === 0 && (
                    <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-separator px-4 py-10 text-center">
                        <FontAwesomeIcon icon={faWandMagicSparkles} className="text-smart text-3xl" />
                        <span className="font-medium">No AI comparison jobs yet</span>
                        <span className="text-sm text-muted">
                            Upload papers on the <Link href={reverse(ROUTES.CONTENT_TYPE_NEW)}>comparison creation page</Link> and let the AI build a
                            comparison for you.
                        </span>
                    </div>
                )}

                {!isLoading && !error && visibleJobs.length > 0 && (
                    <ul className={listBoxClass}>
                        {visibleJobs.map((job) => (
                            <AiJobCard key={job.id} job={job} />
                        ))}
                    </ul>
                )}

                {!error && (jobs.totalPages ?? 0) > 1 && (
                    <div className="mt-4">
                        <PaginationControl
                            page={jobs.page}
                            setPage={jobs.setPage}
                            totalPages={jobs.totalPages ?? 0}
                            pageSize={jobs.pageSize}
                            setPageSize={jobs.setPageSize}
                            isLoading={jobs.isLoading}
                            hasNextPage={jobs.hasNextPage}
                            totalElements={jobs.totalElements ?? 0}
                            boxShadow
                        />
                    </div>
                )}

                {!error && !!cancelledJobs.totalElements && (
                    <Disclosure className="mt-4">
                        <Disclosure.Heading>
                            <Button slot="trigger" size="sm" variant="tertiary">
                                Show cancelled ({cancelledJobs.totalElements})
                                <Disclosure.Indicator />
                            </Button>
                        </Disclosure.Heading>
                        <Disclosure.Content>
                            <Disclosure.Body className="pt-3">
                                <ul className={listBoxClass}>
                                    {cancelledJobs.data?.map((job) => (
                                        <AiJobCard key={job.id} job={job} />
                                    ))}
                                </ul>
                                {(cancelledJobs.totalPages ?? 0) > 1 && (
                                    <div className="mt-4">
                                        <PaginationControl
                                            prefixParams="cancelled"
                                            page={cancelledJobs.page}
                                            setPage={cancelledJobs.setPage}
                                            totalPages={cancelledJobs.totalPages ?? 0}
                                            pageSize={cancelledJobs.pageSize}
                                            setPageSize={cancelledJobs.setPageSize}
                                            isLoading={cancelledJobs.isLoading}
                                            hasNextPage={cancelledJobs.hasNextPage}
                                            totalElements={cancelledJobs.totalElements}
                                        />
                                    </div>
                                )}
                            </Disclosure.Body>
                        </Disclosure.Content>
                    </Disclosure>
                )}
            </div>
        </div>
    );
};

export default DraftAiComparisons;
