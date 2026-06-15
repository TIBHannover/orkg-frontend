'use client';

import type { ExtractionPlan, JobRead, JobStatus } from '@orkg/agentic-loop-client';
import dayjs from 'dayjs';
import useSWR from 'swr';

import { getAiJobPlan } from '@/services/agenticLoop/api';

// The plan only exists once planning finished; for earlier stages the endpoint
// returns 404. `failed`/`cancelled` are included because a job can fail or be
// cancelled after planning (a pre-plan 404 falls back to null below).
const PLAN_STATUSES: JobStatus[] = ['awaiting_approval', 'executing', 'completed', 'failed', 'cancelled'];

const useAiJobPlan = (jobId: string | null, status?: JobStatus) => {
    const shouldFetch = !!jobId && (!status || PLAN_STATUSES.includes(status));

    const { data, isLoading, mutate } = useSWR(shouldFetch ? ['aiJobPlan', jobId] : null, async ([, id]) => {
        // A missing plan (pre-plan failure) is expected — fall back to null so
        // consumers render the date-based label instead of an error.
        const result = await getAiJobPlan(id as string);
        return result.ok ? result.data.plan : null;
    });

    return { plan: data ?? null, isLoading, mutate };
};

// JobRead carries no title (backend limitation), so lists show a creation-date
// label until the plan — and with it the generated title — exists.
export const getAiJobLabel = (job: JobRead, plan?: ExtractionPlan | null): string =>
    plan?.title || `AI comparison · ${dayjs(job.createdAt).format('DD MMM YYYY')}`;

export default useAiJobPlan;
