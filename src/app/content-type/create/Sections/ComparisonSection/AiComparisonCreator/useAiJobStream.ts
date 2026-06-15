'use client';

import type { JobStatus, SSEStepData } from '@orkg/agentic-loop-client';
import ky from 'ky';
import { isEqual } from 'lodash';
import { parseServerSentEvents } from 'parse-sse';
import { useEffect, useState } from 'react';

import { sseStreamUrl } from '@/services/agenticLoop/client';
import { getAccessToken } from '@/services/backend/backendApi';

export type AiJobStreamState = {
    status: JobStatus | null;
    progressPct: number | null;
    progressMessage: string | null;
    steps: SSEStepData[];
    error: string | null;
    isConnected: boolean;
};

const INITIAL_STATE: AiJobStreamState = {
    status: null,
    progressPct: null,
    progressMessage: null,
    steps: [],
    error: null,
    isConnected: false,
};

const useAiJobStream = (jobId: string | null): AiJobStreamState => {
    const [state, setState] = useState<AiJobStreamState>(INITIAL_STATE);

    useEffect(() => {
        if (!jobId) {
            return undefined;
        }

        const abortController = new AbortController();

        const applyProgress = (data: string) => {
            try {
                const raw = JSON.parse(data);
                // Upstream emits snake_case payloads; map to camelCase.
                const { status } = raw;
                const progressPct: number | null = raw.progress_pct ?? raw.progressPct ?? null;
                const progressMessage: string | null = raw.progress_message ?? raw.progressMessage ?? null;
                const steps: SSEStepData[] = (raw.steps ?? []).map(
                    (s: { step_number?: number; stepNumber?: number; description: string; status: SSEStepData['status'] }) => ({
                        stepNumber: s.step_number ?? s.stepNumber ?? 0,
                        description: s.description,
                        status: s.status,
                    }),
                );

                setState((prev) => {
                    if (
                        prev.isConnected &&
                        prev.error === null &&
                        prev.status === status &&
                        prev.progressPct === progressPct &&
                        prev.progressMessage === progressMessage &&
                        isEqual(prev.steps, steps)
                    ) {
                        return prev;
                    }
                    return { status, progressPct, progressMessage, steps, isConnected: true, error: null };
                });
            } catch {
                // ignore malformed event payloads
            }
        };

        const consumeStream = async () => {
            try {
                const token = await getAccessToken();
                const response = await ky.get(sseStreamUrl(jobId), {
                    signal: abortController.signal,
                    timeout: false,
                    retry: 0,
                    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
                });

                const reader = parseServerSentEvents(response).getReader();
                while (!abortController.signal.aborted) {
                    // eslint-disable-next-line no-await-in-loop
                    const { value, done } = await reader.read();
                    if (done) break;
                    // Upstream also emits plain-text 'error' events — skip them so one bad event can't kill the loop.
                    if (value.type === 'error') continue;
                    applyProgress(value.data);
                }
            } catch (e) {
                if (abortController.signal.aborted) return;
                const message = e instanceof Error ? e.message : 'Stream disconnected';
                setState((prev) => ({ ...prev, isConnected: false, error: message }));
            }
        };

        consumeStream();

        return () => {
            abortController.abort();
        };
    }, [jobId]);

    return state;
};

export default useAiJobStream;
