'use client';

import { toast } from '@heroui/react';
import { type JobRead, JobStatus } from '@orkg/agentic-loop-client';
import { useEffect } from 'react';
import useSWR, { mutate as globalMutate } from 'swr';

import useAuthentication from '@/components/hooks/useAuthentication';
import { aiJobsUrl, listAiJobsPaged, type ListAiJobsPagedParams } from '@/services/agenticLoop/api';

const ACTIVE_STATUSES: JobStatus[] = ['pending', 'parsing', 'planning', 'executing'];

// Every status except cancelled: cancelled jobs are never shown in the bell and
// would otherwise crowd active and notable jobs out of a page.
export const NON_CANCELLED_STATUSES: JobStatus[] = Object.values(JobStatus).filter((status) => status !== 'cancelled');

const RECENT_JOBS_SIZE = 20;

// Explicit rather than the service default: the window must hold the newest jobs,
// and notifyTransitions takes the last one as the oldest (windowStart).
const RECENT_JOBS_SORT: ListAiJobsPagedParams['sortBy'] = [{ property: 'createdAt', direction: 'desc' }];

export const AI_JOBS_POLL_INTERVAL = 10_000;

export const isJobActive = (job: JobRead) => ACTIVE_STATUSES.includes(job.status);

// States worth notifying the user about: the job finished (well or badly) or
// needs their input.
export const isJobNotable = (job: JobRead) => job.status === 'completed' || job.status === 'failed' || job.status === 'awaiting_approval';

// Revalidate every job listing (the recent jobs and the drafts tab pages) from
// anywhere, e.g. after cancelling a job or when the SSE stream reports a
// terminal status.
export const mutateAiJobs = () => globalMutate((key) => Array.isArray(key) && key[1] === aiJobsUrl);

export type TransitionToast = { kind: 'success' | 'danger'; message: string };

// Pure core of the notification logic: which toasts does a fresh jobs list
// warrant, given the statuses we last saw? `windowStart` is the creation date of
// the oldest job in the previous list: an unknown job older than that wasn't
// created meanwhile, it moved into the window (e.g. a newer job was cancelled).
export const computeTransitionToasts = (lastKnown: ReadonlyMap<string, JobStatus>, jobs: JobRead[], windowStart?: Date): TransitionToast[] => {
    const toasts: TransitionToast[] = [];
    for (const job of jobs) {
        const known = lastKnown.get(job.id);
        if (known === job.status || !isJobNotable(job)) {
            continue;
        }
        if (known === undefined && windowStart && job.createdAt < windowStart) {
            continue;
        }
        if (job.status === 'completed') {
            toasts.push({ kind: 'success', message: 'Your AI comparison is ready' });
        } else if (job.status === 'awaiting_approval') {
            toasts.push({ kind: 'success', message: 'Your AI comparison plan is ready for review' });
        } else {
            toasts.push({ kind: 'danger', message: 'An AI comparison job failed' });
        }
    }
    return toasts;
};

// Last status seen per job, shared across all hook instances (header desktop +
// mobile) so each status transition produces exactly one toast.
const lastKnownStatuses = new Map<string, JobStatus>();
let hasSeededStatuses = false;
let lastWindowStart: Date | undefined;

const notifyTransitions = (jobs: JobRead[]) => {
    // First load of the session: seed silently so jobs that finished long ago
    // don't toast on every page load.
    const toasts = hasSeededStatuses ? computeTransitionToasts(lastKnownStatuses, jobs, lastWindowStart) : [];
    hasSeededStatuses = true;
    jobs.forEach((job) => lastKnownStatuses.set(job.id, job.status));
    lastWindowStart = jobs.at(-1)?.createdAt;
    toasts.forEach(({ kind, message }) => (kind === 'success' ? toast.success(message) : toast.danger(message)));
};

// The header bell (desktop + mobile) reads the same SWR key, so one fetch serves
// both; the create page's SSE stream pushes terminal transitions into this cache
// immediately via mutateAiJobs.
const useAiJobs = () => {
    const { user, status } = useAuthentication();

    const { data, isLoading, error, mutate } = useSWR(
        status === 'authenticated' && user?.id
            ? [{ size: RECENT_JOBS_SIZE, sortBy: RECENT_JOBS_SORT, status: NON_CANCELLED_STATUSES, userId: user.id }, aiJobsUrl, 'listAiJobsPaged']
            : null,
        async ([params]) => (await listAiJobsPaged({ size: params.size, sortBy: params.sortBy, status: params.status })).content,
        {
            // Poll only while a job is running; otherwise rely on focus revalidation.
            refreshInterval: (latestData) => (latestData?.some(isJobActive) ? AI_JOBS_POLL_INTERVAL : 0),
            revalidateOnFocus: true,
            revalidateIfStale: true,
        },
    );

    useEffect(() => {
        if (data) {
            notifyTransitions(data);
        }
    }, [data]);

    return { jobs: data ?? [], isLoading, error: error as Error | undefined, mutate };
};

export default useAiJobs;
