import useSWR from 'swr';

import { getLlmResponse, nlpServiceUrl } from '@/services/orkgNlp';

type UseLlmSuggestionProps<T> = {
    /** one of LLM_TASK_NAMES — part of the SWR key */
    taskName: string;
    /** the prompt placeholders — part of the SWR key, hashed by value */
    placeholders: Record<string, unknown>;
    /** gates the request, typically `isOpenSmartTooltip && !!label` */
    isEnabled: boolean;
    /**
     * Params that change the derived result but are not sent to the LLM (e.g. the classId that
     * SmartValueSuggestions resolves its resources against). They belong in the key, otherwise two
     * components with the same prompt but a different classId share one cache entry.
     */
    extraKeyParams?: Record<string, unknown>;
    /** post-processing of the raw LLM response, chained inside the fetcher */
    transform?: (llmResponse: any) => T | Promise<T>;
};

/**
 * Fetches a suggestion from the LLM for one of the smart suggestion tooltips.
 *
 * The response is cached per (taskName, placeholders, extraKeyParams): reopening a tooltip without
 * changing its inputs serves the cache instead of calling the model again. `reload` forces a fresh
 * response, which is what the "Try again" and "Reload suggestions" buttons are wired to.
 */
const useLlmSuggestion = <T>({ taskName, placeholders, isEnabled, extraKeyParams, transform }: UseLlmSuggestionProps<T>) => {
    const { data, isLoading, isValidating, error, mutate } = useSWR<T>(
        isEnabled && taskName ? [{ taskName, placeholders, ...extraKeyParams }, nlpServiceUrl, 'getLlmResponse'] : null,
        async ([params]) => {
            const llmResponse = await getLlmResponse({
                taskName: params.taskName as string,
                placeholders: params.placeholders as { [key: string]: string },
            });
            return (transform ? await transform(llmResponse) : llmResponse) as T;
        },
        { shouldRetryOnError: false },
    );

    return {
        data,
        // on a reload SWR keeps the previous data and reports isLoading false, but the tooltips show
        // a spinner while the new response is in flight
        isLoading: isLoading || isValidating,
        isFailed: !!error,
        reload: () => mutate(),
    };
};

export default useLlmSuggestion;
