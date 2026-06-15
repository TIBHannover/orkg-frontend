'use client';

import { toast } from '@heroui/react';
import type { JobRead, JobStatus } from '@orkg/agentic-loop-client';
import { useEffect } from 'react';
import useSWR, { mutate as globalMutate } from 'swr';

import useAuthentication from '@/components/hooks/useAuthentication';
import { listAiJobs } from '@/services/agenticLoop/api';

export const AI_JOBS_SWR_KEY = 'listAiJobs';

const ACTIVE_STATUSES: JobStatus[] = ['pending', 'parsing', 'planning', 'executing'];

export const isJobActive = (job: JobRead) => ACTIVE_STATUSES.includes(job.status);

// States worth notifying the user about: the job finished (well or badly) or
// needs their input.
export const isJobNotable = (job: JobRead) => job.status === 'completed' || job.status === 'failed' || job.status === 'awaiting_approval';

// Revalidate the jobs list from anywhere (e.g. after cancelling a job or when
// the SSE stream reports a terminal status) without needing the SWR key parts.
export const mutateAiJobs = () => globalMutate((key) => Array.isArray(key) && key[0] === AI_JOBS_SWR_KEY);

export type TransitionToast = { kind: 'success' | 'danger'; message: string };

// Pure core of the notification logic: which toasts does a fresh jobs list
// warrant, given the statuses we last saw?
export const computeTransitionToasts = (lastKnown: ReadonlyMap<string, JobStatus>, jobs: JobRead[]): TransitionToast[] => {
    const toasts: TransitionToast[] = [];
    for (const job of jobs) {
        if (lastKnown.get(job.id) === job.status || !isJobNotable(job)) {
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
// mobile + drafts tab) so each status transition produces exactly one toast.
const lastKnownStatuses = new Map<string, JobStatus>();
let hasSeededStatuses = false;

const notifyTransitions = (jobs: JobRead[]) => {
    // First load of the session: seed silently so jobs that finished long ago
    // don't toast on every page load.
    const toasts = hasSeededStatuses ? computeTransitionToasts(lastKnownStatuses, jobs) : [];
    hasSeededStatuses = true;
    jobs.forEach((job) => lastKnownStatuses.set(job.id, job.status));
    toasts.forEach(({ kind, message }) => (kind === 'success' ? toast.success(message) : toast.danger(message)));
};

// Single source of truth for the user's agentic-loop jobs. The header bell
// (desktop + mobile), the drafts tab, and the progress card all read the same
// SWR key, so one fetch serves every surface. Polling runs only while a job is
// active; the create page's SSE stream pushes terminal transitions into this
// cache immediately via mutateAiJobs.
const useAiJobs = () => {
    const { user, status } = useAuthentication();

    const { data, isLoading, error, mutate } = useSWR(
        status === 'authenticated' && user?.id ? [AI_JOBS_SWR_KEY, user.id] : null,
        async () => {
            const result = await listAiJobs();
            if (!result.ok) {
                throw new Error(result.error);
            }
            return [...result.data].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        },
        {
            // Poll only while a job is running; otherwise rely on focus revalidation.
            refreshInterval: (latestData) => (latestData?.some(isJobActive) ? 10_000 : 0),
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
