'use client';

import type { JobRead, JobStatus } from '@orkg/agentic-loop-client';
import { useCallback, useSyncExternalStore } from 'react';

import useAiJobs, { isJobNotable } from '@/components/AiJobs/hooks/useAiJobs';
import { AI_JOBS_SEEN_STATUS_KEY } from '@/constants/localStorageKeys';

// Maps job id → status the job had when the user last opened the notifications
// popover. Keyed by status (not just id) so a job seen at `awaiting_approval`
// counts as unseen again once it reaches `completed`.
export type SeenStatusMap = Record<string, JobStatus>;

const EMPTY_SEEN_MAP: SeenStatusMap = {};

// Tiny external store around localStorage so every hook instance (desktop bell,
// mobile bell) re-renders when one of them marks jobs as seen.
let cachedSeenMap: SeenStatusMap | null = null;
const listeners = new Set<() => void>();

const readSeenMap = (): SeenStatusMap => {
    if (cachedSeenMap) {
        return cachedSeenMap;
    }
    try {
        cachedSeenMap = JSON.parse(localStorage.getItem(AI_JOBS_SEEN_STATUS_KEY) ?? '{}') as SeenStatusMap;
    } catch {
        cachedSeenMap = {};
    }
    return cachedSeenMap;
};

const writeSeenMap = (map: SeenStatusMap) => {
    cachedSeenMap = map;
    try {
        localStorage.setItem(AI_JOBS_SEEN_STATUS_KEY, JSON.stringify(map));
    } catch {
        /* storage unavailable — badge state only lives for this session */
    }
    listeners.forEach((listener) => listener());
};

const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
};

export const isJobUnseen = (job: JobRead, seenMap: SeenStatusMap) => isJobNotable(job) && seenMap[job.id] !== job.status;

// Bounds localStorage growth; the entries recorded longest ago are dropped first.
export const MAX_SEEN_ENTRIES = 200;

// Only the most recent jobs are listed, and an older one moves back into that
// window when a newer one is cancelled. Entries for unlisted jobs are therefore
// kept, so such a job doesn't flag as unseen again.
export const buildSeenMap = (jobs: JobRead[], previous: SeenStatusMap = {}): SeenStatusMap => {
    const listedIds = new Set(jobs.map((job) => job.id));
    const kept = Object.entries(previous).filter(([id]) => !listedIds.has(id));
    const listed = jobs.filter(isJobNotable).map((job) => [job.id, job.status] as const);
    return Object.fromEntries([...kept, ...listed].slice(-MAX_SEEN_ENTRIES));
};

const useAiJobsUnseen = () => {
    const { jobs } = useAiJobs();
    const seenMap = useSyncExternalStore(subscribe, readSeenMap, () => EMPTY_SEEN_MAP);

    const unseenCount = jobs.filter((job) => isJobUnseen(job, seenMap)).length;

    const isUnseen = useCallback((job: JobRead) => isJobUnseen(job, seenMap), [seenMap]);

    const markAllSeen = useCallback(() => {
        writeSeenMap(buildSeenMap(jobs, readSeenMap()));
    }, [jobs]);

    return { unseenCount, isUnseen, markAllSeen };
};

export default useAiJobsUnseen;
