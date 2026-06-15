'use client';

import { faWandMagicSparkles } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Alert, Disclosure, Skeleton } from '@heroui/react';
import Link from 'next/link';
import { useEffect } from 'react';

import useAiJobs from '@/components/AiJobs/hooks/useAiJobs';
import AiJobCard from '@/components/Cards/AiJobCard/AiJobCard';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';

// Boxed list container matching the other draft lists (ListGroup look without
// the deprecated Ui wrapper): surface box with divider-separated rows.
const listBoxClass = 'box m-0 flex w-full list-none flex-col divide-y divide-border overflow-hidden border border-border p-0';

// Unlike the other draft tabs this doesn't use ListPage: GET /api/jobs/ returns
// a plain unpaginated array, while ListPage is built around paginated fetchers.
const DraftAiComparisons = () => {
    const { jobs, isLoading, error } = useAiJobs();

    useEffect(() => {
        document.title = 'Draft AI comparisons - ORKG';
    });

    // The service has no delete endpoint, so cancelled jobs accumulate forever;
    // they are collapsed behind a disclosure instead of cluttering the list.
    const visibleJobs = jobs.filter((job) => job.status !== 'cancelled');
    const cancelledJobs = jobs.filter((job) => job.status === 'cancelled');

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

                {!error && visibleJobs.length > 0 && (
                    <ul className={listBoxClass}>
                        {visibleJobs.map((job) => (
                            <AiJobCard key={job.id} job={job} />
                        ))}
                    </ul>
                )}

                {!error && cancelledJobs.length > 0 && (
                    <Disclosure className="mt-4">
                        <Disclosure.Heading>
                            <Disclosure.Trigger className="inline-flex items-center gap-1.5 text-sm text-muted">
                                Show cancelled ({cancelledJobs.length})
                                <Disclosure.Indicator />
                            </Disclosure.Trigger>
                        </Disclosure.Heading>
                        <Disclosure.Content>
                            <Disclosure.Body className="pt-3">
                                <ul className={listBoxClass}>
                                    {cancelledJobs.map((job) => (
                                        <AiJobCard key={job.id} job={job} />
                                    ))}
                                </ul>
                            </Disclosure.Body>
                        </Disclosure.Content>
                    </Disclosure>
                )}
            </div>
        </div>
    );
};

export default DraftAiComparisons;
