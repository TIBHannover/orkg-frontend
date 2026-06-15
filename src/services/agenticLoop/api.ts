import type { ExtractionPlan, JobPlanRead, JobRead } from '@orkg/agentic-loop-client';
import { JobReadFromJSON } from '@orkg/agentic-loop-client';

import { agenticLoopBaseUrl, jobsApi } from '@/services/agenticLoop/client';
import { getAccessToken } from '@/services/backend/backendApi';

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

// JobsApi.createJob() is broken for real file uploads — it joins File objects
// into a comma-separated string inside URLSearchParams. We POST directly with a
// hand-built FormData containing the actual File blobs. The service derives the
// owner from the bearer token, so no user id is sent.
export async function createAiJob(files: File[]): Promise<AgenticLoopResult<JobRead>> {
    try {
        if (files.length === 0) {
            return { ok: false, error: 'No files provided' };
        }

        const body = new FormData();
        for (const file of files) {
            body.append('files', file, file.name);
        }

        const token = await getAccessToken();
        const response = await fetch(`${agenticLoopBaseUrl}/api/jobs/`, {
            method: 'POST',
            body,
            cache: 'no-store',
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });

        if (!response.ok) {
            const text = await response.text();
            return { ok: false, error: `Upload failed (${response.status}): ${text || response.statusText}` };
        }

        const data = fixJobDates(JobReadFromJSON(await response.json()));
        return { ok: true, data };
    } catch (e) {
        return { ok: false, error: errorMessage(e, 'Upload failed') };
    }
}

export async function listAiJobs(): Promise<AgenticLoopResult<JobRead[]>> {
    try {
        const data = await jobsApi.listJobs();
        return { ok: true, data: data.map(fixJobDates) };
    } catch (e) {
        return { ok: false, error: errorMessage(e, 'Failed to load AI comparison jobs') };
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
