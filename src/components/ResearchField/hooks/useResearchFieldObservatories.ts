import useSWR from 'swr';

import { RESOURCES } from '@/constants/graphSettings';
import { getObservatories, observatoriesUrl } from '@/services/backend/observatories';

function useResearchFieldObservatories({ researchFieldId }: { researchFieldId: string }) {
    const {
        data: observatories = [],
        isLoading,
        error,
    } = useSWR(
        researchFieldId
            ? [{ researchFieldId: researchFieldId !== RESOURCES.RESEARCH_FIELD_MAIN ? researchFieldId : null }, observatoriesUrl, 'getObservatories']
            : null,
        async ([params]) => (await getObservatories(params)).content,
        { shouldRetryOnError: false },
    );

    return { observatories, isLoading, isFailedLoading: !!error };
}

export default useResearchFieldObservatories;
