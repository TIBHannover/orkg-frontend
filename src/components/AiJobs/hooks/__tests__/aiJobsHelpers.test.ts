import type { ExtractionPlan, JobRead, JobStatus } from '@orkg/agentic-loop-client';

import { getAiJobLabel } from '@/components/AiJobs/hooks/useAiJobPlan';
import { computeTransitionToasts, isJobActive, isJobNotable } from '@/components/AiJobs/hooks/useAiJobs';
import { buildSeenMap, isJobUnseen } from '@/components/AiJobs/hooks/useAiJobsUnseen';

const makeJob = (overrides: Partial<JobRead> = {}): JobRead => ({
    id: 'job-1',
    status: 'completed',
    userId: 'user-1',
    error: null,
    progressPct: 100,
    progressMessage: null,
    createdAt: new Date('2026-06-01T10:00:00Z'),
    updatedAt: new Date('2026-06-01T10:30:00Z'),
    ...overrides,
});

describe('isJobActive', () => {
    it('is true for running pipeline statuses only', () => {
        expect(isJobActive(makeJob({ status: 'pending' }))).toBe(true);
        expect(isJobActive(makeJob({ status: 'parsing' }))).toBe(true);
        expect(isJobActive(makeJob({ status: 'planning' }))).toBe(true);
        expect(isJobActive(makeJob({ status: 'executing' }))).toBe(true);
        expect(isJobActive(makeJob({ status: 'awaiting_approval' }))).toBe(false);
        expect(isJobActive(makeJob({ status: 'completed' }))).toBe(false);
        expect(isJobActive(makeJob({ status: 'failed' }))).toBe(false);
        expect(isJobActive(makeJob({ status: 'cancelled' }))).toBe(false);
    });
});

describe('isJobNotable', () => {
    it('is true for finished jobs and jobs needing input', () => {
        expect(isJobNotable(makeJob({ status: 'completed' }))).toBe(true);
        expect(isJobNotable(makeJob({ status: 'failed' }))).toBe(true);
        expect(isJobNotable(makeJob({ status: 'awaiting_approval' }))).toBe(true);
        expect(isJobNotable(makeJob({ status: 'executing' }))).toBe(false);
        expect(isJobNotable(makeJob({ status: 'cancelled' }))).toBe(false);
    });
});

describe('buildSeenMap / isJobUnseen', () => {
    it('only stores notable jobs, keyed by their current status', () => {
        const jobs = [
            makeJob({ id: 'done', status: 'completed' }),
            makeJob({ id: 'review', status: 'awaiting_approval' }),
            makeJob({ id: 'running', status: 'executing' }),
            makeJob({ id: 'gone', status: 'cancelled' }),
        ];
        expect(buildSeenMap(jobs)).toEqual({ done: 'completed', review: 'awaiting_approval' });
    });

    it('counts a notable job as unseen until its status was marked seen', () => {
        const job = makeJob({ id: 'done', status: 'completed' });
        expect(isJobUnseen(job, {})).toBe(true);
        expect(isJobUnseen(job, buildSeenMap([job]))).toBe(false);
    });

    it('re-flags a job seen at awaiting_approval once it completes', () => {
        const awaiting = makeJob({ id: 'job', status: 'awaiting_approval' });
        const seenMap = buildSeenMap([awaiting]);
        expect(isJobUnseen(makeJob({ id: 'job', status: 'completed' }), seenMap)).toBe(true);
    });

    it('never flags active or cancelled jobs', () => {
        expect(isJobUnseen(makeJob({ status: 'executing' }), {})).toBe(false);
        expect(isJobUnseen(makeJob({ status: 'cancelled' }), {})).toBe(false);
    });

    it('prunes jobs that are no longer listed', () => {
        const remaining = makeJob({ id: 'kept', status: 'completed' });
        expect(buildSeenMap([remaining])).toEqual({ kept: 'completed' });
    });
});

describe('computeTransitionToasts', () => {
    const known = (entries: Record<string, JobStatus>) => new Map(Object.entries(entries));

    it('toasts when a job transitions from a running status to a notable one', () => {
        expect(computeTransitionToasts(known({ job: 'executing' }), [makeJob({ id: 'job', status: 'completed' })])).toEqual([
            { kind: 'success', message: 'Your AI comparison is ready' },
        ]);
        expect(computeTransitionToasts(known({ job: 'planning' }), [makeJob({ id: 'job', status: 'awaiting_approval' })])).toEqual([
            { kind: 'success', message: 'Your AI comparison plan is ready for review' },
        ]);
        expect(computeTransitionToasts(known({ job: 'parsing' }), [makeJob({ id: 'job', status: 'failed' })])).toEqual([
            { kind: 'danger', message: 'An AI comparison job failed' },
        ]);
    });

    it('does not toast when the status is unchanged', () => {
        expect(computeTransitionToasts(known({ job: 'completed' }), [makeJob({ id: 'job', status: 'completed' })])).toEqual([]);
    });

    it('does not toast for non-notable statuses', () => {
        expect(computeTransitionToasts(known({ job: 'pending' }), [makeJob({ id: 'job', status: 'executing' })])).toEqual([]);
        expect(computeTransitionToasts(known({ job: 'executing' }), [makeJob({ id: 'job', status: 'cancelled' })])).toEqual([]);
    });

    it('toasts for a job first seen in a notable state (created and finished between polls)', () => {
        expect(computeTransitionToasts(known({}), [makeJob({ id: 'new', status: 'completed' })])).toEqual([
            { kind: 'success', message: 'Your AI comparison is ready' },
        ]);
    });
});

describe('getAiJobLabel', () => {
    it('uses the plan title when available', () => {
        const plan = { title: 'CBT interventions for adolescent anxiety' } as ExtractionPlan;
        expect(getAiJobLabel(makeJob(), plan)).toBe('CBT interventions for adolescent anxiety');
    });

    it('falls back to a date-based label without a plan', () => {
        expect(getAiJobLabel(makeJob())).toBe('AI comparison · 01 Jun 2026');
        expect(getAiJobLabel(makeJob(), null)).toBe('AI comparison · 01 Jun 2026');
    });

    it('falls back when the plan title is empty', () => {
        const plan = { title: '' } as ExtractionPlan;
        expect(getAiJobLabel(makeJob(), plan)).toBe('AI comparison · 01 Jun 2026');
    });
});
