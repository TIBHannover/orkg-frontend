import { Configuration, JobsApi } from '@orkg/agentic-loop-client';
import { env } from 'next-runtime-env';

import { getAccessToken } from '@/services/backend/backendApi';

export const agenticLoopBaseUrl = env('NEXT_PUBLIC_AGENTIC_LOOP_API_URL')?.replace(/\/$/, '') ?? '';

// Every endpoint is bearer-authenticated; the generated client adds
// `Authorization: Bearer <token>` to each request via the accessToken callback.
const configuration = new Configuration({
    basePath: agenticLoopBaseUrl,
    accessToken: async () => (await getAccessToken()) ?? '',
    fetchApi: (input, init) => fetch(input, { ...init, cache: 'no-store' }),
});

export const jobsApi = new JobsApi(configuration);

// Direct SSE endpoint on the agentic-loop service. Consumed only by the
// authenticated stream hook, which adds the bearer header (EventSource can't, so
// the stream is read via fetch). CSV downloads go through getAiJobResultCsv.
export const sseStreamUrl = (jobId: string): string => `${agenticLoopBaseUrl}/api/stream/${encodeURIComponent(jobId)}`;
