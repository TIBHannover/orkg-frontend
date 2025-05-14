import useSWR from 'swr';

import useParams from '@/components/useParams/useParams';
import { RESOURCES } from '@/constants/graphSettings';
import { getFieldChildren, researchFieldUrl } from '@/services/backend/researchFields';
import { getResource, resourcesUrl } from '@/services/backend/resources';

function useResearchFieldSelector() {
    const { researchFieldId } = useParams();
    const selectedFieldId = researchFieldId ?? RESOURCES.RESEARCH_FIELD_MAIN;

    const { data: _researchFieldChildren, isLoading: isLoadingResearchFieldChildren } = useSWR(
        [{ fieldId: selectedFieldId }, researchFieldUrl, 'getFieldChildren'],
        ([params]) => getFieldChildren(params),
    );
    const researchFields = _researchFieldChildren?.map((field) => field.resource).sort((a, b) => a.label.localeCompare(b.label)) ?? [];

    const { data: resource } = useSWR([selectedFieldId, resourcesUrl, 'getResource'], ([params]) => getResource(params));
    const selectedFieldLabel = resource?.label ?? '';

    return {
        researchFields,

        selectedFieldId,
        selectedFieldLabel,
        isLoadingFields: isLoadingResearchFieldChildren,
    };
}

export default useResearchFieldSelector;
