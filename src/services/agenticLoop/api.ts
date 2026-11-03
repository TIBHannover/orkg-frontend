import type { ExtractionPlan, JobPlanRead, JobRead, JobStatus } from '@orkg/agentic-loop-client';
import { ResponseError } from '@orkg/agentic-loop-client';

import { agenticLoopBaseUrl, jobsApi } from '@/services/agenticLoop/client';
import type { Pagination, SortDirectionOptions } from '@/services/backend/types';

export type AgenticLoopResult<T> = { ok: true; data: T } | { ok: false; error: string };

// The service serializes datetimes without a timezone marker although they are
// UTC, so the generated client parses them as local time. Shift the parsed Date
// back so it represents the actual UTC instant.
const fixNaiveUtcDate = (date: Date): Date => new Date(date.getTime() - date.getTimezoneOffset() * 60000);

const fixJobDates = (job: JobRead): JobRead => ({
    ...job,
    createdAt: fixNaiveUtcDate(job.createdAt),
    updatedAt: fixNaiveUtcDate(job.updatedAt),
});

// Walks the cause chain so the underlying network error (e.g. ENOTFOUND,
// ECONNREFUSED) is surfaced rather than a generic "fetch failed".
const errorMessage = (e: unknown, fallback: string): string => {
    if (!(e instanceof Error)) return fallback;
    const parts: string[] = [e.message];
    let { cause } = e as Error & { cause?: unknown };
    while (cause) {
        if (cause instanceof Error) {
            parts.push(cause.message);
            ({ cause } = cause as Error & { cause?: unknown });
        } else if (typeof cause === 'string') {
            parts.push(cause);
            cause = undefined;
        } else {
            break;
        }
    }
    return parts.join(' — ');
};

// The generated client throws a generic ResponseError; include the status and
// body so callers can show what the service actually rejected.
const httpErrorMessage = async (e: unknown, fallback: string): Promise<string> => {
    if (e instanceof ResponseError) {
        const text = await e.response.text().catch(() => '');
        return `${fallback} (${e.response.status}): ${text || e.response.statusText}`;
    }
    return errorMessage(e, fallback);
};

// The service derives the owner from the bearer token, so no user id is sent.
export async function createAiJob(files: File[]): Promise<AgenticLoopResult<JobRead>> {
    if (files.length === 0) {
        return { ok: false, error: 'No files provided' };
    }
    try {
        const data = await jobsApi.createJob({ files });
        return { ok: true, data: fixJobDates(data) };
    } catch (e) {
        return { ok: false, error: await httpErrorMessage(e, 'Upload failed') };
    }
}

// SWR cache namespace for job listings; never used to fetch.
export const aiJobsUrl = `${agenticLoopBaseUrl}/api/jobs/`;

export type ListAiJobsPagedParams = {
    page?: number;
    size?: number;
    sortBy?: { property: string; direction?: SortDirectionOptions }[];
    status?: JobStatus[];
};

// The service sorts on snake_case names; unknown properties are rejected with a 400.
const JOB_SORT_PROPERTIES: Record<string, string> = { createdAt: 'created_at', updatedAt: 'updated_at' };

// Mapped to the ORKG Pagination shape so usePaginate can consume it. Throws on
// failure, like the other paginated fetchers.
export async function listAiJobsPaged({ page = 0, size = 20, sortBy, status = [] }: ListAiJobsPagedParams = {}): Promise<Pagination<JobRead>> {
    try {
        const { content, page: pageInfo } = await jobsApi.listJobsPaged({
            page,
            size,
            status: status.length > 0 ? status : undefined,
            sort: sortBy?.map(({ property, direction = 'asc' }) => `${JOB_SORT_PROPERTIES[property] ?? property},${direction}`),
        });
        return { content: content.map(fixJobDates), page: pageInfo };
    } catch (e) {
        throw new Error(await httpErrorMessage(e, 'Failed to load AI comparison jobs'));
    }
}

export async function getAiJob(jobId: string): Promise<AgenticLoopResult<JobRead>> {
    try {
        const data = await jobsApi.getJob({ jobId });
        return { ok: true, data: fixJobDates(data) };
    } catch (e) {
        return { ok: false, error: errorMessage(e, 'Failed to load job') };
    }
}

export async function getAiJobPlan(jobId: string): Promise<AgenticLoopResult<JobPlanRead>> {
    try {
        const data = await jobsApi.getPlan({ jobId });
        return { ok: true, data };
    } catch (e) {
        return { ok: false, error: errorMessage(e, 'Failed to load plan') };
    }
}

export async function updateAiJobPlan(jobId: string, plan: ExtractionPlan): Promise<AgenticLoopResult<JobPlanRead>> {
    try {
        const data = await jobsApi.updatePlan({ jobId, jobPlanUpdate: { plan } });
        return { ok: true, data };
    } catch (e) {
        return { ok: false, error: errorMessage(e, 'Failed to save plan') };
    }
}

export async function approveAiJobPlan(jobId: string): Promise<AgenticLoopResult<JobRead>> {
    try {
        const data = await jobsApi.approvePlan({ jobId });
        return { ok: true, data: fixJobDates(data) };
    } catch (e) {
        return { ok: false, error: errorMessage(e, 'Failed to approve plan') };
    }
}

export async function cancelAiJob(jobId: string): Promise<AgenticLoopResult<JobRead>> {
    try {
        const data = await jobsApi.cancelJob({ jobId });
        return { ok: true, data: fixJobDates(data) };
    } catch (e) {
        return { ok: false, error: errorMessage(e, 'Failed to cancel job') };
    }
}

// Single authenticated path to the result CSV, reused by the progress UI and the
// CSV import page. The generated client applies the bearer token automatically.
export async function getAiJobResultCsv(jobId: string): Promise<string> {
    const { raw } = await jobsApi.getResultCsvRaw({ jobId });
    return raw.text();
}
